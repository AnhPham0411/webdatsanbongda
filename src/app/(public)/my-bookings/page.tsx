import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image"; // Import Image
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { BookingStatusBadge } from "@/components/client/booking-status-badge"; // Nhớ export const
import { CancelBookingButton } from "@/components/client/cancel-booking-button"; // Nhớ export const
import { formatCurrency } from "@/lib/utils"; // Dùng hàm format tiền chung nếu có

export default async function MyBookingsPage() {
  const session = await auth();

  if (!session?.user) {
    return redirect("/login");
  }

  const bookings = await db.booking.findMany({
    where: { userId: session.user.id },
    include: {
      court: {
        include: { images: true, courtType: true }
      },
      timeSlot: true,
      payment: true
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">Lịch sử đặt sân bóng của tôi</h1>

      {bookings.length === 0 ? (
        <div className="text-center py-16 border rounded-xl bg-slate-50">
           <p className="text-gray-500 mb-6 text-lg">Bạn chưa có chuyến đi nào.</p>
           <Link href="/search">
             <Button size="lg">Đặt sân bóng ngay</Button>
           </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div key={booking.id} className="flex flex-col md:flex-row border rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition">
               {/* Ảnh sân bóng */}
               <div className="w-full md:w-56 h-48 md:h-auto relative bg-gray-100 shrink-0">
                  <Image 
                    src={booking.court?.images[0]?.url || "/images/placeholder.jpg"}
                    alt={booking.court?.name || "Court"}
                    fill
                    className="object-cover"
                  />
               </div>

               {/* Thông tin chi tiết */}
               <div className="flex-1 p-5 flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-4">
                     <div>
                        <h3 className="font-bold text-lg text-primary">{booking.court?.name}</h3>
                        <p className="text-sm text-gray-500">{booking.court?.courtType.name}</p>
                        <p className="text-xs text-gray-400 mt-1">Mã đơn: #{booking.id.slice(-6).toUpperCase()}</p>
                     </div>
                     <BookingStatusBadge status={booking.status} />
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm border-t pt-4">
                     <div>
                        <p className="text-gray-500 text-xs uppercase font-semibold">Ngày đá</p>
                        <p className="font-medium">{format(new Date(booking.date), "dd 'thg' MM, yyyy", { locale: vi })}</p>
                     </div>
                     <div>
                        <p className="text-gray-500 text-xs uppercase font-semibold">Khung giờ</p>
                        <p className="font-medium text-sm mt-1">
                          {booking.timeSlot ? (
                            `${format(new Date(booking.timeSlot.startTime), "HH:mm")} - ${format(new Date(booking.timeSlot.endTime), "HH:mm")}`
                          ) : (
                            booking.timeSlotId
                          )}
                        </p>
                     </div>
                     <div className="col-span-2 md:col-span-1">
                         <p className="text-gray-500 text-xs uppercase font-semibold">Tổng tiền</p>
                         <p className="font-bold text-blue-600 text-lg">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(booking.totalPrice))}
                         </p>
                     </div>
                  </div>
               </div>

               {/* Nút hành động */}
               <div className="p-4 bg-gray-50 flex flex-row md:flex-col justify-center gap-2 border-t md:border-t-0 md:border-l w-full md:w-40 shrink-0">
                  <Link href={`/rooms/${booking.courtId}`} className="w-full">
                     <Button variant="outline" size="sm" className="w-full">Đặt lại</Button>
                  </Link>
                  
                  {/* Chỉ hiện nút hủy nếu trạng thái là PENDING hoặc CONFIRMED */}
                  {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                      <CancelBookingButton bookingId={booking.id} />
                  )}
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}