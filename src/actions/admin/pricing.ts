"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getSeasonalPrices(courtId: string) {
  try {
    const prices = await db.seasonalPrice.findMany({
      where: { courtId },
      orderBy: { startDate: "asc" }
    });
    return prices;
  } catch (error) {
    console.error("GET_SEASONAL_PRICES_ERROR", error);
    return [];
  }
}

export async function addSeasonalPrice(data: {
  courtId: string;
  startDate: Date;
  endDate: Date;
  price: number;
}) {
  try {
    // 1. Kiểm tra lồng chéo thời gian (Overlap)
    const existing = await db.seasonalPrice.findFirst({
      where: {
        courtId: data.courtId,
        OR: [
          {
            AND: [
              { startDate: { lte: data.startDate } },
              { endDate: { gte: data.startDate } }
            ]
          },
          {
            AND: [
              { startDate: { lte: data.endDate } },
              { endDate: { gte: data.endDate } }
            ]
          }
        ]
      }
    });

    if (existing) {
      return { error: "Thời gian này đã có giá đặc biệt khác lồng chéo." };
    }

    await db.seasonalPrice.create({
      data
    });

    revalidatePath("/admin/pricing");
    return { success: "Đã thêm giá theo mùa thành công!" };
  } catch (error) {
    console.error("ADD_SEASONAL_PRICE_ERROR", error);
    return { error: "Lỗi hệ thống khi thêm giá." };
  }
}

export async function deleteSeasonalPrice(id: string) {
  try {
    await db.seasonalPrice.delete({
      where: { id }
    });
    revalidatePath("/admin/pricing");
    return { success: "Đã xóa giá theo mùa." };
  } catch (error) {
    console.error("DELETE_SEASONAL_PRICE_ERROR", error);
    return { error: "Lỗi khi xóa giá." };
  }
}