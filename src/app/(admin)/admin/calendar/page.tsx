import { db } from "@/lib/db";
import { CalendarClient } from "@/components/admin/calendar-client";

export default async function CalendarPage() {
  // 1. Fetch dữ liệu: Bao gồm Court và TimeSlot
  const bookings = await db.booking.findMany({
    where: {
      status: { not: "CANCELLED" }
    },
    include: {
      court: true,
      timeSlot: true,
      user: true,
      payment: true
    }
  });

  // 2. Transform Data: Kết hợp date và timeSlot để tạo sự kiện Calendar
  const events = bookings.map((b) => {
    // Helper để gộp ngày (date) và giờ (time)
    const startDate = new Date(b.date);
    startDate.setHours(b.timeSlot.startTime.getHours());
    startDate.setMinutes(b.timeSlot.startTime.getMinutes());

    const endDate = new Date(b.date);
    endDate.setHours(b.timeSlot.endTime.getHours());
    endDate.setMinutes(b.timeSlot.endTime.getMinutes());

    return {
      id: b.id,
      title: `${b.court.name} - ${b.guestName || b.user.name}`,
      start: startDate,
      end: endDate,
      resource: b, 
    };
  });

  return (
    <div className="h-[calc(100vh-80px)] p-8 flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Lịch biểu Sân bóng</h1>
           <p className="text-muted-foreground">Theo dõi lịch đặt sân theo thời gian thực.</p>
        </div>
      </div>
      
      <div className="flex-1 min-h-0"> 
        <CalendarClient initialEvents={events} />
      </div>
    </div>
  );
}