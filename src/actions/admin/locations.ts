"use server";

import * as z from "zod";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

const LocationSchema = z.object({
  name: z.string().min(1, "Tên không được để trống"),
  address: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
});

const checkAdmin = async () => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
};

export const createLocation = async (values: z.infer<typeof LocationSchema>) => {
  try {
    await checkAdmin();

    const validatedFields = LocationSchema.safeParse(values);
    if (!validatedFields.success) return { error: "Dữ liệu không hợp lệ!" };

    await db.location.create({
      data: { ...validatedFields.data },
    });

    revalidatePath("/admin/locations");
    return { success: "Tạo cụm sân thành công!" };
  } catch (error: any) {
    if (error.message === "Unauthorized") return { error: "Bạn không có quyền thực hiện hành động này!" };
    return { error: "Lỗi hệ thống, vui lòng thử lại." };
  }
};

export const updateLocation = async (id: string, values: z.infer<typeof LocationSchema>) => {
  try {
    await checkAdmin();

    const validatedFields = LocationSchema.safeParse(values);
    if (!validatedFields.success) return { error: "Dữ liệu không hợp lệ!" };

    await db.location.update({
      where: { id },
      data: { ...validatedFields.data },
    });

    revalidatePath("/admin/locations");
    return { success: "Cập nhật cụm sân thành công!" };
  } catch (error: any) {
    if (error.message === "Unauthorized") return { error: "Bạn không có quyền thực hiện hành động này!" };
    return { error: "Lỗi hệ thống, vui lòng thử lại." };
  }
};

export const deleteLocation = async (id: string) => {
  try {
    await checkAdmin();

    await db.location.delete({
      where: { id },
    });

    revalidatePath("/admin/locations");
    return { success: "Đã xóa cụm sân." };
  } catch (error: any) {
    if (error.message === "Unauthorized") return { error: "Bạn không có quyền thực hiện hành động này!" };
    return { error: "Không thể xóa (có thể do đang có sân thuộc cụm sân này)." };
  }
};