/**
 * @file bookings.ts
 * @description Server Actions xử lý logic quản lý đơn đặt sân của khách hàng.
 * Bao gồm: Cập nhật trạng thái đơn (Xác nhận/Hủy), trạng thái thanh toán và xóa đơn.
 */
"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { BookingStatus, PaymentStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { sendBookingStatusUpdateEmail } from "@/lib/mail";

/**
 * Hàm kiểm tra quyền truy cập của người dùng.
 * @param allowedRoles Danh sách các vai trò được phép thực hiện hành động.
 */
const checkPermission = async (allowedRoles: string[]) => {
  const session = await auth();
  const userRole = session?.user?.role;

  if (!session?.user || !userRole || !allowedRoles.includes(userRole)) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
};

/**
 * Cập nhật trạng thái của một đơn đặt sân (VD: PENDING -> CONFIRMED).
 * Gửi email thông báo cho khách hàng khi có thay đổi.
 */
export const updateBookingStatus = async (bookingId: string, status: BookingStatus) => {
  try {
    await checkPermission(["ADMIN", "STAFF"]);

    const booking = await db.booking.update({
      where: { id: bookingId },
      data: { status },
      include: { user: true }
    });

    if (booking.user?.email) {
       sendBookingStatusUpdateEmail(booking.user.email, booking.id, status);
    }

    revalidatePath("/admin/bookings");
    revalidatePath("/my-bookings");
    return { success: `Đã cập nhật trạng thái đơn đặt sân: ${status}` };
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return { error: "Bạn không có quyền thực hiện thao tác này!" };
    }
    return { error: "Lỗi hệ thống khi cập nhật trạng thái!" };
  }
};

/**
 * Cập nhật trạng thái thanh toán và tạo bản ghi giao dịch (Payment).
 * Sử dụng Database Transaction để đảm bảo tính toàn vẹn dữ liệu.
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

      if (paymentStatus === "PAID" && booking.user?.email) {
        sendBookingStatusUpdateEmail(booking.user.email, booking.id, "ĐÃ THANH TOÁN");
      }
    });

    revalidatePath("/admin/bookings");
    revalidatePath("/my-bookings");
    return { success: "Cập nhật thanh toán thành công!" };
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return { error: "Bạn không có quyền cập nhật tài chính!" };
    }
    console.error("[PAYMENT_ACTION_ERROR]", error);
    return { error: "Lỗi khi xử lý giao dịch!" };
  }
};

/**
 * Xóa vĩnh viễn một đơn đặt sân và các dữ liệu liên quan (Thanh toán, Đánh giá).
 * Chỉ dành cho Quản trị viên cao cấp.
 */
export const deleteBooking = async (bookingId: string) => {
  try {
    await checkPermission(["ADMIN"]);

    await db.$transaction(async (tx) => {
      await tx.payment.deleteMany({
        where: { bookingId },
      });

      await tx.review.deleteMany({
        where: { bookingId },
      });

      await tx.booking.delete({
        where: { id: bookingId },
      });
    });

    revalidatePath("/admin/bookings");
    revalidatePath("/my-bookings");
    return { success: "Đã xóa vĩnh viễn đơn đặt sân!" };
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return { error: "Bạn cần quyền Quản trị viên để xóa dữ liệu!" };
    }
    console.error("[DELETE_BOOKING_ERROR]", error);
    return { error: "Không thể xóa đơn đặt sân này!" };
  }
};