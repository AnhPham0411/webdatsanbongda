"use server";

import { db } from "@/lib/db";
import { SafeRoom } from "@/types";
import { auth } from "@/lib/auth";

interface GetRoomsParams {
  category?: string;
  guests?: number;
  startDate?: string;
  endDate?: string;
  sort?: string;
  locationId?: string; 
}

// =============================================================================
// 1. LẤY DANH SÁCH SÂN (Trang chủ & Tìm kiếm)
// =============================================================================
export const getRooms = async ({
  category,
  guests,
  startDate,
  endDate,
  sort,
  locationId,
}: GetRoomsParams): Promise<any[]> => {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    // --- XÂY DỰNG ĐIỀU KIỆN LỌC (WHERE) ---
    const where: any = {
      isAvailable: true, 
    };

    where.courtType = {
      ...(category && category !== "all" && { name: { contains: category } }),
      ...(guests && { capacity: { gte: guests } }),
    };

    if (locationId && locationId !== "all") {
       where.courtType = {
         ...where.courtType,
         locationId: locationId,
       };
    }

    let startQuery: Date;
    let endQuery: Date;

    if (startDate && endDate) {
      startQuery = new Date(startDate);
      endQuery = new Date(endDate);
    } else {
      const now = new Date();
      startQuery = new Date(now); 
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      endQuery = tomorrow;
    }

    // Lọc trùng lịch - dùng Booking của Court
    /* (Tạm thời tắt bộ lọc trùng lịch nâng cao cho đến khi có cơ chế TimeSlot hoàn chỉnh, 
        hiện tại Booking model dựa vào date và timeSlotId)
    */

    let orderBy: any = { createdAt: "desc" };

    if (sort === "price_asc") {
      orderBy = { courtType: { basePrice: "asc" } };
    } else if (sort === "price_desc") {
      orderBy = { courtType: { basePrice: "desc" } };
    }

    // --- TRUY VẤN SÂN BÓNG MỚI (Court) ---
    const rawCourts = await db.court.findMany({
      where,
      include: {
        images: true,
        courtType: {
          include: {
            sport: true,
            location: true,
          },
        },
        bookings: {
          where: { review: { isNot: null } },
          select: { review: { select: { rating: true } } },
        },
        wishlists: userId ? { where: { userId } } : false,
      },
      orderBy: orderBy,
    });

    // --- CHUYỂN ĐỔI DỮ LIỆU ĐỂ TƯƠNG THÍCH MAP UI CŨ ---
    return rawCourts.map((court) => {
      const reviews = court.bookings.map((b) => b.review).filter((r) => r !== null);
      
      const { bookings, wishlists, ...rest } = court;

      return {
        ...rest,
        createdAt: court.createdAt.toISOString(),
        roomType: {
          ...court.courtType,
          basePrice: court.courtType.basePrice.toNumber(),
        },
        reviews: reviews,
        isLiked: wishlists && wishlists.length > 0,
      };
    });
  } catch (error) {
    console.error("GET_ROOMS_ERROR", error);
    return [];
  }
};

// =============================================================================
// 2. LẤY CHI TIẾT 1 SÂN
// =============================================================================
export const getRoomById = async (roomId: string) => {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const court = await db.court.findUnique({
      where: { id: roomId },
      include: {
        images: true,
        courtType: {
          include: {
            sport: true,
            location: true,
            courts: { 
                where: { isAvailable: true, id: { not: roomId } }, 
                take: 4,
                select: { id: true } 
            },
          },
        },
        wishlists: userId ? { where: { userId } } : false,
      },
    });

    if (!court) return null;

    const reviews = await db.review.findMany({
      where: { booking: { courtId: roomId } },
      include: { user: { select: { name: true, image: true } } },
      orderBy: { createdAt: "desc" },
    });

    const { wishlists, ...rest } = court;

    return {
      ...rest,
      id: court.id,
      createdAt: court.createdAt.toISOString(),
      roomType: {
        ...court.courtType,
        basePrice: court.courtType.basePrice.toNumber(),
      },
      reviews: reviews.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
      })),
      isLiked: wishlists && wishlists.length > 0,
    };
  } catch (error) {
    console.error("GET_ROOM_BY_ID_ERROR", error);
    return null;
  }
};

// =============================================================================
// 3. LẤY NHIỀU SÂN THEO ID
// =============================================================================
export const getRoomsByIds = async (ids: string[]) => {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!ids || ids.length === 0) return [];

    const rawCourts = await db.court.findMany({
      where: { id: { in: ids } },
      include: {
        courtType: {
          include: {
            sport: true,
            location: true,
          }
        },
        images: true,
        bookings: {
          where: { review: { isNot: null } },
          select: { review: { include: { user: true } } }
        },
        wishlists: userId ? { where: { userId } } : false,
      }
    });

    return rawCourts.map((court) => {
      const reviews = court.bookings.map(b => b.review).filter(r => r !== null);
      const { bookings, wishlists, ...rest } = court;

      return {
        ...rest,
        id: court.id,
        createdAt: court.createdAt.toISOString(),
        roomType: {
          ...court.courtType,
          basePrice: court.courtType.basePrice.toNumber(),
        },
        reviews: reviews,
        isLiked: wishlists && wishlists.length > 0,
      };
    });

  } catch (error) {
    console.log("[GET_ROOMS_BY_IDS_ERROR]", error);
    return [];
  }
};