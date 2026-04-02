"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth"; // ✅ Import Auth để check quyền

export const getCalendarBookings = async (start: Date, end: Date) => {
  try {
    // 1. Kiểm tra quyền: Cả ADMIN và STAFF đều được xem lịch vận hành
    const session = await auth();
    const role = session?.user?.role;

    if (role !== "ADMIN" && role !== "STAFF") {
      return { error: "Bạn không có quyền xem dữ liệu này!" };
    }

    const bookings = await db.booking.findMany({
      where: {
        OR: [
          {
            checkIn: { lte: end },
            checkOut: { gte: start },
          },
        ],
        status: {
          not: "CANCELLED"
        }
      },
      select: {
        id: true,
        checkIn: true,
        checkOut: true,
        status: true,
        guestName: true,
        room: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const events = bookings.map((booking) => ({
      id: booking.id,
      title: `${booking.room.name} - ${booking.guestName || "Khách"}`,
      start: booking.checkIn,
      end: booking.checkOut,
      resourceId: booking.room.id,
      status: booking.status,
    }));

    return { events };
  } catch (error) {
    console.error("[GET_CALENDAR_ERROR]", error);
    return { error: "Lỗi lấy dữ liệu lịch!" };
  }
};