"use server";

import { db } from "@/lib/db";
import { format } from "date-fns";
import { BookingActions } from "@/components/admin/booking-actions";
import { LiveRefresh } from "@/components/admin/live-refresh";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, User } from "lucide-react";
import { auth } from "@/lib/auth"; // 1. Import hàm auth từ cấu hình của bạn

// --- Helpers ---
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
};

const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200",
    CONFIRMED: "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200",
    CHECKED_IN: "bg-green-100 text-green-800 hover:bg-green-200 border-green-200",
    CHECKED_OUT: "bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200",
    CANCELLED: "bg-red-100 text-red-800 hover:bg-red-200 border-red-200",
  };
  
  const labels: Record<string, string> = {
    PENDING: "Chờ duyệt",
    CONFIRMED: "Đã xác nhận",
    CHECKED_IN: "Đang đá",
    CHECKED_OUT: "Đã xong",
    CANCELLED: "Đã hủy",
  };

  return (
    <Badge variant="outline" className={`border ${styles[status] || ""}`}>
      {labels[status] || status}
    </Badge>
  );
};

const getPaymentBadge = (status: string) => {
    const styles: Record<string, string> = {
        PAID: "bg-emerald-500 hover:bg-emerald-600 border-transparent text-white",
        UNPAID: "bg-orange-500 hover:bg-orange-600 border-transparent text-white",
        REFUNDED: "bg-slate-500 hover:bg-slate-600 border-transparent text-white",
    };
    return (
        <Badge className={`shadow-none ${styles[status]}`}>
            {status === "PAID" ? "Đã TT" : status === "UNPAID" ? "Chưa TT" : "Hoàn tiền"}
        </Badge>
    );
};

// 2. BookingsPage phải là async function
export default async function BookingsPage() {
  // 3. Lấy session ở tầng Server Component
  const session = await auth();

  const bookings = await db.booking.findMany({
    include: {
      user: { select: { name: true, email: true } },
      court: { select: { name: true } },
      timeSlot: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <LiveRefresh interval={30000} />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Đơn đặt sân</h2>
          <p className="text-muted-foreground">
            Quản lý nhận sân, trả sân và thanh toán.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng đơn hàng</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[100px]">Mã đơn</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Sân bóng</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Thanh toán</TableHead>
              <TableHead className="text-right">Tổng tiền</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                  Chưa có dữ liệu đặt sân.
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((booking) => (
                <TableRow key={booking.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-mono text-xs font-medium text-slate-500">
                    {booking.id.slice(-6).toUpperCase()}
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex flex-col">
                        <span className="font-medium flex items-center gap-1 text-sm">
                             <User className="h-3 w-3 text-slate-400" />
                             {booking.guestName || booking.user?.name}
                        </span>
                        <span className="text-xs text-muted-foreground ml-4">
                            {booking.guestPhone || booking.user?.email}
                        </span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <span className="font-medium text-sm">{booking.court?.name}</span>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-xs text-slate-600">
                        <div className="font-medium">{format(new Date(booking.date), "dd/MM/yyyy")}</div>
                        <div className="text-[10px] mt-0.5 opacity-70">
                          {booking.timeSlot ? (
                            `${format(new Date(booking.timeSlot.startTime), "HH:mm")} - ${format(new Date(booking.timeSlot.endTime), "HH:mm")}`
                          ) : (
                            `Ca: ${booking.timeSlotId}`
                          )}
                        </div>
                    </div>
                  </TableCell>

                  <TableCell>
                     {getPaymentBadge(booking.paymentStatus)}
                  </TableCell>
                  
                  <TableCell className="text-right font-bold text-slate-900">
                    {formatCurrency(Number(booking.totalPrice))}
                  </TableCell>
                  
                  <TableCell>
                    {getStatusBadge(booking.status)}
                  </TableCell>
                  
                  <TableCell className="text-right">
                    <BookingActions 
                        id={booking.id} 
                        status={booking.status}
                        paymentStatus={booking.paymentStatus}
                        totalPrice={Number(booking.totalPrice)} 
                        guestName={booking.guestName || booking.user?.name || "Khách hàng"}
                        paymentBill={(booking as any).paymentBill}
                        // 4. Truyền dữ liệu an toàn vào component Thao tác
                        currentUserRole={session?.user?.role}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}