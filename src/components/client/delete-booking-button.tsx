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
import { deleteUserBooking } from "@/actions/client/booking";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";

interface DeleteBookingButtonProps {
  bookingId: string;
}

export const DeleteBookingButton = ({ bookingId }: DeleteBookingButtonProps) => {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const onDelete = () => {
    startTransition(async () => {
      const result = await deleteUserBooking(bookingId);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success || "Đã xóa lịch sử!");
        setOpen(false);
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className="h-7 w-7 rounded-full bg-white/80 hover:bg-red-50 hover:text-red-600 shadow-sm border border-slate-200 transition-all"
          title="Xóa khỏi lịch sử"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa lịch sử đặt sân?</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa đơn đặt sân này khỏi lịch sử? 
            Hành động này sẽ xóa vĩnh viễn dữ liệu và không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onDelete();
            }}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Xóa ngay
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
