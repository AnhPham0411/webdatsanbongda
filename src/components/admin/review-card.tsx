"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Star, Trash2, Quote, Activity, MessageCircle, Reply, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
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

import { deleteReview, replyToReview } from "@/actions/admin/reviews"; // Đảm bảo đã import replyToReview

interface ReviewCardProps {
  review: any; 
}

export const ReviewCard = ({ review }: ReviewCardProps) => {
  const [isPending, startTransition] = useTransition();
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState(review.adminReply || "");

  // Kiểm tra xem review này đã được admin trả lời chưa
  const hasReplied = !!review.adminReply;

  // --- XỬ LÝ XÓA REVIEW ---
  const onDelete = () => {
    startTransition(async () => {
      const res = await deleteReview(review.id);
      if (res.error) toast.error(res.error);
      if (res.success) toast.success(res.success);
    });
  };

  // --- XỬ LÝ GỬI PHẢN HỒI ---
  const handleReply = () => {
    if (!replyText.trim()) return;
    
    startTransition(async () => {
      const res = await replyToReview(review.id, replyText);
      if (res.error) {
        toast.error(res.error);
      } 
      if (res.success) {
        toast.success(res.success);
        setIsReplying(false); // Đóng form nhập
      }
    });
  };

  return (
    <div className="group relative flex flex-col gap-4 rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md h-full">
      {/* 1. Header: User Info & Actions */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border">
            <AvatarImage src={review.user.image || ""} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {review.user.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-slate-900">{review.user.name}</p>
            <p className="text-xs text-slate-500">
              {format(new Date(review.createdAt), "dd 'thg' MM, yyyy", { locale: vi })}
            </p>
          </div>
        </div>

        {/* Delete Button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-600 h-8 w-8"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xóa đánh giá này?</AlertDialogTitle>
              <AlertDialogDescription>
                Hành động này sẽ xóa vĩnh viễn đánh giá của khách hàng <b>{review.user.name}</b>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction 
                onClick={onDelete} 
                disabled={isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {isPending ? "Đang xóa..." : "Xóa ngay"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* 2. Rating & Room Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < review.rating ? "fill-yellow-400 text-yellow-400" : "fill-slate-100 text-slate-200"
              }`}
            />
          ))}
          <span className="ml-2 text-sm font-medium text-slate-700">{review.rating}.0</span>
        </div>
        
        <Badge variant="secondary" className="font-normal text-xs bg-slate-50 text-slate-600 border border-slate-200">
          <Activity className="h-3 w-3 mr-1" />
          {review.booking.court.name}
        </Badge>
      </div>

      {/* 3. Comment Content */}
      <div className="relative rounded-lg bg-slate-50 p-4 text-sm text-slate-600 italic border border-slate-100">
        <Quote className="absolute -top-2 -left-2 h-4 w-4 text-slate-300 fill-slate-300" />
        {review.comment || "Khách hàng không để lại bình luận."}
      </div>

      <Separator className="my-1" />

      {/* 4. Admin Reply Section */}
      <div className="mt-auto pt-2">
        {/* Case A: Đã trả lời -> Hiển thị nội dung */}
        {hasReplied && !isReplying && (
            <div className="bg-blue-50/60 p-3 rounded-lg border border-blue-100">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-blue-700 flex items-center gap-1.5">
                  <Reply className="h-3 w-3" /> Phản hồi của bạn
                </span>
                {review.repliedAt && (
                    <span className="text-[10px] text-blue-400">
                        {format(new Date(review.repliedAt), "dd/MM/yyyy", { locale: vi })}
                    </span>
                )}
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{review.adminReply}</p>
              <div className="mt-2 flex justify-end">
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="h-auto p-0 text-xs text-blue-600 hover:text-blue-800"
                    onClick={() => setIsReplying(true)}
                  >
                    Chỉnh sửa
                  </Button>
              </div>
            </div>
        )}

        {/* Case B: Form Nhập liệu (Chưa trả lời hoặc đang sửa) */}
        {(!hasReplied || isReplying) && (
            <div className="space-y-3">
               {!isReplying && !hasReplied ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-muted-foreground hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-colors"
                    onClick={() => setIsReplying(true)}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Viết phản hồi
                  </Button>
               ) : (
                 <div className="animate-in fade-in zoom-in-95 duration-200">
                    <Textarea 
                        disabled={isPending}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Nhập câu trả lời của bạn..."
                        className="text-sm min-h-[80px] mb-2 focus-visible:ring-blue-500"
                    />
                    <div className="flex items-center gap-2 justify-end">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            disabled={isPending} 
                            onClick={() => {
                                setIsReplying(false);
                                setReplyText(review.adminReply || ""); // Reset về cũ
                            }}
                            className="h-8 px-3"
                        >
                            Hủy
                        </Button>
                        <Button 
                            size="sm" 
                            disabled={isPending || !replyText.trim()} 
                            onClick={handleReply}
                            className="h-8 px-3 bg-blue-600 hover:bg-blue-700"
                        >
                            {isPending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                            Gửi
                        </Button>
                    </div>
                 </div>
               )}
            </div>
        )}
      </div>
    </div>
  );
};