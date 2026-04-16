"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export const updateUserLanguage = async (locale: string) => {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Không tìm thấy người dùng" };

    await db.user.update({
      where: { id: session.user.id },
      data: { language: locale },
    });

    return { success: true };
  } catch (error) {
    return { error: "Lỗi cập nhật ngôn ngữ" };
  }
};
