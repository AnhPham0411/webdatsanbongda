"use client";

import { useState, useTransition } from "react";
import { Star, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { createReview } from "@/actions/client/reviews";

interface ReviewFormProps {
  courtId: string;
  currentUser?: any; 
}

export const ReviewForm = ({ courtId, currentUser }: ReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // 1. Nếu chưa đăng nhập -> Hiện thông báo yêu cầu đăng nhập
  if (!currentUser) {
    return (
      <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-8 text-center mb-8">
        <h4 className="text-lg font-semibold text-slate-800 mb-2">Bạn đã từng chơi bóng tại đây?</h4>
        <p className="text-slate-500 mb-4 text-sm">Vui lòng đăng nhập để chia sẻ trải nghiệm của bạn.</p>
        <Link href="/auth/login">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/5">
            Đăng nhập ngay
            </Button>
        </Link>
      </div>
    );
  }

  // 2. Xử lý Submit
  const onSubmit = () => {
    if (rating === 0) {
        toast.error("Vui lòng chạm vào các ngôi sao để chấm điểm.");
        return;
    }

    startTransition(async () => {
      const res = await createReview(courtId, rating, comment);
      
      if (res.error) {
        toast.error(res.error);
      } 
      
      if (res.success) {
        toast.success(res.success);
        // Reset form
        setRating(0);
        setComment("");
        // Refresh để hiện review mới trong ReviewsList ngay lập tức
        router.refresh(); 
      }
    });
  };

  return (
    <div className="bg-white border rounded-2xl p-6 shadow-sm mb-10">
      <h3 className="text-lg font-bold text-gray-900 mb-1">Viết đánh giá mới</h3>
      <p className="text-sm text-gray-500 mb-4">Chia sẻ cảm nhận của bạn về chất lượng sân và dịch vụ tại đây.</p>
      
      <div className="flex items-center gap-2 mb-4">
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
            <button
                key={star}
                type="button"
                className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                disabled={isPending}
            >
                <Star
                className={`w-8 h-8 transition-colors ${
                    star <= (hoverRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-slate-100 text-slate-300"
                }`}
                />
            </button>
            ))}
        </div>
        <span className="text-sm font-medium text-yellow-600 ml-2 min-w-[80px]">
            {rating > 0 ? (rating === 5 ? "Tuyệt vời" : rating === 4 ? "Rất tốt" : rating === 3 ? "Bình thường" : "Tệ") : ""}
        </span>
      </div>

      <div className="space-y-4">
        <Textarea
            placeholder="Chất lượng cỏ thế nào? Đèn chiếu sáng và dịch vụ ra sao? Hãy chia sẻ cho mọi người cùng biết..."
            className="min-h-[100px] text-base resize-none focus-visible:ring-primary"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={isPending}
        />

        <div className="flex justify-end">
            <Button 
                onClick={onSubmit} 
                disabled={isPending || rating === 0}
                className="px-6 bg-primary hover:bg-primary/90"
            >
                {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Send className="mr-2 h-4 w-4" />
                )}
                Gửi đánh giá
            </Button>
        </div>
      </div>
    </div>
  );
};