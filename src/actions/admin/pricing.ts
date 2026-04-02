"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth"; // Đảm bảo import đúng cấu hình auth của bạn

const SeasonalPriceSchema = z.object({
  roomId: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  price: z.coerce.number().min(0, "Giá không được âm"),
});

// Helper kiểm tra quyền Admin
const checkAdmin = async () => {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
};

export const createSeasonalPrice = async (values: z.infer<typeof SeasonalPriceSchema>) => {
  try {
    // 🛑 CHẶN QUYỀN: Chỉ Admin mới được thiết lập biểu giá
    await checkAdmin();

    const validated = SeasonalPriceSchema.safeParse(values);
    if (!validated.success) return { error: "Dữ liệu không hợp lệ!" };

    const { roomId, startDate, endDate, price } = validated.data;

    // 1. Validate Logic: Ngày bắt đầu phải trước ngày kết thúc
    if (startDate >= endDate) {
      return { error: "Ngày kết thúc phải sau ngày bắt đầu!" };
    }

    // 2. Validate Logic: Kiểm tra xem khoảng thời gian này đã có giá mùa vụ nào chưa?
    const existingPrice = await db.seasonalPrice.findFirst({
      where: {
        roomId,
        OR: [
          {
            startDate: { lte: endDate },
            endDate: { gte: startDate },
          },
        ],
      },
    });

    if (existingPrice) {
      return { 
        error: "Khoảng thời gian này bị trùng với một cài đặt giá khác!" 
      };
    }

    // 3. Tạo mới
    await db.seasonalPrice.create({
      data: {
        roomId,
        startDate,
        endDate,
        price,
      },
    });

    revalidatePath(`/admin/rooms/${roomId}`);
    return { success: "Đã thiết lập giá mùa vụ thành công!" };
  } catch (error: any) {
    if (error.message === "Unauthorized") return { error: "Bạn không có quyền thiết lập giá!" };
    console.log("CREATE_SEASONAL_PRICE_ERROR", error);
    return { error: "Lỗi Server!" };
  }
};

export const deleteSeasonalPrice = async (id: string, roomId: string) => {
  try {
    // 🛑 CHẶN QUYỀN: Chỉ Admin mới được xóa biểu giá
    await checkAdmin();

    await db.seasonalPrice.delete({ where: { id } });
    revalidatePath(`/admin/rooms/${roomId}`);
    return { success: "Đã xóa giá mùa vụ!" };
  } catch (error: any) {
    if (error.message === "Unauthorized") return { error: "Bạn không có quyền thực hiện hành động này!" };
    return { error: "Lỗi Server!" };
  }
};