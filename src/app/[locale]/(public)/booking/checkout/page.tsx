import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCourtById } from "@/actions/client/get-courts";
import { getExtraServices } from "@/actions/client/get-services";
import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Calendar, Users, Clock, Receipt } from "lucide-react";
import { CheckoutForm } from "@/components/client/checkout-form";
import { formatCurrency } from "@/lib/utils";

interface CheckoutPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CheckoutPage(props: CheckoutPageProps) {
  const searchParams = await props.searchParams;
  const session = await auth();

  // 1. Kiểm tra đăng nhập
  if (!session || !session.user) {
    const callbackUrl = encodeURIComponent(`/booking/checkout?courtId=${searchParams.courtId || searchParams.roomId}&date=${searchParams.date || searchParams.checkIn}&timeSlotId=${searchParams.timeSlotId}`);
    redirect(`/login?callbackUrl=${callbackUrl}`);
  }

  // Tương thích với cả roomId cũ nếu người dùng reload
  const courtId = (searchParams.courtId || searchParams.roomId) as string;
  const dateStr = (searchParams.date || searchParams.checkIn) as string;
  const timeSlotIdStr = searchParams.timeSlotId as string;
  const servicesStr = searchParams.services as string;
  
  if (!courtId || !dateStr || !timeSlotIdStr) return notFound();

  // Sử dụng getCourtById từ get-courts.ts
  const court = await getCourtById(courtId);
  if (!court) return notFound();

  // Lấy thông tin khung giờ (TimeSlot) từ DB để hiển thị giờ thay vì ID
  const timeSlot = await db.timeSlot.findUnique({
    where: { id: timeSlotIdStr }
  });

  const timeDisplay = timeSlot 
    ? `${format(timeSlot.startTime, "HH:mm")} - ${format(timeSlot.endTime, "HH:mm")}`
    : timeSlotIdStr;

  // 2. Chuyển đổi chuỗi ngày tháng sang đối tượng Date
  const bookingDate = new Date(dateStr);

  // 3. Kiểm tra ngày hợp lệ (Tránh lỗi NaN nếu ngày sai định dạng)
  if (isNaN(bookingDate.getTime())) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h2 className="text-xl font-bold text-red-600">Ngày đặt sân không hợp lệ!</h2>
        <p className="text-muted-foreground">Vui lòng quay lại và chọn ngày chính xác.</p>
      </div>
    );
  }

  // 4. Tính giá sân và dịch vụ
  const basePrice = Number(court.courtType.basePrice); 
  
  // Xử lý dịch vụ thêm
  const allServices = await getExtraServices();
  const selectedServicesMap = servicesStr ? JSON.parse(servicesStr) : {};
  const selectedServicesDetails = allServices
    .filter((s: any) => selectedServicesMap[s.id])
    .map((s: any) => ({
      ...s,
      quantity: selectedServicesMap[s.id]
    }));
  
  const servicesTotal = selectedServicesDetails.reduce((acc: number, s: any) => acc + (s.price * s.quantity), 0);
  const grandTotal = basePrice + servicesTotal;

  // Kiểm tra lần cuối
  if (isNaN(grandTotal)) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h2 className="text-xl font-bold text-red-600">Lỗi tính toán giá tiền!</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-center text-slate-800">Xác nhận đặt sân bóng</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Cột Trái: Thông tin sân bóng */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="overflow-hidden border-none shadow-md">
            {/* Header placeholder (Simplified) */}
            <div className="h-4 bg-blue-600 w-full" />

            <CardHeader>
              <CardTitle className="text-xl">{court.name}</CardTitle>
              <p className="text-sm text-muted-foreground font-medium">{court.courtType.name}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center text-sm text-slate-600">
                <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                <span>{court.courtType.location?.name || "Hà Nội"}</span>
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <Users className="w-4 h-4 mr-2 text-blue-500" />
                <span>Số lượng người chơi: {court.courtType.capacity} người</span>
              </div>
              
              <div className="bg-slate-100 p-4 rounded-lg space-y-3 mt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2"><Calendar className="w-4 h-4"/> Ngày đá:</span>
                  <span className="font-semibold">{format(bookingDate, "dd/MM/yyyy")}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2"><Clock className="w-4 h-4"/> Khung giờ:</span>
                  <span className="font-semibold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md">{timeDisplay}</span>
                </div>
                <div className="border-t border-slate-300 pt-2 flex justify-between font-medium">
                  <span>Giá sân (1 ca):</span>
                  <span>{formatCurrency(basePrice)}</span>
                </div>

                {selectedServicesDetails.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <p className="text-xs font-semibold text-slate-500 uppercase">Dịch vụ kèm theo:</p>
                    {selectedServicesDetails.map((service: any) => (
                      <div key={service.id} className="flex justify-between text-sm">
                        <span className="text-slate-600">{service.name} x {service.quantity}</span>
                        <span className="font-medium">{formatCurrency(service.price * service.quantity)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-slate-300 pt-3 flex justify-between items-center text-blue-700">
                  <span className="font-bold flex items-center gap-1">
                    <Receipt className="w-4 h-4"/> Tổng thanh toán:
                  </span>
                  <span className="text-lg font-bold">{formatCurrency(grandTotal)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cột Phải: Form nhập liệu */}
        <div className="lg:col-span-2">
          <Card className="border-none shadow-md h-full">
            <CardHeader>
              <CardTitle>Thông tin thanh toán</CardTitle>
            </CardHeader>
            <CardContent>
              <CheckoutForm 
                userId={session.user.id!}
                courtId={courtId}
                date={dateStr}
                timeSlotId={timeSlotIdStr}
                totalPrice={grandTotal} 
                services={servicesStr}
                initialName={session.user.name || ""}
                initialEmail={session.user.email || ""}
                initialPhone={(session.user as any).phone || ""}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}