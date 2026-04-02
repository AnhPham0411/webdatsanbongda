"use client";

import { useState, useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation"; // 1. Thêm router để refresh trang

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

// 2. QUAN TRỌNG: Import đúng action xóa Category (Loại phòng)
import { deleteCategory } from "@/actions/admin/categories"; 

interface DeleteCategoryButtonProps {
  id: string;
}

export const DeleteCategoryButton = ({ id }: DeleteCategoryButtonProps) => {
  const router = useRouter(); // Hook để làm mới giao diện
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const onDelete = () => {
    startTransition(async () => {
      // 3. Gọi hàm deleteCategory
      const result = await deleteCategory(id);

      if (result.error) {
        toast.error(result.error);
        // Lưu ý: Không đóng modal để user thấy lỗi và hiểu tại sao không xóa được
      }

      if (result.success) {
        toast.success(result.success);
        setOpen(false);
        router.refresh(); // 4. Refresh lại trang để danh sách cập nhật ngay lập tức
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" className="h-8 w-8 p-0">
           <span className="sr-only">Xóa</span>
           <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa loại phòng?</AlertDialogTitle>
          <AlertDialogDescription>
            Hành động này không thể hoàn tác. Loại phòng này sẽ bị xóa vĩnh viễn khỏi hệ thống.
            <br />
            <br />
            <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-medium border border-red-200">
              ⚠️ Lưu ý: Chỉ xóa được khi không có phòng nào đang thuộc loại này.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Hủy bỏ</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault(); // Ngăn đóng modal tự động
              onDelete();
            }}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {isPending ? "Đang xử lý..." : "Xóa vĩnh viễn"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};