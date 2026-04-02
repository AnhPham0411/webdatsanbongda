import { getDashboardStats } from "@/actions/admin/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import OverviewChart from "@/components/admin/overview-chart";
import { CreditCard, Users, BedDouble, CalendarDays, DollarSign, Activity, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  
  // Safe defaults
  const data = stats || { 
      revenue: 0, 
      bookingsCount: 0, 
      activeRoomsCount: 0, 
      recentBookings: [],
      graphRevenue: [] 
  };

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      
      {/* Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
           <h2 className="text-3xl font-bold tracking-tight">Tổng quan</h2>
           <p className="text-muted-foreground">Chào mừng trở lại! Dưới đây là tình hình kinh doanh hôm nay.</p>
        </div>
        <div className="flex items-center space-x-2 bg-slate-100 p-2 rounded-lg text-sm font-medium">
            <CalendarDays className="h-4 w-4 text-slate-500" />
            <span className="text-slate-700">{format(new Date(), "EEEE, dd 'tháng' MM, yyyy", { locale: vi })}</span>
        </div>
      </div>
      
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(Number(data.revenue))}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
               <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
               <span className="text-green-600 font-medium">+20.1%</span> so với tháng trước
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đơn đặt sân</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{data.bookingsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Đơn hàng trong hệ thống
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sân hoạt động</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeRoomsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Sân sẵn sàng đón khách
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tỷ lệ lấp đầy</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {/* Giả lập số liệu tỷ lệ lấp đầy */}
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground mt-1">
               Hiệu suất tuần này
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts & Recent Sales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Biểu đồ */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Biểu đồ doanh thu</CardTitle>
            <CardDescription>
                Doanh thu ước tính theo từng tháng trong năm nay.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart data={data.graphRevenue} />
          </CardContent>
        </Card>

        {/* Danh sách giao dịch gần đây */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Giao dịch gần đây</CardTitle>
            <CardDescription>
              5 đơn đặt sân mới nhất vừa được tạo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {data.recentBookings.length === 0 && (
                  <p className="text-sm text-center text-muted-foreground py-10">Chưa có giao dịch nào.</p>
              )}
              
              {data.recentBookings.map((booking: any) => (
                <div key={booking.id} className="flex items-center">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={booking.user?.image || ""} alt="Avatar" />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {booking.user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                        {booking.user?.name || booking.guestName || "Khách vãng lai"}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center">
                        {booking.room.name} 
                        <span className="mx-1">•</span> 
                        {format(new Date(booking.createdAt), "dd/MM")}
                    </p>
                  </div>
                  <div className="ml-auto font-medium text-right">
                    <div className="text-sm">{formatCurrency(Number(booking.totalPrice))}</div>
                    <Badge variant={booking.status === "CONFIRMED" ? "default" : "secondary"} className="text-[10px] h-5 px-1.5 mt-1">
                        {booking.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}