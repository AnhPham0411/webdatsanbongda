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

    // 3. Số lượng phòng đang hoạt động (Cả 2 đều thấy)
    const activeRoomsCount = await db.room.count({
      where: { isAvailable: true }
    });

    // 4. Giao dịch gần đây (Lấy 5 đơn mới nhất)
    const recentBookings = await db.booking.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        room: true,
      },
    });

    // --- PHÂN QUYỀN DỮ LIỆU NHẠY CẢM ---
    let revenue = 0;
    let graphRevenue: any[] = [];

    if (role === "ADMIN") {
      // 5. Tổng doanh thu (Chỉ ADMIN thấy)
      const paidBookings = await db.booking.findMany({
        where: {
          status: { in: ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT"] }
        }
      });
      
      revenue = paidBookings.reduce((total, booking) => {
        return total + Number(booking.totalPrice);
      }, 0);

      // 6. Dữ liệu biểu đồ (Chỉ ADMIN thấy)
      graphRevenue = await getGraphRevenue();
    }

    return {
      revenue,           // Sẽ là 0 nếu là STAFF
      bookingsCount,
      activeRoomsCount,
      recentBookings,
      graphRevenue       // Sẽ là mảng rỗng nếu là STAFF
    };
  } catch (error) {
    console.log("[DASHBOARD_GET]", error);
    return null;
  }
};

// Hàm phụ: Nhóm doanh thu theo 12 tháng (Hàm này thực tế chỉ được gọi bởi Admin ở trên)
const getGraphRevenue = async () => {
  const paidBookings = await db.booking.findMany({
    where: {
      status: { in: ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT"] }
    }
  });

  const monthlyRevenue: { [key: number]: number } = {};
  for (let i = 0; i < 12; i++) monthlyRevenue[i] = 0;

  for (const order of paidBookings) {
    const month = order.createdAt.getMonth();
    monthlyRevenue[month] = (monthlyRevenue[month] || 0) + Number(order.totalPrice);
  }

  const graphData = [
    { name: "Thg 1", total: 0 }, { name: "Thg 2", total: 0 },
    { name: "Thg 3", total: 0 }, { name: "Thg 4", total: 0 },
    { name: "Thg 5", total: 0 }, { name: "Thg 6", total: 0 },
    { name: "Thg 7", total: 0 }, { name: "Thg 8", total: 0 },
    { name: "Thg 9", total: 0 }, { name: "Thg 10", total: 0 },
    { name: "Thg 11", total: 0 }, { name: "Thg 12", total: 0 },
  ];

  for (const month in monthlyRevenue) {
    graphData[parseInt(month)].total = monthlyRevenue[parseInt(month)];
  }

  return graphData;
};