"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { BookingStatus, PaymentStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { sendBookingStatusUpdateEmail } from "@/lib/mail"; // 1. Import hàm gửi mail

/**
 * Helper: Kiểm tra quyền hạn người dùng
 */
const checkPermission = async (allowedRoles: string[]) => {
  const session = await auth();
  const userRole = session?.user?.role;

  if (!session?.user || !allowedRoles.includes(userRole)) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
};

/**
 * 1. CẬP NHẬT TRẠNG THÁI ĐẶT PHÒNG
 */
export const updateBookingStatus = async (bookingId: string, status: BookingStatus) => {
  try {
    await checkPermission(["ADMIN", "STAFF"]);

    // Cần lấy email khách hàng để gửi thông báo
    const booking = await db.booking.update({
      where: { id: bookingId },
      data: { status },
      include: { user: true } // Lấy thông tin user liên quan
    });

    // 2. Bắn mail thông báo trạng thái mới (Không dùng await để tránh chậm UI)
    if (booking.user?.email) {
       sendBookingStatusUpdateEmail(booking.user.email, booking.id, status);
    }

    revalidatePath("/admin/bookings");
    return { success: `Đã chuyển trạng thái đơn sang: ${status}` };
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return { error: "Bạn không có quyền thực hiện thao tác này!" };
    }
    return { error: "Lỗi hệ thống khi cập nhật trạng thái đơn hàng!" };
  }
};

/**
 * 2. CẬP NHẬT THANH TOÁN
 */
export const updatePaymentStatus = async (bookingId: string, paymentStatus: PaymentStatus) => {
  try {
    await checkPermission(["ADMIN", "STAFF"]);

    await db.$transaction(async (tx) => {
      const booking = await tx.booking.update({
        where: { id: bookingId },
        data: { paymentStatus },
        include: { user: true }
      });

      const existingPayment = await tx.payment.findUnique({
        where: { bookingId },
      });

      if (existingPayment) {
        await tx.payment.update({
          where: { bookingId },
          data: { status: paymentStatus },
        });
      } else if (paymentStatus === "PAID") {
        await tx.payment.create({
          data: {
            bookingId,
            amount: booking.totalPrice,
            provider: "CASH_AT_COUNTER",
            status: "PAID",
            transactionCode: `CASH-${bookingId.slice(-6).toUpperCase()}-${Date.now()}`,
          },
        });
      }

      // 3. Bắn mail thông báo thanh toán thành công nếu chuyển sang trạng thái PAID
      if (paymentStatus === "PAID" && booking.user?.email) {
        sendBookingStatusUpdateEmail(booking.user.email, booking.id, "ĐÃ THANH TOÁN");
      }
    });

    revalidatePath("/admin/bookings");
    return { success: "Cập nhật dữ liệu thanh toán thành công!" };
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return { error: "Bạn không có quyền cập nhật tài chính!" };
    }
    console.error("[PAYMENT_ACTION_ERROR]", error);
    return { error: "Lỗi khi xử lý giao dịch thanh toán!" };
  }
};

/**
 * 3. XÓA ĐƠN ĐẶT PHÒNG
 */
export const deleteBooking = async (bookingId: string) => {
  try {
    await checkPermission(["ADMIN"]);

    await db.booking.delete({
      where: { id: bookingId },
    });

    revalidatePath("/admin/bookings");
    return { success: "Đã xóa vĩnh viễn đơn đặt phòng!" };
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return { error: "Từ chối: Bạn cần quyền Quản trị viên để xóa dữ liệu!" };
    }
    return { error: "Không thể xóa đơn này!" };
  }
};