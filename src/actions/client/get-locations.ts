"use server";

import { db } from "@/lib/db";

export const getLocations = async () => {
  try {
    const locations = await db.location.findMany({
      orderBy: {
        name: 'asc', // Sắp xếp tên A-Z cho dễ tìm
      },
      select: {
        id: true,
        name: true,
      }
    });
    return locations;
  } catch (error) {
    console.error("[GET_LOCATIONS_ERROR]", error);
    return [];
  }
};