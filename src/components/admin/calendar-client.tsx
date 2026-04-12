/**
 * @file calendar-client.tsx
 * @description Thành phần lịch biểu hiển thị danh sách các đơn đặt sân.
 * Sử dụng thư viện react-big-calendar với cấu hình tiếng Việt.
 */
"use client";

import { useState } from "react";
import { Calendar, dateFnsLocalizer, View, Views } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { vi } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css"; // Import CSS gốc

import { Booking, Court, User, TimeSlot } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Clock, User as UserIcon, Activity, CalendarDays } from "lucide-react";

// 1. Cấu hình Localizer cho tiếng Việt sử dụng date-fns
const locales = {
  vi: vi,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Định nghĩa kiểu dữ liệu sự kiện
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: any; // Dữ liệu gốc để hiển thị chi tiết (đã loại bỏ Prisma Decimal)
}

interface CalendarClientProps {
  initialEvents: CalendarEvent[];
}

export const CalendarClient = ({ initialEvents }: CalendarClientProps) => {
  const [view, setView] = useState<View>(Views.WEEK);
  const [date, setDate] = useState(new Date());
  
  // State cho Modal chi tiết
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // 2. Xử lý khi người dùng nhấn vào một sự kiện trên lịch
  const onSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsOpen(true);
  };

  /**
   * 3. Tùy chỉnh phong cách (style) cho từng sự kiện dựa trên trạng thái của đơn đặt sân.
   * Màu sắc giúp người quản trị dễ dàng phân biệt trạng thái đơn hàng.
   */
  const eventPropGetter = (event: CalendarEvent) => {
    const status = event.resource.status;
    let className = "";

    const isPaid = event.resource.payment?.status === "PAID";

    switch (status) {
      case "CONFIRMED":
        className = isPaid 
          ? "bg-emerald-600 border-emerald-700 text-white" // Đã xác nhận & Đã thanh toán (Xanh lá)
          : "bg-blue-600 border-blue-700 text-white";     // Đã xác nhận nhưng chưa thanh toán (Xanh dương)
        break;
      case "PENDING":
        className = "bg-yellow-500 border-yellow-600 text-white"; // Đang chờ xử lý (Vàng)
        break;
      case "CANCELLED":
        className = "bg-red-500 border-red-600 text-white opacity-70"; // Đã hủy (Đỏ)
        break;
      default:
        className = "bg-gray-500 text-white";
    }

    return { className: `rounded-md px-2 text-xs font-medium border ${className}` };
  };

  return (
    <>
      <div className="h-full w-full bg-white rounded-xl shadow-sm border p-4">
        <Calendar
          localizer={localizer}
          events={initialEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }} // Quan trọng để lịch hiện full chiều cao
          culture="vi"
          views={[Views.MONTH, Views.WEEK, Views.DAY]}
          view={view}
          date={date}
          onView={(view) => setView(view)}
          onNavigate={(date) => setDate(date)}
          onSelectEvent={onSelectEvent}
          eventPropGetter={eventPropGetter}
          min={new Date(0, 0, 0, 5, 0, 0)} // Bắt đầu từ 5 giờ sáng
          max={new Date(0, 0, 0, 23, 59, 59)} // Kết thúc lúc 24 giờ
          messages={{
            next: "Sau",
            previous: "Trước",
            today: "Hôm nay",
            month: "Tháng",
            week: "Tuần",
            day: "Ngày",
            date: "Ngày",
            time: "Thời gian",
            event: "Sự kiện",
            noEventsInRange: "Không có sự kiện nào trong khoảng thời gian này.",
          }}
        />
      </div>

      {/* Modal Chi tiết Đặt phòng */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chi tiết Đặt sân</DialogTitle>
            <DialogDescription>Mã đơn: <span className="font-mono">{selectedEvent?.id.slice(-6).toUpperCase()}</span></DialogDescription>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-4">
               {/* Thông tin phòng */}
               <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                  <div className="flex items-center gap-3">
                     <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center border shadow-sm">
                        <Activity className="h-5 w-5 text-indigo-600" />
                     </div>
                     <div>
                        <p className="font-medium text-sm">Sân bóng</p>
                        <p className="font-bold text-lg">{selectedEvent.resource.court.name}</p>
                     </div>
                  </div>
                  <Badge variant="secondary">
                    {selectedEvent.resource.payment?.status === 'PAID' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                  </Badge>
               </div>

               {/* Thông tin khách & Thời gian */}
               <div className="grid grid-cols-2 gap-4">
                  <Card className="p-3 space-y-1 shadow-none border-dashed">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs">
                         <UserIcon className="h-3 w-3" /> Người đặt
                      </div>
                      <p className="font-medium truncate">
                         {selectedEvent.resource.guestName || selectedEvent.resource.user.name}
                      </p>
                  </Card>
                  
                  <Card className="p-3 space-y-1 shadow-none border-dashed">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs">
                         <Clock className="h-3 w-3" /> Tổng tiền
                      </div>
                      <p className="font-medium text-green-600">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(selectedEvent.resource.totalPrice))}
                      </p>
                  </Card>
               </div>

               <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                     <CalendarDays className="h-4 w-4" /> Thời gian trận đấu
                  </div>
                  <div className="grid grid-cols-2 text-center divide-x border rounded-md py-2">
                      <div>
                         <p className="text-xs text-muted-foreground">Bắt đầu</p>
                         <p className="font-semibold text-sm">
                            {format(selectedEvent.start, "HH:mm")}
                         </p>
                      </div>
                      <div>
                         <p className="text-xs text-muted-foreground">Kết thúc</p>
                         <p className="font-semibold text-sm">
                            {format(selectedEvent.end, "HH:mm")}
                         </p>
                      </div>
                  </div>
                  <p className="text-center text-xs text-slate-500 font-medium">
                    Ngày: {format(selectedEvent.start, "dd/MM/yyyy")}
                  </p>
               </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};