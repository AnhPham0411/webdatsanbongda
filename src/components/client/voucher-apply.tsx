"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { TicketPercent, Loader2, X, CheckCircle2 } from "lucide-react";
import { checkVoucher } from "@/actions/client/voucher";
import { formatCurrency } from "@/lib/utils"; // Hàm format tiền của bạn

interface VoucherApplyProps {
  totalPrice: number;
  onApply: (discount: number, id: string | null) => void;
}

export const VoucherApply = ({ totalPrice, onApply }: VoucherApplyProps) => {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // State lưu thông tin mã đã áp dụng thành công
  const [appliedVoucher, setAppliedVoucher] = useState<{
    code: string;
    discount: number;
  } | null>(null);

  const handleApply = async () => {
    if (!code.trim()) return;
    
    setIsLoading(true);
    const result = await checkVoucher(code, totalPrice);
    setIsLoading(false);

    if (result.error) {
      toast.error(result.error);
      // Reset nếu đang áp dụng mã cũ mà nhập mã mới sai
      // (Tuỳ logic bạn muốn giữ mã cũ hay không, ở đây mình giữ nguyên mã cũ nếu mã mới sai)
    } else {
      toast.success(result.success);
      setAppliedVoucher({
        code: result.code!,
        discount: result.discountAmount!,
      });
      // Truyền dữ liệu ra ngoài cho Form cha
      onApply(result.discountAmount!, result.voucherId!);
      setCode(""); // Xóa ô nhập
    }
  };

  const handleRemove = () => {
    setAppliedVoucher(null);
    onApply(0, null); // Reset giảm giá về 0
    toast.info("Đã gỡ bỏ mã giảm giá");
  };

  return (
    <div className="bg-white border border-dashed border-blue-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-blue-700 mb-1">
        <TicketPercent className="w-4 h-4" />
        <span>Mã ưu đãi / Voucher</span>
      </div>

      {!appliedVoucher ? (
        // --- TRẠNG THÁI: CHƯA NHẬP MÃ ---
        <div className="flex gap-2">
          <Input 
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Nhập mã (VD: TET2026)"
            className="uppercase font-mono placeholder:normal-case"
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleApply();
              }
            }}
          />
          <Button 
            onClick={handleApply} 
            disabled={isLoading || !code}
            type="button" // Quan trọng: type button để không submit form cha
            variant="secondary"
            className="shrink-0"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Áp dụng"}
          </Button>
        </div>
      ) : (
        // --- TRẠNG THÁI: ĐÃ ÁP DỤNG MÃ ---
        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-md p-3">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1.5 rounded-full border border-emerald-100">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-bold text-emerald-800 text-sm">
                MÃ: {appliedVoucher.code}
              </p>
              <p className="text-xs text-emerald-600 font-medium">
                Đã giảm {formatCurrency(appliedVoucher.discount)}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            type="button"
            className="text-slate-400 hover:text-red-500 hover:bg-red-50 h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};