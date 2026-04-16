import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { BookingStatusBadge } from "@/components/client/booking-status-badge"; 
import { CancelBookingButton } from "@/components/client/cancel-booking-button"; 
import Image from "next/image";
import { QrCode } from "lucide-react";
import { PaymentQRModal } from "@/components/admin/payment-qr-modal";
import { generateVietQrUrl } from "@/lib/vietqr";
import { DeleteBookingButton } from "@/components/client/delete-booking-button";
import { PaymentReceiptUpload } from "@/components/client/payment-receipt-upload";
import { BookingTimer } from "@/components/client/booking-timer";

export default async function MyBookingsPage() {
  const session = await auth();

  if (!session?.user) {
    return redirect("/login");
  }

  const bookings = await db.booking.findMany({
    where: { userId: session.user.id },
    include: {
      court: {
        include: { images: true, courtType: true } // Renamed in schema.prisma
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
          {(bookings as any[]).map((booking) => {
            // Tính toán xem đơn đã quá hạn chưa (PENDING và quá giờ kết thúc ca)
            const matchEnd = new Date(booking.date);
            if (booking.timeSlot) {
              const timeEnd = new Date(booking.timeSlot.endTime);
              matchEnd.setHours(timeEnd.getUTCHours(), timeEnd.getUTCMinutes(), 0, 0);
            }
            const isExpired = matchEnd.getTime() < Date.now();
            const canDelete = ["CHECKED_OUT", "CANCELLED"].includes(booking.status) || 
                              (booking.status === "PENDING" && isExpired);

            return (
              <div key={booking.id} className="relative flex flex-col md:flex-row border rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition">
                 {/* Nút xóa ở góc trái trên cùng (hiện cho đơn đã xong, hủy hoặc quá hạn) */}
                 {canDelete && (
                   <div className="absolute top-2 left-2 z-20">
                      <DeleteBookingButton bookingId={booking.id} />
                   </div>
                 )}

               {/* Decorative blue bar */}
               <div className="w-2.5 bg-blue-600 shrink-0" />

               {/* Thông tin chi tiết */}
               <div className="flex-1 p-5 flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-4">
                     <div>
                        <h3 className="font-bold text-lg text-primary">{booking.court?.name}</h3>
                        <p className="text-sm text-gray-500">{booking.court?.courtType?.name}</p>
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

               {/* QR Code section cho PC */}
               <div className="hidden md:flex flex-col p-5 items-center justify-center border-l bg-slate-50/50 w-36 shrink-0">
                  {booking.paymentStatus !== 'PAID' && booking.status !== 'CANCELLED' ? (
                  <PaymentQRModal 
                      bookingId={booking.id} 
                      amount={Number(booking.totalPrice)} 
                      guestName={booking.guestName || session.user.name || ""} 
                      customTrigger={
                        <div className="flex flex-col items-center gap-2 cursor-pointer group hover:scale-105 transition-transform text-center">
                            <div className="relative w-20 h-20 bg-white p-1.5 border-2 border-blue-100 rounded-xl shadow-sm group-hover:border-blue-400 transition-all">
                              <Image 
                                  src={generateVietQrUrl({ amount: Number(booking.totalPrice), bookingId: booking.id })}
                                  alt="QR Thanh toán" 
                                  fill 
                                  className="object-contain"
                                  unoptimized
                              />
                            </div>
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tight bg-blue-50 px-2 py-0.5 rounded-full">Quét trả tiền</span>
                        </div>
                      }
                  />
                  ) : (
                  <div className="text-center opacity-40">
                      <QrCode className="w-8 h-8 mx-auto text-slate-400 mb-1" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase block leading-tight">
                        {booking.paymentStatus === 'PAID' ? 'Đã xong' : 'Đơn hủy'}
                      </span>
                  </div>
                  )}

                  {/* Gửi Bill ngay dưới QR (Mới) */}
                  <div className="mt-4 w-full px-2">
                    {booking.paymentStatus !== 'PAID' && booking.status !== 'CANCELLED' && (
                        <PaymentReceiptUpload 
                            bookingId={booking.id} 
                            existingBill={booking.paymentBill}
                        />
                    )}
                   </div>
               </div>

               {/* Nút hành động */}
               <div className="p-4 bg-gray-50 flex flex-row md:flex-col justify-center gap-2 border-t md:border-t-0 md:border-l w-full md:w-40 shrink-0">
                  <BookingTimer 
                      createdAt={booking.createdAt} 
                      status={booking.status} 
                      existingBill={booking.paymentBill}
                  />
                  
                  <Link href={`/courts/${booking.courtId}`} className="w-full">
                     <Button variant="outline" size="sm" className="w-full">Đặt lại</Button>
                  </Link>

                  {/* Nút QR cho mobile */}
                  <div className="md:hidden w-full">
                    {booking.paymentStatus !== 'PAID' && booking.status !== 'CANCELLED' && (
                        <PaymentQRModal 
                          bookingId={booking.id} 
                          amount={Number(booking.totalPrice)} 
                          guestName={booking.guestName || session.user.name || ""} 
                          customTrigger={
                              <Button variant="outline" size="sm" className="w-full border-blue-200 text-blue-600 gap-2">
                                <QrCode className="h-4 w-4" />
                                Thanh toán
                              </Button>
                          }
                        />
                    )}
                  </div>
                  
                  {/* Chỉ hiện nút hủy nếu trạng thái là PENDING hoặc CONFIRMED */}
                  {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                      <CancelBookingButton 
                         bookingId={booking.id} 
                         date={booking.date} 
                         timeStart={booking.timeSlot?.startTime} 
                      />
                  )}
               </div>
            </div>
          );
          })}
        </div>
      )}
    </div>
  );
}