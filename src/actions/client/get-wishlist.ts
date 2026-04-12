"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export const getWishlist = async () => {
  try {
    const session = await auth();
    if (!session?.user?.id) return [];

    const wishlist = await db.wishlist.findMany({
      where: { userId: session.user.id },
      include: {
        court: {
          include: {
            images: true, 
            courtType: {
              include: {
                location: true,
              }
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return wishlist.map((item) => {
      const court = item.court;
      const images = court.images || [];
      const courtType = court.courtType || {};
      const locationName = courtType.location?.name || "Đang cập nhật";

      return {
        id: court.id,
        name: court.name,
        address: locationName, 
        price: Number(courtType.basePrice),
        image: images[0]?.url || "/images/hero-sunset.png",
      };
    });
  } catch (error) {
    console.error("GET_WISHLIST_ERROR", error);
    return [];
  }
};