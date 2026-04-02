"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getSettings() {
  try {
    let settings = await db.settings.findUnique({
      where: { id: "system" },
    });

    if (!settings) {
      settings = await db.settings.create({
        data: {
          id: "system",
          siteName: "Sport Arena",
        },
      });
    }

    return settings;
  } catch (error) {
    console.error("Get settings error:", error);
    return null;
  }
}

export async function updateSettings(data: any) {
  try {
    await db.settings.upsert({
      where: { id: "system" },
      update: {
        ...data,
        updatedAt: new Date(),
      },
      create: {
        id: "system",
        ...data,
      },
    });
    
    revalidatePath("/admin/settings");
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.error("Update settings error:", error);
    return { success: false, error: "Không thể lưu cài đặt." };
  }
}
