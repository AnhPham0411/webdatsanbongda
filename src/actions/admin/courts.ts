/**
 * @file courts.ts
 * @description Các Server Actions xử lý logic nghiệp vụ cho việc quản lý sân bóng (Admin).
 * Bao gồm các thao tác: Thêm, Xửa, Xóa và Thay đổi trạng thái sân.
 */
"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { broadcastNotification } from "@/actions/client/notifications";

const CourtSchema = z.object({
  name: z.string().min(1, "Tên sân không được để trống"),
  courtTypeId: z.string().min(1, "Vui lòng chọn loại sân"),
  isAvailable: z.boolean(),
  images: z.object({ 
    url: z.string().min(1, "URL ảnh không hợp lệ") 
  }).array(), 
});

/**
 * Tạo sân bóng mới.
 * @param values Dữ liệu từ form đã qua validation.
 */
export const createCourt = async (values: z.infer<typeof CourtSchema>) => {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return { error: "Bạn không có quyền tạo sân mới!" };

    const validatedFields = CourtSchema.safeParse(values);
    if (!validatedFields.success) return { error: "Dữ liệu không hợp lệ!" };

    const { images, ...data } = validatedFields.data;

    await db.court.create({
      data: {
        ...data,
        images: {
          createMany: { data: images },
        },
      },
    });

    // Tự động thông báo cho tất cả người dùng về sân mới
    await broadcastNotification({
        title: "Sân bóng mới đã được thêm! ⚽",
        message: `Chúng tôi vừa đưa vào hoạt động sân "${values.name}". Hãy trải nghiệm ngay!`,
        type: "NEWS",
        link: "/search"
    });

    revalidatePath("/admin/courts");
    revalidatePath("/search");
    return { success: "Tạo sân thành công và đã gửi thông báo!" };
  } catch (error) {
    return { error: "Lỗi hệ thống!" };
  }
};

/**
 * Cập nhật thông tin sân bóng hiện có.
 * @param id ID của sân cần cập nhật.
 * @param values Dữ liệu mới từ form.
 */
export const updateCourt = async (id: string, values: z.infer<typeof CourtSchema>) => {
  try {
    const session = await auth();
    const role = session?.user?.role;

    if (role !== "ADMIN" && role !== "STAFF") return { error: "Bạn không có quyền chỉnh sửa thông tin sân!" };

    const validatedFields = CourtSchema.safeParse(values);
    if (!validatedFields.success) return { error: "Dữ liệu không hợp lệ!" };

    const { images, ...data } = validatedFields.data;
    
    await db.court.update({
      where: { id },
      data: {
        ...data,
        images: {
          deleteMany: {},
          createMany: { data: images }
        },
      },
    });

    revalidatePath(`/admin/courts/${id}`);
    revalidatePath("/admin/courts");
    revalidatePath("/search");
    return { success: "Cập nhật sân thành công!" };
  } catch (error) {
    return { error: "Lỗi hệ thống!" };
  }
};

/**
 * Xóa sân bóng khỏi hệ thống.
 * @param id ID của sân cần xóa.
 */
export const deleteCourt = async (id: string) => {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return { error: "Từ chối: Chỉ Quản trị viên mới có quyền xóa sân!" };

    await db.court.delete({ where: { id } });

    revalidatePath("/admin/courts");
    revalidatePath("/search");
    return { success: "Đã xóa sân thành công!" };
  } catch (error) {
    return { error: "Không thể xóa sân đang có dữ liệu liên kết!" };
  }
};

/**
 * Thay đổi trạng thái "Sẵn sàng" của sân bóng.
 * @param id ID của sân.
 * @param currentStatus Trạng thái hiện tại.
 */
export const toggleCourtAvailability = async (id: string, currentStatus: boolean) => {
  try {
    const session = await auth();
    const role = session?.user?.role;
    if (role !== "ADMIN" && role !== "STAFF") return { error: "Bạn không có quyền thay đổi trạng thái sân!" };

    await db.court.update({
      where: { id },
      data: { isAvailable: !currentStatus }
    });

    revalidatePath("/admin/courts");
    revalidatePath("/search");
    return { success: `Đã ${!currentStatus ? "bật" : "tắt"} sẵn sàng!` };
  } catch (error) {
    return { error: "Lỗi hệ thống khi cập nhật trạng thái!" };
  }
};

