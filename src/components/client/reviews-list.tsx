"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Reply, MapPin } from "lucide-react"; // Thêm icon Reply
import { format } from "date-fns";
import { vi } from "date-fns/locale";

// 1. Cập nhật Interface để nhận thêm trường adminReply
interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string | Date;
  // --- MỚI ---
  adminReply: string | null;
  repliedAt: string | Date | null;
  // -----------
  user: {
    name: string | null;
    image: string | null;
  };
}

interface ReviewsListProps {
  reviews: Review[];
}

export const ReviewsList = ({ reviews }: ReviewsListProps) => {
  // Sắp xếp review mới nhất lên đầu
  const sortedReviews = [...reviews].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (reviews.length === 0) {
    return (
      <div className="text-center py-10 border-2 border-dashed rounded-xl bg-slate-50 text-gray-500">
        Chưa có đánh giá nào cho phòng này.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* (Optional) Header đã được hiển thị ở trang cha, có thể bỏ dòng h3 này nếu muốn */}
      {/* <h3 className="text-xl font-semibold flex items-center gap-2">
        Đánh giá của khách hàng 
        <span className="text-sm font-normal text-gray-500">({reviews.length})</span>
      </h3> */}

      <div className="space-y-8">
        {sortedReviews.map((review) => (
          <div key={review.id} className="flex gap-4">
            {/* Avatar Khách */}
            <Avatar className="h-10 w-10 border">
              <AvatarImage src={review.user.image || ""} />
              <AvatarFallback className="bg-slate-100 text-slate-500">
                {review.user.name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              {/* Tên & Ngày */}
              <div className="flex justify-between items-center mb-1">
                <h4 className="font-bold text-slate-900 text-sm">
                    {review.user.name || "Khách hàng ẩn danh"}
                </h4>
                <span className="text-xs text-gray-400">
                  {format(new Date(review.createdAt), "dd 'thg' MM, yyyy", { locale: vi })}
                </span>
              </div>
              
              {/* Số sao */}
              <div className="flex items-center gap-0.5 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < review.rating ? "fill-yellow-400 text-yellow-400" : "fill-slate-200 text-slate-200"
                    }`}
                  />
                ))}
              </div>

              {/* Nội dung Review */}
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                {review.comment || "Khách hàng không để lại bình luận."}
              </p>

              {/* --- PHẦN HIỂN THỊ ADMIN TRẢ LỜI --- */}
              {review.adminReply && (
                <div className="mt-4 ml-2 md:ml-4 bg-slate-50 p-4 rounded-xl border border-slate-100 relative">
                    {/* Đường nối visual */}
                    <div className="absolute -top-2 left-4 w-4 h-4 bg-slate-50 border-t border-l border-slate-100 transform rotate-45"></div>
                    
                    <div className="flex items-center gap-2 mb-2">
                        <div className="bg-blue-600 p-1 rounded-full">
                            <MapPin className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-xs font-bold text-slate-900">Phản hồi từ Chỗ nghỉ</span>
                        {review.repliedAt && (
                            <span className="text-[10px] text-gray-400">
                                • {format(new Date(review.repliedAt), "dd/MM/yyyy")}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-slate-600 italic">
                        "{review.adminReply}"
                    </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};