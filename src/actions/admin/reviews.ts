"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth"; // ✅ Import Auth để check quyền

/**
 * Hành động: Trả lời đánh giá (Cả ADMIN và STAFF đều được làm)
 */
export const replyToReview = async (reviewId: string, replyText: string) => {
  try {
    // 1. Kiểm tra quyền: ADMIN hoặc STAFF
    const session = await auth();
    const role = session?.user?.role;

    if (role !== "ADMIN" && role !== "STAFF") {
      return { error: "Bạn không có quyền thực hiện hành động này!" };
    }

    // 2. Validate dữ liệu đầu vào
    if (!reviewId) {
      return { error: "Không tìm thấy ID đánh giá." };
    }

    if (!replyText || replyText.trim().length === 0) {
      return { error: "Nội dung phản hồi không được để trống." };
    }

    // 3. Kiểm tra review có tồn tại không
    const review = await db.review.findUnique({
        where: { id: reviewId }
    });

    if (!review) {
        return { error: "Đánh giá này không còn tồn tại." };
    }

    // 4. Cập nhật nội dung trả lời
    await db.review.update({
      where: { id: reviewId },
      data: {
        adminReply: replyText,
        repliedAt: new Date(),
      },
    });

    revalidatePath("/admin/reviews");
    
    return { success: "Đã gửi phản hồi thành công!" };
  } catch (error) {
    console.log("[REPLY_REVIEW_ERROR]", error);
    return { error: "Lỗi hệ thống, vui lòng thử lại sau." };
  }
};

/**
 * Hành động: Xóa đánh giá (CHỈ ADMIN MỚI ĐƯỢC QUYỀN XÓA)
 */
export const deleteReview = async (reviewId: string) => {
  try {
    // 1. Kiểm tra quyền: CHỈ ADMIN
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return { error: "Từ chối: Chỉ Quản trị viên mới có quyền xóa đánh giá!" };
    }

    if (!reviewId) {
        return { error: "ID không hợp lệ." };
    }

    await db.review.delete({
      where: { id: reviewId },
    });

    revalidatePath("/admin/reviews");
    return { success: "Đã xóa đánh giá thành công." };
  } catch (error) {
    console.log("[DELETE_REVIEW_ERROR]", error);
    return { error: "Không thể xóa đánh giá này." };
  }
};