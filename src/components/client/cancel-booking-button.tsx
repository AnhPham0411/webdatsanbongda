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
import { cancelBooking } from "@/actions/client/booking"; // Import Server Action
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const CancelBookingButton = ({ bookingId }: { bookingId: string }) => {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const onCancel = () => {
    startTransition(async () => {
      const result = await cancelBooking(bookingId);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Hủy phòng thành công");
        setOpen(false); // Đóng modal
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button 
          variant="destructive" 
          size="sm" 
          className="w-full"
          disabled={isPending}
        >
          Hủy phòng
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Bạn có chắc chắn muốn hủy?</AlertDialogTitle>
          <AlertDialogDescription>
            Hành động này không thể hoàn tác. Đơn đặt phòng của bạn sẽ bị hủy và chính sách hoàn tiền sẽ được áp dụng.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Quay lại</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault(); // Ngăn đóng modal tự động để chờ xử lý
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