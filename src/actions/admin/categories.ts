"use server";

import * as z from "zod";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth"; // Đảm bảo import đúng cấu hình auth

// 1. Schema (Giữ nguyên)
const CategorySchema = z.object({
  name: z.string().min(1, { message: "Tên không được để trống" }),
  locationId: z.string().min(1, { message: "Vui lòng chọn vị trí/khách sạn" }),
  description: z.string().optional(),
  basePrice: z.coerce.number().min(0, { message: "Giá không được âm" }),
  capacity: z.coerce.number().min(1, { message: "Sức chứa tối thiểu là 1 người" }),
  amenities: z.array(z.string()).optional(),
});

// Helper kiểm tra quyền Admin
const checkAdmin = async () => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
};

export const createCategory = async (values: z.infer<typeof CategorySchema>) => {
  try {
    // CHẶN QUYỀN: Chỉ Admin mới được tạo loại phòng
    await checkAdmin();

    const validatedFields = CategorySchema.safeParse(values);
    if (!validatedFields.success) {
      return { error: "Dữ liệu không hợp lệ! Vui lòng kiểm tra lại." };
    }

    const { amenities, locationId, ...data } = validatedFields.data;

    await db.roomType.create({
      data: {
        ...data,
        location: {
          connect: { id: locationId }
        },
        amenities: {
          connect: amenities?.map((id) => ({ id })) || [],
        },
      },
    });

    revalidatePath("/admin/categories");
    return { success: "Tạo loại phòng thành công!" };
  } catch (error: any) {
    if (error.message === "Unauthorized") return { error: "Bạn không có quyền thực hiện hành động này!" };
    console.log("CREATE_CATEGORY_ERROR", error);
    return { error: "Lỗi hệ thống, vui lòng thử lại." };
  }
};

export const updateCategory = async (
  id: string,
  values: z.infer<typeof CategorySchema>
) => {
  try {
    // CHẶN QUYỀN: Chỉ Admin mới được sửa thông tin loại phòng
    await checkAdmin();

    const validatedFields = CategorySchema.safeParse(values);
    if (!validatedFields.success) {
      return { error: "Dữ liệu không hợp lệ!" };
    }

    const { amenities, locationId, ...data } = validatedFields.data;

    await db.roomType.update({
      where: { id },
      data: {
        ...data,
        location: {
          connect: { id: locationId }
        },
        amenities: {
          set: amenities?.map((id) => ({ id })) || [],
        },
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath(`/admin/categories/${id}`); 
    return { success: "Cập nhật loại phòng thành công!" };
  } catch (error: any) {
    if (error.message === "Unauthorized") return { error: "Bạn không có quyền thực hiện hành động này!" };
    console.log("UPDATE_CATEGORY_ERROR", error);
    return { error: "Lỗi hệ thống, vui lòng thử lại." };
  }
};

export const deleteCategory = async (id: string) => {
  try {
    // CHẶN QUYỀN: Chỉ Admin mới được xóa
    await checkAdmin();

    const existingRooms = await db.room.findFirst({
        where: { roomTypeId: id }
    });

    if (existingRooms) {
        return { error: "Không thể xóa! Đang có phòng thuộc loại này." };
    }

    await db.roomType.delete({
      where: { id },
    });

    revalidatePath("/admin/categories");
    return { success: "Đã xóa loại phòng." };
  } catch (error: any) {
    if (error.message === "Unauthorized") return { error: "Bạn không có quyền thực hiện hành động này!" };
    console.log("DELETE_CATEGORY_ERROR", error);
    return { error: "Lỗi hệ thống! Không thể xóa." };
  }
};