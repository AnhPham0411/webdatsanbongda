"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Định nghĩa lại type cho chặt chẽ
interface UpdateProfileData {
  name: string;
  phone?: string; 
}

export async function updateProfile(data: UpdateProfileData) {
  const session = await auth();

  if (!session?.user) {
    return { error: "Bạn chưa đăng nhập" };
  }

  // 👇 DEBUG: Thêm dòng này để kiểm tra xem server nhận được gì
  console.log("SERVER ACTION RECEIVED:", data); 

  try {
    await db.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        // Logic xử lý: Nếu phone là chuỗi rỗng "" thì lưu là null hoặc giữ nguyên chuỗi rỗng tùy ý bạn
        phone: data.phone && data.phone.trim() !== "" ? data.phone : null,
      },
    });

    revalidatePath("/profile"); // Quan trọng: Xóa cache để UI cập nhật
    return { success: true };
  } catch (error) {
    console.error("DB UPDATE ERROR:", error); // 👇 In lỗi chi tiết ra terminal
    return { error: "Lỗi khi cập nhật database" };
  }
}