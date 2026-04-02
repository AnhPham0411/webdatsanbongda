"use client";

import { useState } from "react";
import { toast } from "sonner";
import { 
  MoreHorizontal, 
  CheckCircle2, 
  XCircle, 
  LogIn, 
  LogOut, 
  CreditCard,
  Trash2,
  Copy,
  QrCode
} from "lucide-react";
import { BookingStatus, PaymentStatus, UserRole } from "@prisma/client"; // Import thêm UserRole
import { PaymentQRModal } from "@/components/admin/payment-qr-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

import { updateBookingStatus, updatePaymentStatus, deleteBooking } from "@/actions/admin/bookings";

interface BookingActionsProps {
  id: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  totalPrice: number;
  guestName: string;
  currentUserRole?: string; // 👈 Thêm prop nhận Role
}

export const BookingActions = ({ 
  id, 
  status, 
  paymentStatus, 
  totalPrice, 
  guestName,
  currentUserRole // 👈 Destructure role
}: BookingActionsProps) => {
  const [loading, setLoading] = useState(false);

  // Logic kiểm tra nhanh quyền Admin
  const isAdmin = currentUserRole === "ADMIN";

  const onCopy = () => {
    navigator.clipboard.writeText(id);
    toast.success("Đã copy mã đơn");
  };

  const onUpdateStatus = async (newStatus: BookingStatus) => {
    setLoading(true);
    const res = await updateBookingStatus(id, newStatus);
    if (res.error) toast.error(res.error);
    else toast.success(res.success);
    setLoading(false);
  };

  const onUpdatePayment = async (newStatus: PaymentStatus) => {
    setLoading(true);
    const res = await updatePaymentStatus(id, newStatus);
    if (res.error) toast.error(res.error);
    else toast.success(res.success);
    setLoading(false);
  };

  const onDelete = async () => {
    // Chỉ Admin mới được quyền xóa đơn
    if (!isAdmin) {
      toast.error("Bạn không có quyền xóa đơn hàng này.");
      return;
    }

    if (!confirm("Bạn chắc chắn muốn xóa đơn này? Hành động này không thể hoàn tác!")) return;
    setLoading(true);
    const res = await deleteBooking(id);
    if (res.error) toast.error(res.error);
    else toast.success(res.success);
    setLoading(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
          <DropdownMenuItem onClick={onCopy} className="cursor-pointer">
            <Copy className="mr-2 h-4 w-4" /> Copy Mã đơn
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {/* --- NHÓM QUY TRÌNH: STAFF VÀ ADMIN ĐỀU LÀM ĐƯỢC --- */}
          <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">Vận hành</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onUpdateStatus("CONFIRMED")} disabled={loading || status === "CONFIRMED"}>
            <CheckCircle2 className="mr-2 h-4 w-4 text-blue-600" /> Xác nhận đơn
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onUpdateStatus("CHECKED_IN")} disabled={loading || status === "CHECKED_IN"}>
            <LogIn className="mr-2 h-4 w-4 text-green-600" /> Nhận sân
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onUpdateStatus("CHECKED_OUT")} disabled={loading || status === "CHECKED_OUT"}>
            <LogOut className="mr-2 h-4 w-4 text-purple-600" /> Trả sân
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* --- NHÓM TÀI CHÍNH --- */}
          <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">Thanh toán</DropdownMenuLabel>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
             <PaymentQRModal 
                bookingId={id} 
                amount={totalPrice} 
                guestName={guestName}
                customTrigger={
                    <div className="flex items-center w-full cursor-pointer">
                        <QrCode className="mr-2 h-4 w-4 text-blue-600" /> Xuất QR trả tiền
                    </div>
                }
             />
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <CreditCard className="mr-2 h-4 w-4" /> Trạng thái tiền
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => onUpdatePayment("PAID")}>
                <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" /> Đã thanh toán
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdatePayment("UNPAID")}>
                <XCircle className="mr-2 h-4 w-4 text-yellow-600" /> Chưa thanh toán
              </DropdownMenuItem>
              {/* Chỉ Admin mới được hoàn tiền */}
              {isAdmin && (
                <DropdownMenuItem onClick={() => onUpdatePayment("REFUNDED")}>
                  <LogOut className="mr-2 h-4 w-4 text-red-600" /> Hoàn tiền
                </DropdownMenuItem>
              )}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          {/* --- NHÓM NGUY HIỂM: CHỈ ADMIN THẤY --- */}
          {isAdmin && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onUpdateStatus("CANCELLED")} 
                disabled={loading || status === "CANCELLED"} 
                className="text-orange-600 focus:text-orange-600"
              >
                <XCircle className="mr-2 h-4 w-4" /> Hủy bỏ đơn
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={onDelete} 
                disabled={loading} 
                className="text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Xóa vĩnh viễn
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};