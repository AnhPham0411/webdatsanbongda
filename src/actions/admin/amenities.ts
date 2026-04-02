"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
// import { AmenitySchema } from "@/schemas"; // Import schema của bạn

const AmenitySchema = z.object({
  name: z.string().min(1),
  icon: z.string().optional(),
});

export const createAmenity = async (values: z.infer<typeof AmenitySchema>) => {
  try {
    // Check Admin Role here...
    
    const validatedFields = AmenitySchema.safeParse(values);
    if (!validatedFields.success) return { error: "Dữ liệu không hợp lệ!" };

    await db.amenity.create({
      data: {
        name: validatedFields.data.name,
        icon: validatedFields.data.icon,
      },
    });

    revalidatePath("/admin/amenities");
    return { success: "Đã thêm tiện nghi mới!" };
  } catch (error) {
    return { error: "Lỗi Server!" };
  }
};

export const updateAmenity = async (id: string, values: z.infer<typeof AmenitySchema>) => {
  try {
    const validatedFields = AmenitySchema.safeParse(values);
    if (!validatedFields.success) return { error: "Dữ liệu không hợp lệ!" };

    await db.amenity.update({
      where: { id },
      data: { ...validatedFields.data },
    });

    revalidatePath("/admin/amenities");
    return { success: "Đã cập nhật tiện nghi!" };
  } catch (error) {
    return { error: "Lỗi cập nhật!" };
  }
};

export const deleteAmenity = async (id: string) => {
  try {
    await db.amenity.delete({
      where: { id },
    });

    revalidatePath("/admin/amenities");
    return { success: "Đã xóa tiện nghi!" };
  } catch (error) {
    return { error: "Lỗi xóa dữ liệu!" };
  }
};