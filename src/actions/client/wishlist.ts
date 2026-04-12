"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export const toggleWishlist = async (courtId: string) => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { error: "Vui lòng đăng nhập để lưu sân bóng yêu thích!" };
    }

    const userId = session.user.id;

    const existingWishlist = await db.wishlist.findUnique({
      where: {
        userId_courtId: {
          userId,
          courtId: courtId,
        },
      },
    });

    if (existingWishlist) {
      await db.wishlist.delete({
        where: {
          id: existingWishlist.id,
        },
      });
      revalidatePath("/");
      revalidatePath("/wishlist");
      return { success: "Đã xóa khỏi danh sách yêu thích", isLiked: false };
    } else {
      await db.wishlist.create({
        data: {
          userId,
          courtId: courtId,
        },
      });
      revalidatePath("/");
      revalidatePath("/wishlist");
      return { success: "Đã thêm vào danh sách yêu thích", isLiked: true };
    }
  } catch (error) {
    console.log("[TOGGLE_WISHLIST_ERROR]", error);
    return { error: "Lỗi hệ thống khi xử lý yêu thích" };
  }
};