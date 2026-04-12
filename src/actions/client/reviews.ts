"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export const createReview = async (courtId: string, rating: number, comment: string) => {
  try {
    const session = await auth();
    
    if (!session || !session.user || !session.user.id) {
      return { error: "Bạn cần đăng nhập để thực hiện đánh giá." };
    }

    if (!rating || rating === 0) {
        return { error: "Vui lòng chọn số sao (1-5)." };
    }

    const validBooking = await db.booking.findFirst({
      where: {
        userId: session.user.id,
        courtId: courtId,
        status: { in: ["CHECKED_OUT", "CHECKED_IN"] }, 
        review: null, 
      },
      orderBy: { createdAt: "desc" }
    });

    if (!validBooking) {
      return { error: "Bạn cần có đơn đặt sân đã hoàn thành (hoặc đã nhận sân) tại đây và chưa đánh giá." };
    }

    await db.review.create({
      data: {
        rating,
        comment,
        userId: session.user.id,
        bookingId: validBooking.id,
      },
    });

    revalidatePath(`/courts/${courtId}`);
    
    return { success: "Cảm ơn bạn đã gửi đánh giá!" };
  } catch (error) {
    console.log("[CREATE_REVIEW_ERROR]", error);
    return { error: "Lỗi hệ thống, vui lòng thử lại sau." };
  }
};