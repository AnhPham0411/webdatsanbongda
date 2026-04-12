"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

interface GetCourtsParams {
  category?: string;
  guests?: number;
  startDate?: string;
  endDate?: string;
  sort?: string;
  locationId?: string; 
  district?: string;
}

export const getCourts = async ({
  category,
  guests,
  startDate,
  endDate,
  sort,
  locationId,
  district,
}: GetCourtsParams): Promise<any[]> => {
  try {
    const session = await auth();
    const userId = session?.user?.id;

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

    if (district && district !== "all") {
        where.courtType = {
          ...where.courtType,
          location: {
            district: district
          }
        };
    }

    let orderBy: any = { createdAt: "desc" };

    if (sort === "price_asc") {
      orderBy = { courtType: { basePrice: "asc" } };
    } else if (sort === "price_desc") {
      orderBy = { courtType: { basePrice: "desc" } };
    }

    const courts = await db.court.findMany({
      where,
      include: {
        images: true, 
        courtType: { include: { location: true } },
        Review: {
          select: { rating: true }
        },
        wishlists: userId ? { where: { userId } } : false,
      },
      orderBy: orderBy,
    });

    return courts.map((court) => {
      const reviews = court.Review || [];
      const { wishlists, images, courtType, ...rest } = court;

      return {
        ...rest,
        createdAt: court.createdAt.toISOString(),
        courtType: {
          ...courtType,
          basePrice: Number(courtType?.basePrice || 0),
        },
        images: images,
        reviews: reviews,
        isLiked: wishlists && wishlists.length > 0,
      };
    });
  } catch (error) {
    console.error("GET_COURTS_ERROR", error);
    return [];
  }
};

export const getCourtById = async (courtId: string) => {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const court = await db.court.findUnique({
      where: { id: courtId },
      include: {
        images: true,
        courtType: {
          include: {
            location: true,
            amenities: true,
          },
        },
        Review: {
          include: {
            user: { select: { name: true, image: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        wishlists: userId ? { where: { userId } } : false,
      },
    });

    if (!court) return null;

    const { wishlists, images, courtType, Review, ...rest } = court as any;

    return {
      ...rest,
      id: court.id,
      createdAt: court.createdAt.toISOString(),
      courtType: {
        ...courtType,
        basePrice: Number(courtType?.basePrice || 0),
      },
      images: images,
      reviews: Review.map((r: any) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
      })),
      isLiked: wishlists && wishlists.length > 0,
    };
  } catch (error) {
    console.error("GET_COURT_BY_ID_ERROR", error);
    return null;
  }
};

export const getCourtsByIds = async (ids: string[]) => {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!ids || ids.length === 0) return [];

    const courts = await db.court.findMany({
      where: { id: { in: ids } },
      include: {
        courtType: true,
        images: true,
        bookings: {
          where: { review: { isNot: null } },
          select: { review: { include: { user: true } } }
        },
        wishlists: userId ? { where: { userId } } : false,
      }
    });

    return courts.map((court) => {
      const bookings = court.bookings || [];
      const reviews = bookings.map((b: any) => b.review).filter((r: any) => r !== null);
      const { wishlists, images, courtType, ...rest } = court;

      return {
        ...rest,
        id: court.id,
        createdAt: court.createdAt.toISOString(),
        courtType: {
          ...courtType,
          basePrice: Number(courtType?.basePrice || 0),
        },
        images: images,
        reviews: reviews,
        isLiked: wishlists && wishlists.length > 0,
      };
    });

  } catch (error) {
    console.log("[GET_COURTS_BY_IDS_ERROR]", error);
    return [];
  }
};