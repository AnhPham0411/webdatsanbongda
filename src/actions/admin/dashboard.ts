"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export const getDashboardStats = async () => {
  try {
    const session = await auth();
    const role = session?.user?.role;

    // 1. Kiểm tra quyền: Chỉ ADMIN và STAFF được vào Dashboard
    if (role !== "ADMIN" && role !== "STAFF") {
      return null;
    }

    // 2. Số lượng đơn đặt phòng (Cả 2 đều thấy)
    const bookingsCount = await db.booking.count();

    // 3. Số lượng sân đang hoạt động (Cả 2 đều thấy)
    const activeRoomsCount = await db.court.count({
      where: { isAvailable: true }
    });

    // 4. Giao dịch gần đây (Lấy 5 đơn mới nhất)
    const recentBookings = await db.booking.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        court: true,
      },
    });

    // 5. Tìm sân được đặt nhiều nhất (Top Court)
    const topCourtResult = await db.booking.groupBy({
      by: ["courtId"],
      _count: { courtId: true },
      orderBy: { _count: { courtId: "desc" } },
      take: 1,
    });

    let topCourt = "Chưa có dữ liệu";
    if (topCourtResult.length > 0) {
      const court = await db.court.findUnique({
        where: { id: topCourtResult[0].courtId },
      });
      if (court) topCourt = court.name;
    }

    // --- PHÂN QUYỀN DỮ LIỆU NHẠY CẢM ---
    let revenue = 0;
    let graphRevenue: any[] = [];

    if (role === "ADMIN") {
      // 6. Tổng doanh thu (Chỉ ADMIN thấy)
      const paidBookings = await db.booking.findMany({
        where: {
          status: { in: ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT"] }
        }
      });
      
      revenue = paidBookings.reduce((total, booking) => {
        return total + Number(booking.totalPrice);
      }, 0);

      // 7. Dữ liệu biểu đồ (Chỉ ADMIN thấy) - 7 ngày gần nhất
      graphRevenue = await getGraphRevenue();
    }

    return {
      revenue,
      bookingsCount,
      activeRoomsCount,
      topCourt,
      recentBookings,
      graphRevenue
    };
  } catch (error) {
    console.log("[DASHBOARD_GET]", error);
    return null;
  }
};

// Hàm phụ: Nhóm doanh thu theo 7 ngày gần nhất
const getGraphRevenue = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // Lấy từ 6 ngày trước + hôm nay = 7 ngày
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const paidBookings = await db.booking.findMany({
    where: {
      createdAt: { gte: sevenDaysAgo },
      status: { in: ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT"] }
    }
  });

  const dailyRevenue: { [key: string]: number } = {};
  
  // Khởi tạo 7 ngày với giá trị 0
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const dateKey = d.toISOString().split("T")[0];
    dailyRevenue[dateKey] = 0;
  }

  for (const order of paidBookings) {
    const dateKey = order.createdAt.toISOString().split("T")[0];
    if (dailyRevenue[dateKey] !== undefined) {
      dailyRevenue[dateKey] += Number(order.totalPrice);
    }
  }

  // Chuyển đổi sang định dạng biểu đồ (Sắp xếp theo thời gian tăng dần)
  const graphData = Object.keys(dailyRevenue)
    .sort()
    .map((date) => {
      const d = new Date(date);
      const dayName = d.toLocaleDateString("vi-VN", { weekday: "short" });
      const dayNumber = d.getDate();
      return {
        name: `${dayName} ${dayNumber}`,
        total: dailyRevenue[date]
      };
    });

  return graphData;
};