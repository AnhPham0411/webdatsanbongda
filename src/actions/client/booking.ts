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
  services: z.string().optional(),
});

export const createBooking = async (values: z.infer<typeof BookingSchema>) => {
  try {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.email) {
      return { error: "Bạn cần đăng nhập để thực hiện đặt sân!" };
    }

    const userId = session.user.id;
    const userEmail = session.user.email;

    const userExists = await db.user.findUnique({ where: { id: userId } });
    if (!userExists) {
      return { error: "Không tìm thấy người dùng trong hệ thống. Vui lòng đăng xuất và đăng nhập lại." };
    }

    const validated = BookingSchema.safeParse(values);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const { courtId, date, timeSlotId, totalPrice, services, ...guestInfo } = validated.data;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(date) < today) {
      return { error: "Không thể đặt lịch trong quá khứ" };
    }
    
    const depositAmount = totalPrice * 0.3;

    const result = await db.$transaction(async (tx) => {
      const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
      const conflictingBooking = await tx.booking.findFirst({
        where: {
          courtId,
          date,
          timeSlotId,
          OR: [
            { status: "CONFIRMED" },
            { 
              status: "PENDING", 
              OR: [
                { createdAt: { gt: tenMinsAgo } },
                { paymentBill: { not: null } } as any
              ]
            }
          ]
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
          voucherId: validated.data.voucherId,
          discountValue: validated.data.discountValue || 0,
          status: "PENDING",
          paymentStatus: "UNPAID",
          ...guestInfo,
        },
        include: {
          court: true
        }
      });
      
      if (services) {
        const selectedServices = JSON.parse(services);
        for (const [serviceId, quantity] of Object.entries(selectedServices)) {
          const service = await tx.extraService.findUnique({
            where: { id: serviceId }
          });
          
          if (service) {
            await tx.bookingExtraService.create({
              data: {
                bookingId: booking.id,
                extraServiceId: service.id,
                quantity: quantity as number,
                priceAtBooking: service.price,
              }
            });
          }
        }
      }

      if (validated.data.voucherId) {
          await tx.voucher.update({
              where: { id: validated.data.voucherId },
              data: { usedCount: { increment: 1 } }
          });
      }

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
        courtName: booking.court?.name || "Sân bóng"
      };
    });

    if (result.success) {
      const formattedPrice = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(totalPrice);

      sendBookingConfirmationEmail(userEmail, {
        courtName: result.courtName, 
        receivedDate: date.toLocaleDateString("vi-VN"),
        returnedDate: date.toLocaleDateString("vi-VN"), 
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

    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: { timeSlot: true }
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

    if (booking.timeSlot) {
      // Lấy cấu hình từ Settings, nếu không có mặc định là 6 giờ
      const settings = await db.settings.findUnique({ where: { id: "system" } });
      const cancelLimitHours = settings?.cancelBeforeHours ?? 6;

      const matchStart = new Date(booking.date);
      const timeStart = new Date(booking.timeSlot.startTime);
      matchStart.setHours(timeStart.getUTCHours(), timeStart.getUTCMinutes(), 0, 0); 
      
      if (matchStart.getTime() - Date.now() < cancelLimitHours * 60 * 60 * 1000) {
         return { error: `Chỉ được phép hủy sân trước giờ đá ${cancelLimitHours} tiếng. Vui lòng liên hệ hotline để được hỗ trợ.` };
      }
    }

    await db.$transaction(async (tx) => {
      // 1. Cập nhật trạng thái đơn hàng và thanh toán (nếu đã trả tiền thì hoàn tiền)
      const isPaid = booking.paymentStatus === "PAID";
      
      await tx.booking.update({
        where: { id: bookingId },
        data: { 
          status: "CANCELLED",
          paymentStatus: isPaid ? "REFUNDED" : booking.paymentStatus
        }
      });

      // 2. Cập nhật bản ghi thanh toán nếu cần
      if (isPaid) {
        await tx.payment.updateMany({
          where: { bookingId },
          data: { status: "REFUNDED" }
        });
      }

      // 3. Hoàn trả lại voucher nếu có sử dụng
      if (booking.voucherId) {
        await tx.voucher.update({
          where: { id: booking.voucherId },
          data: { usedCount: { decrement: 1 } }
        });
      }
    });

    revalidatePath("/my-bookings");
    revalidatePath(`/courts/${booking.courtId}`);
    revalidatePath("/admin/bookings");
    
    return { success: "Đã hủy đơn đặt sân thành công! Sân đã được giải phóng cho khách khác." };
  } catch (error) {
    console.error("CANCEL_ERROR:", error);
    return { error: "Lỗi hệ thống khi hủy đơn!" };
  }
};

export const getAvailableTimeSlots = async (courtId: string, dateStr: string) => {
  try {
    const date = new Date(dateStr);
    const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);

    const timeSlots = await db.timeSlot.findMany({
      orderBy: { startTime: 'asc' }
    });

    const bookings = await db.booking.findMany({
      where: {
        courtId,
        date,
        status: { in: ["PENDING", "CONFIRMED"] }
      }
    });

    return timeSlots.map(slot => {
       const b = bookings.find(b => b.timeSlotId === slot.id);
       let status: "available" | "booked" | "pending" = "available";
       
       if (b) {
          if (b.status === "CONFIRMED") {
            status = "booked";
          } else if (b.status === "PENDING") {
            // Giữ chỗ nếu mới tạo dưới 10p HOẶC đã có ảnh Bill
            if (new Date(b.createdAt) > tenMinsAgo || (b as any).paymentBill) {
               status = "pending";
            }
          }
       }
       
       const sTime = new Date(slot.startTime);
       const eTime = new Date(slot.endTime);
       
       return {
         id: slot.id,
         startTime: `${sTime.getUTCHours().toString().padStart(2,'0')}:${sTime.getUTCMinutes().toString().padStart(2,'0')}`,
         endTime: `${eTime.getUTCHours().toString().padStart(2,'0')}:${eTime.getUTCMinutes().toString().padStart(2,'0')}`,
         status
       };
    });
  } catch (error) {
    console.error("GET_TIME_SLOTS_ERROR", error);
    return [];
  }
};

export const deleteUserBooking = async (bookingId: string) => {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Bạn chưa đăng nhập!" };

    const booking = await db.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) return { error: "Không tìm thấy đơn đặt sân!" };

    if (booking.userId !== session.user.id && session.user.role !== "ADMIN") {
      return { error: "Bạn không có quyền thực hiện hành động này!" };
    }

    // Chỉ cho phép xóa nếu đã xong hoặc đã hủy
    if (!["CHECKED_OUT", "CANCELLED"].includes(booking.status)) {
      return { error: "Chỉ có thể xóa các đơn đã hoàn thành hoặc đã hủy." };
    }

    await db.$transaction(async (tx) => {
      // Xóa các bảng liên quan (nếu schema chưa có cascade hoàn chỉnh)
      await tx.payment.deleteMany({ where: { bookingId } });
      await tx.review.deleteMany({ where: { bookingId } });
      await tx.bookingExtraService.deleteMany({ where: { bookingId } });
      
      await tx.booking.delete({ where: { id: bookingId } });
    });

    revalidatePath("/my-bookings");
    revalidatePath("/admin/bookings");
    
    return { success: "Đã xóa lịch sử đặt sân!" };
  } catch (error) {
    console.error("DELETE_USER_BOOKING_ERROR:", error);
    return { error: "Lỗi hệ thống khi xóa lịch sử!" };
  }
};