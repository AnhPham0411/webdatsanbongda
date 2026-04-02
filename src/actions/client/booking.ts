"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { sendBookingConfirmationEmail } from "@/lib/mail";

const BookingSchema = z.object({
  courtId: z.string(),
  date: z.coerce.date(),
  timeSlotId: z.string(),
  guestName: z.string().min(1, "Vui lòng nhập tên khách hàng"),
  guestPhone: z.string().min(9, "Số điện thoại không hợp lệ"),
  guestEmail: z.string().email("Email không hợp lệ"),
  note: z.string().optional(),
  totalPrice: z.number().min(0),
  voucherId: z.string().nullable().optional(),
  discountValue: z.number().optional(),
});

export const createBooking = async (values: z.infer<typeof BookingSchema>) => {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.email) {
      return { error: "Bạn cần đăng nhập để thực hiện đặt sân!" };
    }

    const userId = session.user.id;
    const userEmail = session.user.email;

    const validated = BookingSchema.safeParse(values);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const { courtId, date, timeSlotId, totalPrice, ...guestInfo } = validated.data;
    
    // Deposit calculation
    const depositAmount = totalPrice * 0.3;

    const result = await db.$transaction(async (tx) => {
      // KIỂM TRA TRÙNG LỊCH (ANTI-RACE CONDITION)
      const conflictingBooking = await tx.booking.findFirst({
        where: {
          courtId,
          date,
          timeSlotId,
          status: { 
            in: ["PENDING", "CONFIRMED"] 
          },
        },
      });

      if (conflictingBooking) {
        throw new Error("Khung giờ này đã được đặt hoặc đang giữ chỗ. Vui lòng chọn giờ khác.");
      }

      const booking = await tx.booking.create({
        data: {
          userId,
          courtId,
          date,
          timeSlotId,
          totalPrice,
          depositAmount,
          status: "PENDING",
          paymentStatus: "UNPAID",
          ...guestInfo,
        },
        include: {
          court: true
        }
      });

      await tx.payment.create({
        data: {
          bookingId: booking.id,
          amount: totalPrice,
          provider: "CASH_AT_COUNTER",
          status: "UNPAID",
          transactionCode: `TRX-${Date.now()}-${booking.id.slice(-4).toUpperCase()}`,
        },
      });

      return { 
        success: true, 
        bookingId: booking.id, 
        courtName: booking.court.name 
      };
    });

    if (result.success) {
      const formattedPrice = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(totalPrice);

      sendBookingConfirmationEmail(userEmail, {
        roomName: result.courtName, 
        checkIn: date.toLocaleDateString("vi-VN"),
        checkOut: date.toLocaleDateString("vi-VN"), 
        totalPrice: formattedPrice,
      }).catch((err) => console.error("MAIL_ERROR:", err));
    }

    revalidatePath(`/courts/${courtId}`);
    revalidatePath("/my-bookings");
    revalidatePath("/admin/bookings");

    return { success: "Đặt sân thành công!", bookingId: result.bookingId };

  } catch (error: any) {
    console.error("CREATE_BOOKING_ERROR:", error);
    return { error: error.message || "Đã xảy ra lỗi hệ thống, vui lòng thử lại sau." };
  }
};

export const cancelBooking = async (bookingId: string) => {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Bạn chưa đăng nhập!" };

    // Use findFirst since unique is ID
    const booking = await db.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) return { error: "Không tìm thấy đơn đặt sân!" };

    const isOwner = booking.userId === session.user.id;
    const isAdmin = session.user?.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return { error: "Bạn không có quyền hủy đơn này!" };
    }

    if (["CANCELLED"].includes(booking.status)) {
      return { error: "Không thể hủy đơn đã hoàn thành hoặc đã hủy trước đó." };
    }

    await db.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" }
    });

    revalidatePath("/my-bookings");
    revalidatePath(`/courts/${booking.courtId}`);
    revalidatePath("/admin/bookings");
    
    return { success: "Đã hủy đơn đặt sân thành công!" };
  } catch (error) {
    console.error("CANCEL_ERROR:", error);
    return { error: "Lỗi hệ thống khi hủy đơn!" };
  }
};