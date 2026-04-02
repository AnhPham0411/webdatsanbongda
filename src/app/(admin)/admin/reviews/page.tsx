import { db } from "@/lib/db";
import { ReviewCard } from "@/components/admin/review-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Star, TrendingUp } from "lucide-react";

export default async function ReviewsPage() {
  const reviews = await db.review.findMany({
    include: {
      user: true,
      booking: { include: { court: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // --- Tính toán thống kê ---
  const totalReviews = reviews.length;
  
  // Tính điểm trung bình (cẩn thận chia cho 0)
  const averageRating = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : "0.0";

  // Đếm số lượng 5 sao (để xem độ hài lòng)
  const fiveStarCount = reviews.filter(r => r.rating === 5).length;

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Đánh giá khách hàng</h2>
          <p className="text-muted-foreground">
            Theo dõi phản hồi và mức độ hài lòng về dịch vụ.
          </p>
        </div>
      </div>

      {/* 1. KHU VỰC THỐNG KÊ (STATS) */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng đánh giá</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReviews}</div>
            <p className="text-xs text-muted-foreground">
              Phản hồi từ khách hàng
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Điểm trung bình</CardTitle>
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating} / 5.0</div>
            <p className="text-xs text-muted-foreground">
              Mức độ hài lòng chung
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đánh giá 5 sao</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fiveStarCount}</div>
            <p className="text-xs text-muted-foreground">
              Khách hàng tuyệt đối hài lòng
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 2. DANH SÁCH REVIEW DẠNG GRID */}
      {reviews.length === 0 ? (
         <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg bg-slate-50">
            <p className="text-muted-foreground">Chưa có đánh giá nào.</p>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}