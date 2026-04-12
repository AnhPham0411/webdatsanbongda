"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBooking } from "@/actions/client/booking";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Receipt, Clock } from "lucide-react";
import { VoucherApply } from "@/components/client/voucher-apply"; // Import Voucher Component
import { formatCurrency } from "@/lib/utils"; // Hàm format tiền (VD: 100.000 đ)

interface CheckoutFormProps {
  userId: string;
  courtId: string;
  date: string;
  timeSlotId: string;
  totalPrice: number; // Đây là giá gốc
  initialName: string;
  initialEmail: string;
  initialPhone: string;
  services?: string; // JSON string of {serviceId: quantity}
}

export const CheckoutForm = ({
  userId,
  courtId,
  date,
  timeSlotId,
  totalPrice, // Giá gốc
  initialName,
  initialEmail,
  initialPhone,
  services,
}: CheckoutFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // --- 1. STATE QUẢN LÝ VOUCHER & TIMER ---
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedVoucherId, setAppliedVoucherId] = useState<string | null>(null);

  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const isExpired = timeLeft <= 0;
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Tính thành tiền (Không cho phép âm)
  const finalPrice = Math.max(0, totalPrice - discountAmount);

  // State cho form input
  const [formData, setFormData] = useState({
    guestName: initialName || "",
    guestEmail: initialEmail || "",
    guestPhone: initialPhone || "",
    note: "",
  });

  const onSubmit = () => {
    // Validate cơ bản
    if (!formData.guestName || !formData.guestPhone || !formData.guestEmail) {
      toast.error("Vui lòng điền đầy đủ thông tin khách hàng!");
      return;
    }

    startTransition(async () => {
      // Gọi Server Action
      const result = await createBooking({
        courtId,
        date: new Date(date),
        timeSlotId,
        
        // --- 2. GỬI GIÁ ĐÃ GIẢM & VOUCHER ID ---
        totalPrice: finalPrice, 
        voucherId: appliedVoucherId, // Gửi kèm voucherId (nếu có)
        services,
        
        guestName: formData.guestName,
        guestEmail: formData.guestEmail,
        guestPhone: formData.guestPhone,
        note: formData.note,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Đặt sân thành công!");
        // Chuyển hướng về trang chi tiết đơn hàng (hoặc trang success)
        router.push(`/my-bookings`); 
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* --- TIMER --- */}
      <div className={`p-4 rounded-xl border flex items-center justify-between ${isExpired ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
        <div className="flex items-center gap-2">
           <Clock className={`w-5 h-5 ${isExpired ? 'text-red-500' : 'text-blue-500'}`} />
           <span className={`font-semibold ${isExpired ? 'text-red-600' : 'text-blue-600'}`}>
             {isExpired ? 'Đơn hàng đã hết hạn' : 'Thời gian giữ chỗ'}
           </span>
        </div>
        <span className={`text-xl font-bold font-mono tracking-wider ${isExpired ? 'text-red-600' : 'text-blue-700'}`}>
           {formatTime(timeLeft)}
        </span>
      </div>

      {/* --- PHẦN 1: FORM THÔNG TIN --- */}
      <div className="space-y-4 opacity-100 transition-opacity" style={{ opacity: isExpired ? 0.6 : 1, pointerEvents: isExpired ? 'none' : 'auto' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Họ và tên</Label>
            <Input 
              value={formData.guestName}
              onChange={(e) => setFormData({...formData, guestName: e.target.value})}
              placeholder="Nguyễn Văn A"
            />
          </div>
          <div className="space-y-2">
            <Label>Số điện thoại</Label>
            <Input 
              value={formData.guestPhone}
              onChange={(e) => setFormData({...formData, guestPhone: e.target.value})}
              placeholder="098..."
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Email nhận xác nhận</Label>
          <Input 
            type="email"
            value={formData.guestEmail}
            onChange={(e) => setFormData({...formData, guestEmail: e.target.value})}
            placeholder="email@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label>Ghi chú đặc biệt</Label>
          <Textarea 
            value={formData.note}
            onChange={(e) => setFormData({...formData, note: e.target.value})}
            placeholder="Ví dụ: Cần mượn thêm quả bóng, mượn áo bib..." 
          />
        </div>
      </div>

      <div className="border-t border-slate-200 my-4"></div>

      {/* --- PHẦN 2: MÃ GIẢM GIÁ (VOUCHER) --- */}
      <div className="space-y-2" style={{ opacity: isExpired ? 0.6 : 1, pointerEvents: isExpired ? 'none' : 'auto' }}>
        <Label>Mã ưu đãi</Label>
        <VoucherApply 
          totalPrice={totalPrice} 
          onApply={(discount, id) => {
            setDiscountAmount(discount);
            setAppliedVoucherId(id);
          }} 
        />
      </div>

      {/* --- PHẦN 3: TỔNG KẾT TIỀN --- */}
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
        <div className="flex justify-between text-sm text-slate-600">
          <span>Tổng tiền sân & dịch vụ:</span>
          <span>{formatCurrency(totalPrice)}</span>
        </div>
        
        {/* Chỉ hiện dòng giảm giá nếu có voucher áp dụng */}
        {discountAmount > 0 && (
          <div className="flex justify-between text-sm text-emerald-600 font-medium">
            <span>Voucher giảm giá:</span>
            <span>- {formatCurrency(discountAmount)}</span>
          </div>
        )}

        <div className="flex justify-between items-center pt-3 border-t border-slate-300">
          <span className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-4 h-4" /> Thành tiền:
          </span>
          <span className="text-xl font-bold text-blue-600">
            {formatCurrency(finalPrice)}
          </span>
        </div>
      </div>

      {/* --- BUTTON SUBMIT --- */}
      <div className="pt-2">
        <Button 
          onClick={onSubmit} 
          disabled={isPending || isExpired} 
          className={`w-full text-lg h-12 shadow-md ${isExpired ? 'bg-slate-300' : 'bg-blue-600 hover:bg-blue-700'}`} 
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Đang xử lý...
            </>
          ) : isExpired ? (
            "Đơn hàng đã hết hạn"
          ) : (
            `Thanh toán ${formatCurrency(finalPrice)}`
          )}
        </Button>
        <p className="text-xs text-center text-muted-foreground mt-3">
          Bằng việc tiếp tục, bạn đồng ý với Điều khoản sử dụng & Chính sách quyền riêng tư của chúng tôi.
        </p>
      </div>
    </div>
  );
};