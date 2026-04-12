"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cancelBooking } from "@/actions/client/booking";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const CancelBookingButton = ({ 
  bookingId, 
  date, 
  timeStart 
}: { 
  bookingId: string;
  date?: string | Date;
  timeStart?: string | Date;
}) => {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  let isTooLate = false;
  if (date && timeStart) {
    const matchStart = new Date(date);
    const ts = new Date(timeStart);
    matchStart.setHours(ts.getUTCHours(), ts.getUTCMinutes(), 0, 0);
    isTooLate = matchStart.getTime() - Date.now() < 6 * 60 * 60 * 1000;
  }

  const onCancel = () => {
    startTransition(async () => {
      const result = await cancelBooking(bookingId);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Hủy đặt sân thành công!");
        setOpen(false);
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <div className="w-full">
          <Button 
            variant="destructive" 
            size="sm" 
            className="w-full"
            disabled={isPending || isTooLate}
          >
            Hủy sân
          </Button>
          {isTooLate && (
            <p className="text-[10px] text-red-500 mt-1 leading-tight text-center px-1">
              Chỉ được phép hủy sân trước giờ đá 6 tiếng. Vui lòng liên hệ hotline để được hỗ trợ.
            </p>
          )}
        </div>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Bạn có chắc chắn muốn hủy?</AlertDialogTitle>
          <AlertDialogDescription>
            Hành động này không thể hoàn tác. Đơn đặt sân của bạn sẽ bị hủy và chính sách hoàn tiền sẽ được áp dụng.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Quay lại</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault();
              onCancel();
            }}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Xác nhận hủy
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};