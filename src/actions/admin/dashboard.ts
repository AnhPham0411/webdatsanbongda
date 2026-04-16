/**
 * @file dashboard.ts
 * @description Server Action tổng hợp toàn bộ dữ liệu thống kê cho trang Dashboard Admin.
 * Bao gồm: Doanh thu, số lượng đơn đặt, tỷ lệ thanh toán, thống kê theo khu vực và dịch vụ đi kèm.
 */
"use server";

import { db } from "@/lib/db";
import { startOfMonth, subMonths, endOfMonth } from "date-fns";

/**
 * Hàm lấy số liệu thống kê Dashboard.
 * Thực hiện nhiều truy vấn và tính toán tổng hợp từ Database.
 */
export async function getDashboardStats() {
  try {
    const now = new Date();
    // 1. THỐNG KÊ DOANH THU VÀ TRẠNG THÁI CHUNG
    // Lấy toàn bộ danh sách đơn đặt sân để tính toán tổng quát
    const bookings = await db.booking.findMany({
      include: {
        payment: true,
        user: { select: { name: true, email: true, image: true } },
        court: { select: { name: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    const activeRoomsCount = await db.court.count({ where: { isAvailable: true } });

    let revenue = 0;
    let paid = 0, pending = 0, cancelled = 0;

    bookings.forEach(b => {
      const amt = Number(b.totalPrice || 0);
      if (b.status === "CANCELLED") {
         cancelled += amt;
      } else {
         if (b.paymentStatus === "PAID") {
           paid += amt;
           revenue += amt; // Add to total revenue
         } else if (b.paymentStatus === "UNPAID") {
           pending += amt;
         }
      }
    });

    // 2. DANH SÁCH ĐƠN ĐẶT SÂN MỚI NHẤT
    // Lấy 10 đơn gần đây nhất để hiển thị bảng tóm tắt
    const recentBookings = bookings.slice(0, 10).map((b: any) => ({
      id: b.id,
      user: {
        name: b.user?.name || b.guestName,
        image: b.user?.image
      },
      guestPhone: b.guestPhone,
      court: { name: b.court?.name },
      createdAt: b.createdAt,
      status: b.status,
      totalPrice: Number(b.totalPrice)
    }));

    // 3. THỐNG KÊ THEO KHU VỰC VÀ SÂN PHỔ BIẾN NHẤT
    // Phân tích doanh thu dựa trên địa điểm của các cụm sân
    const locations = await db.location.findMany({
      include: {
        courtTypes: {
          include: { 
            courts: { 
               include: { bookings: { select: { status: true, totalPrice: true } } } 
            } 
          }
        }
      }
    });

    const districtStatsData = locations.reduce((acc: any, loc: any) => {
      const district = loc.district || "Khác";
      if (!acc[district]) acc[district] = { name: district, revenue: 0, bookings: 0 };
      
      const courtTypes = loc.courtTypes || [];
      courtTypes.forEach((ct: any) => {
        const courts = ct.courts || [];
        courts.forEach((c: any) => {
          c.bookings.forEach((b: any) => {
             if (b.status !== "CANCELLED") {
                acc[district].revenue += Number(b.totalPrice);
                acc[district].bookings += 1;
             }
          });
        });
      });
      return acc;
    }, {});

    const topCourtResult = await db.court.findFirst({
       include: { _count: { select: { bookings: true } } },
       orderBy: { bookings: { _count: 'desc' } }
    });

    // 4. THỐNG KÊ DỊCH VỤ ĐI KÈM (ÁO, NƯỚC, BÓNG...)
    // Tính toán lượng tiêu thụ và doanh thu từ các dịch vụ phụ trợ
    const services = await db.extraService.findMany({
      include: { bookingExtraServices: true }
    });
    
    const serviceStats = services.map(s => ({
      name: s.name,
      quantity: s.bookingExtraServices.reduce((sum, item) => sum + item.quantity, 0),
      revenue: s.bookingExtraServices.reduce((sum, item) => sum + (Number(item.priceAtBooking) * item.quantity), 0)
    }));

    // 5. KHÁCH HÀNG THÂN THIẾT (TOP BOOKERS)
    // Lấy danh sách 5 khách hàng có số lượng đặt sân nhiều nhất
    const topBookersData = await db.user.findMany({
      take: 5,
      include: { bookings: true },
      orderBy: { bookings: { _count: "desc" } }
    });

    const topBookers = topBookersData.map(u => ({
      name: u.name || u.email,
      email: u.email,
      image: u.image,
      count: u.bookings.length,
      spent: u.bookings.reduce((sum, b) => sum + Number(b.totalPrice), 0)
    })).sort((a, b) => b.spent - a.spent);

    // 6. DỮ LIỆU BIỂU ĐỒ DOANH THU (7 NGÀY GẦN NHẤT)
    // Tổng hợp doanh thu theo từng ngày để vẽ biểu đồ đường (Line Chart)
    const graphRevenue = Array.from({ length: 7 }).map((_, i) => {
       const d = new Date();
       d.setDate(d.getDate() - i);
       d.setHours(0,0,0,0);
       return { date: d, name: d.toLocaleDateString("vi-VN", { weekday: 'short' }), total: 0 };
    }).reverse();

    bookings.forEach(b => {
       if (b.status !== "CANCELLED" && b.paymentStatus === "PAID") {
          const bDate = new Date(b.createdAt);
          bDate.setHours(0,0,0,0);
          const point = graphRevenue.find(g => g.date.getTime() === bDate.getTime());
          if (point) point.total += Number(b.totalPrice);
       }
    });

    // 7. THỐNG KÊ LẤP ĐẦY TRONG NGÀY (OCCUPANCY)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const bookingsTodayCount = await db.booking.count({
      where: {
        date: today,
        status: { not: "CANCELLED" }
      }
    });

    const totalCourts = await db.court.count();
    const totalTimeSlots = await db.timeSlot.count();
    const totalCapacityToday = totalCourts * totalTimeSlots;

    return {
      revenue,
      bookingsCount: bookings.length,
      occupancyToday: {
        booked: bookingsTodayCount,
        total: totalCapacityToday
      },
      activeRoomsCount,
      topCourt: topCourtResult?.name || "Chưa có",
      recentBookings,
      graphRevenue: graphRevenue.map(g => ({ name: g.name, total: g.total })),
      revenueByDistrict: Object.values(districtStatsData),
      serviceStats,
      topBookers,
      topBooker: topBookers[0] || null,
      financialSummary: { paid, pending, cancelled }
    };
  } catch (error) {
    console.error("DASHBOARD_STATS_ERROR", error);
    return null;
  }
}