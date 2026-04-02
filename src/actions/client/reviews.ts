"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth"; // ⚠️ Kiểm tra lại đường dẫn import auth của bạn (có thể là @/lib/auth)
import { revalidatePath } from "next/cache";

export const createReview = async (roomId: string, rating: number, comment: string) => {
  try {
    // 1. Kiểm tra session đăng nhập
    const session = await auth();
    
    if (!session || !session.user || !session.user.id) {
      return { error: "Bạn cần đăng nhập để thực hiện đánh giá." };
    }

    if (!rating || rating === 0) {
        return { error: "Vui lòng chọn số sao (1-5)." };
    }

    // 2. Tìm đơn đặt phòng hợp lệ để gắn review
    // Logic: 
    // - Của chính user này (userId)
    // - Tại phòng này (roomId)
    // - Trạng thái: Đã check-out hoặc Đang ở (CHECKED_IN) -> Tùy chính sách bên bạn
    // - Chưa từng có review (review: null)
    const validBooking = await db.booking.findFirst({
      where: {
        userId: session.user.id,
        roomId: roomId,
        status: { in: ["CHECKED_OUT", "CHECKED_IN"] }, 
        review: null, 
      },
      orderBy: { createdAt: "desc" } // Lấy đơn gần nhất
    });

    if (!validBooking) {
      return { error: "Bạn cần có đơn đặt phòng đã hoàn thành (hoặc đang ở) tại đây và chưa đánh giá." };
    }

    // 3. Tạo Review trong Database
    await db.review.create({
      data: {
        rating,
        comment,
        userId: session.user.id,
        bookingId: validBooking.id, // Gắn vào booking vừa tìm được
      },
    });

    // 4. Revalidate để trang chi tiết phòng cập nhật ngay lập tức
    revalidatePath(`/rooms/${roomId}`);
    
    return { success: "Cảm ơn bạn đã gửi đánh giá!" };
  } catch (error) {
    console.log("[CREATE_REVIEW_ERROR]", error);
    return { error: "Lỗi hệ thống, vui lòng thử lại sau." };
  }
};