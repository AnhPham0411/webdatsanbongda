"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Download, QrCode, Copy, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import { generateVietQrUrl } from "@/lib/vietqr";
import { toast } from "sonner";

interface PaymentQRModalProps {
  bookingId: string;
  amount: number;
  guestName: string;
  customTrigger?: React.ReactNode;
}

export const PaymentQRModal = ({ bookingId, amount, guestName, customTrigger }: PaymentQRModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Tránh lỗi Hydration của Next.js
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const qrUrl = generateVietQrUrl({ amount, bookingId });

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `QR-Booking-${bookingId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Đã tải ảnh QR thành công");
    } catch (error) {
      toast.error("Không thể tải ảnh, vui lòng thử lại sau");
      console.error(error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyContent = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(`THANHTOAN ${bookingId}`);
    setCopied(true);
    toast.success("Đã sao chép nội dung chuyển khoản");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {customTrigger ? (
          customTrigger
        ) : (
          <Button variant="outline" size="sm" className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50">
            <QrCode className="h-4 w-4" />
            Xuất QR Thanh toán
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md border-none p-0 overflow-hidden bg-transparent shadow-none">
        <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
            <DialogHeader className="p-6 bg-blue-600 text-white">
              <DialogTitle className="text-center text-xl font-bold">
                Quét mã để thanh toán
              </DialogTitle>
              <DialogDescription className="text-center text-blue-100 italic">
                Khách hàng: {guestName}
              </DialogDescription>
            </DialogHeader>

            <div className="p-6 flex flex-col items-center space-y-4">
              {/* Box chứa QR Code */}
              <div className="relative w-[280px] h-[350px] bg-white rounded-xl shadow-inner border-2 border-dashed border-slate-200 p-2 group">
                 <Image 
                    src={qrUrl} 
                    alt="Payment QR" 
                    fill 
                    className="object-contain p-2" 
                    unoptimized 
                 />
              </div>

              {/* Thông tin chuyển khoản */}
              <div className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Số tiền</span>
                    <span className="font-bold text-xl text-blue-600 tracking-tight">{formatCurrency(amount)}</span>
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t border-slate-200/60">
                    <span className="text-slate-500 text-xs uppercase tracking-wider font-semibold">Nội dung</span>
                    <div 
                        onClick={handleCopyContent}
                        className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer hover:border-blue-400 transition-all active:scale-95"
                    >
                        <code className="text-sm font-mono font-bold text-slate-800">
                            THANHTOAN {bookingId}
                        </code>
                        {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
                    </div>
                </div>
              </div>

              {/* Nút thao tác */}
              <Button 
                onClick={handleDownload} 
                disabled={isDownloading}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
              >
                {isDownloading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Download className="mr-2 h-4 w-4" />
                )}
                Tải ảnh mã QR
              </Button>
              
              <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest font-medium">
                Sử dụng ứng dụng ngân hàng để quét
              </p>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};