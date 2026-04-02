"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const CourtSchema = z.object({
  name: z.string().min(1, "Tên sân không được để trống"),
  courtTypeId: z.string().min(1, "Vui lòng chọn loại sân"),
  isAvailable: z.boolean(),
  images: z.object({ 
    url: z.string().min(1, "URL ảnh không hợp lệ") 
  }).array(), 
});

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

    revalidatePath("/admin/courts");
    revalidatePath("/search");
    return { success: "Tạo sân thành công!" };
  } catch (error) {
    return { error: "Lỗi hệ thống!" };
  }
};

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
