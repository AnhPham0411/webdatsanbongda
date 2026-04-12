"use server";

import { db } from "@/lib/db";

export const getExtraServices = async () => {
  try {
    // PascalCase model name: ExtraService
    const services = await db.extraService.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" }
    });

    // Fix: Convert Decimal (price) and Date objects to plain serializable values
    return services.map(service => ({
      ...service,
      price: Number(service.price),
      createdAt: service.createdAt.toISOString(),
      updatedAt: service.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error("[GET_SERVICES]", error);
    return [];
  }
};
