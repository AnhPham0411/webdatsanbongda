"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth"; // Kiểm tra đường dẫn auth
import { revalidatePath } from "next/cache";

export const toggleWishlist = async (roomId: string) => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { error: "Vui lòng đăng nhập để lưu phòng yêu thích!" };
    }

    const userId = session.user.id;

    // 1. Kiểm tra xem đã like chưa
    const existingWishlist = await db.wishlist.findUnique({
      where: {
        userId_roomId: {
          userId,
          roomId,
        },
      },
    });

    if (existingWishlist) {
      // 2. Nếu có rồi -> Xóa (Unlike)
      await db.wishlist.delete({
        where: {
          id: existingWishlist.id,
        },
      });
      revalidatePath("/"); // Refresh lại dữ liệu
      revalidatePath("/wishlist");
      return { success: "Đã xóa khỏi danh sách yêu thích", isLiked: false };
    } else {
      // 3. Nếu chưa có -> Tạo mới (Like)
      await db.wishlist.create({
        data: {
          userId,
          roomId,
        },
      });
      revalidatePath("/");
      revalidatePath("/wishlist");
      return { success: "Đã thêm vào danh sách yêu thích", isLiked: true };
    }
  } catch (error) {
    console.log("[TOGGLE_WISHLIST]", error);
    return { error: "Lỗi hệ thống" };
  }
};