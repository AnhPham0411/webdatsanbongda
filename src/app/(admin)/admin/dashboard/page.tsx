/**
 * @file page.tsx (Admin Dashboard)
 * @description Trang tổng quan quản trị (Dashboard).
 * Hiển thị các số liệu thống kê về doanh thu, lượt đặt sân, khách hàng và biểu đồ tăng trưởng.
 */
import { getDashboardStats } from "@/actions/admin/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import OverviewChart from "@/components/admin/overview-chart";
import { 
  Users, 
  CalendarDays, 
  DollarSign, 
  Activity, 
  Trophy, 
  MapPin, 
  ShoppingBag, 
  TrendingUp,
  PieChart,
  Table as TableIcon
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  /**
   * Gọi Server Action để lấy dữ liệu thống kê tổng hợp từ Database.
   * Dữ liệu bao gồm doanh thu, số lượng đơn đặt, tỷ lệ thanh toán...
   */
  const stats = await getDashboardStats();
  
  // Safe defaults
  const data = stats || { 
      revenue: 0, 
      bookingsCount: 0, 
      occupancyToday: { booked: 0, total: 0 },
      activeRoomsCount: 0, 
      topCourt: "Chưa có dữ liệu",
      recentBookings: [],
      graphRevenue: [],
      revenueByDistrict: [],
      serviceStats: [],
      topBookers: [],
      topBooker: null,
      financialSummary: { paid: 0, pending: 0, cancelled: 0 }
  };

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
           <h2 className="text-3xl font-bold tracking-tight text-slate-800">Admin Dashboard</h2>
           <p className="text-muted-foreground italic">Phân tích dữ liệu & Quản lý vận hành sân bóng.</p>
        </div>
        <div className="flex items-center space-x-2 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm text-sm font-medium">
            <CalendarDays className="h-4 w-4 text-emerald-500" />
            <span className="text-slate-700">{format(new Date(), "EEEE, dd 'tháng' MM, yyyy", { locale: vi })}</span>
        </div>
      </div>
      
      {/* 4 Thẻ chỉ số quan trọng (KPI Cards) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-slate-600">Tổng doanh thu</CardTitle>
            <div className="p-2 bg-emerald-50 rounded-lg">
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(Number(data.revenue))}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
               <TrendingUp className="w-3 h-3 text-emerald-500" /> +12.5% so với tháng trước
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-100 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-slate-600">Tỉ lệ lấp đầy</CardTitle>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Activity className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {data.occupancyToday.booked}/{data.occupancyToday.total}
            </div>
            <p className="text-xs text-muted-foreground mt-1 text-blue-600 font-medium">
               Tính theo ca đá hôm nay
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-100 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-slate-600">Sân phổ biến</CardTitle>
            <div className="p-2 bg-orange-50 rounded-lg">
              <Trophy className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate text-slate-900 pr-2">{data.topCourt}</div>
            <p className="text-xs text-muted-foreground mt-1">
               Số lượng đặt cao nhất
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-100 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-slate-600">Khách hàng nổi bật</CardTitle>
            <div className="p-2 bg-purple-50 rounded-lg">
              <Users className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-slate-900 truncate">
              {data.topBooker?.name || "Chưa có"}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
               Thanh toán: <span className="font-bold text-purple-600">{formatCurrency(data.topBooker?.spent || 0)}</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Hàng biểu đồ chính và tình hình tài chính */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Biểu đồ doanh thu</CardTitle>
            <CardDescription>Biến động doanh thu trong 7 ngày gần nhất.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2 pb-6">
            <OverviewChart data={data.graphRevenue} />
          </CardContent>
        </Card>

        <Card className="col-span-3 border-none shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Tình hình tài chính</CardTitle>
            <CardDescription>Phân bổ trạng thái thanh toán.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-2">
            <div className="space-y-2">
               <div className="flex justify-between text-sm">
                  <span className="text-emerald-600 font-medium">Đã thanh toán</span>
                  <span className="font-bold">{formatCurrency(data.financialSummary.paid)}</span>
               </div>
               <div className="h-2 w-full bg-emerald-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }}></div>
               </div>
            </div>
            <div className="space-y-2">
               <div className="flex justify-between text-sm">
                  <span className="text-orange-500 font-medium">Chờ thanh toán</span>
                  <span className="font-bold">{formatCurrency(data.financialSummary.pending)}</span>
               </div>
               <div className="h-2 w-full bg-orange-100 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: `${Math.min(100, (data.financialSummary.pending / (data.financialSummary.paid || 1)) * 100)}%` }}></div>
               </div>
            </div>
            <div className="space-y-2">
               <div className="flex justify-between text-sm">
                  <span className="text-red-500 font-medium">Đơn đã hủy</span>
                  <span className="font-bold">{formatCurrency(data.financialSummary.cancelled)}</span>
               </div>
               <div className="h-2 w-full bg-red-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: `${Math.min(100, (data.financialSummary.cancelled / (data.financialSummary.paid || 1)) * 100)}%` }}></div>
               </div>
            </div>
            
            <div className="pt-4 border-t border-slate-100">
               <div className="flex items-center justify-between text-lg font-bold">
                  <span>Doanh thu ước tính:</span>
                  <span className="text-blue-600">{formatCurrency(data.financialSummary.paid + data.financialSummary.pending)}</span>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Các bảng dữ liệu bổ trợ: Thống kê theo Quận, Dịch vụ và Khách hàng */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* District Stats */}
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2">
            <div className="p-2 bg-sky-50 rounded-lg">
              <MapPin className="h-4 w-4 text-sky-600" />
            </div>
            <CardTitle className="text-md font-bold">Thống kê theo Khu vực</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.revenueByDistrict.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4 italic">Không có dữ liệu</p>
              ) : (
                data.revenueByDistrict.slice(0, 5).map((dist: any) => (
                  <div key={dist.name} className="flex items-center justify-between group">
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-slate-700">{dist.name}</p>
                      <p className="text-xs text-muted-foreground">{dist.bookings} lượt đặt sân</p>
                    </div>
                    <div className="text-sm font-bold text-slate-800">
                      {formatCurrency(dist.revenue)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Service Stats */}
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2">
            <div className="p-2 bg-pink-50 rounded-lg">
              <ShoppingBag className="h-4 w-4 text-pink-600" />
            </div>
            <CardTitle className="text-md font-bold">Dịch vụ (Áo/Nước...)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.serviceStats.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4 italic">Không có dữ liệu</p>
              ) : (
                data.serviceStats.map((service: any) => (
                  <div key={service.name} className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-slate-700">{service.name}</p>
                      <p className="text-xs text-muted-foreground">Số lượng: {service.quantity}</p>
                    </div>
                    <div className="text-sm font-bold text-emerald-600">
                      +{formatCurrency(service.revenue)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Bookers */}
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Users className="h-4 w-4 text-amber-600" />
            </div>
            <CardTitle className="text-md font-bold">Khách hàng nổi bật</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topBookers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4 italic">Không có dữ liệu</p>
              ) : (
                data.topBookers.map((user: any) => (
                  <div key={user.email} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-[10px] bg-slate-100">{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-slate-700 whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px]">{user.name}</p>
                        <p className="text-[10px] text-muted-foreground">{user.count} bookings</p>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-blue-600 pl-2">
                      {formatCurrency(user.spent)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bảng danh sách các giao dịch/đặt sân mới nhất */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Giao dịch mới nhất</CardTitle>
          <CardDescription>Theo dõi các đơn đặt sân vừa thực hiện trên hệ thống.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-y border-slate-100">
                <tr className="text-left font-medium text-slate-500 uppercase text-[10px] tracking-wider">
                  <th className="px-4 py-3">Khách hàng</th>
                  <th className="px-4 py-3">Sân bóng</th>
                  <th className="px-4 py-3">Ngày đặt</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Tổng tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recentBookings.map((booking: any) => (
                  <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 ring-1 ring-slate-200">
                          <AvatarImage src={booking.user?.image || ""} />
                          <AvatarFallback className="bg-slate-100 text-slate-400 text-xs">{booking.user?.name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-slate-700">{booking.user?.name || booking.guestName || "Khách"}</p>
                          <p className="text-[10px] text-muted-foreground">{booking.guestPhone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-600">{booking.court.name}</td>
                    <td className="px-4 py-4 text-slate-500">{format(new Date(booking.createdAt), "dd/MM/yyyy HH:mm")}</td>
                    <td className="px-4 py-4">
                      <Badge 
                        variant={booking.status === "CONFIRMED" ? "default" : booking.status === "PENDING" ? "outline" : "secondary"}
                        className={booking.status === "CONFIRMED" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none" : ""}
                      >
                        {booking.status === "PENDING" && "Chờ xác nhận"}
                        {booking.status === "CONFIRMED" && "Đã xác nhận"}
                        {booking.status === "CHECKED_IN" && "Đã nhận sân"}
                        {booking.status === "CHECKED_OUT" && "Đã xong"}
                        {booking.status === "CANCELLED" && "Đã hủy"}
                        {!["PENDING", "CONFIRMED", "CHECKED_IN", "CHECKED_OUT", "CANCELLED"].includes(booking.status) && booking.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-right font-bold text-slate-800">
                      {formatCurrency(Number(booking.totalPrice))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
    </div>
  );
}