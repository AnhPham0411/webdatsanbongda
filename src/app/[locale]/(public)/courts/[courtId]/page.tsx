import { getCourtById } from "@/actions/client/get-courts";
import { BookingForm } from "@/components/client/booking-form";
import { ReviewsList } from "@/components/client/reviews-list";
import { ReviewForm } from "@/components/client/review-form"; 
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, MessageSquare, Users, LayoutGrid, Clock, ShieldCheck } from "lucide-react"; 
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { auth } from "@/lib/auth"; 

interface CourtDetailPageProps {
  params: Promise<{ courtId: string }>;
}

export default async function CourtDetailPage(props: CourtDetailPageProps) {
  const params = await props.params;
  
  const court = await getCourtById(params.courtId);
  const session = await auth();

  if (!court) return notFound();

  const totalReviews = court.reviews.length;
  const averageRating = totalReviews > 0
    ? (court.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : "0.0";
  
  const numericRating = parseFloat(averageRating);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "fill-slate-200 text-slate-200"}`} 
      />
    ));
  };

  const getAmenityIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("nước") || n.includes("uống")) return <Clock className="w-4 h-4"/>;
    if (n.includes("đồ") || n.includes("thay")) return <ShieldCheck className="w-4 h-4"/>;
    return <LayoutGrid className="w-4 h-4"/>;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-3xl p-8 mb-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        <div className="relative z-10">
          <Badge className="mb-4 bg-sky-500 hover:bg-sky-600 border-none px-4 py-1 text-sm">
            {court.courtType.name}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">{court.name}</h1>
          <div className="flex flex-wrap items-center gap-6 text-blue-100">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-sky-400" />
              <span>{(court.courtType as any).location?.name || "Hà Nội"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-sky-400" />
              <span>Sân tiêu chuẩn thi đấu</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="font-bold text-white">{averageRating}</span>
              <span className="opacity-70">({totalReviews} đánh giá)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
               <div>
                  <h1 className="text-3xl font-bold text-gray-900">{court.name}</h1>
                  
                  <div className="flex items-center gap-4 mt-2 text-sm">
                      <div className="flex items-center text-gray-600">
                          <MapPin className="w-4 h-4 mr-1 text-primary" />
                          <span>{(court.courtType as any).location?.name || "Hà Nội"}</span>
                      </div>

                      <div className="w-[1px] h-4 bg-gray-300"></div>

                      <Link href="#reviews-section" className="flex items-center gap-1 cursor-pointer hover:underline decoration-yellow-500 underline-offset-4 transition-all">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-bold text-gray-900">{averageRating}</span>
                          <span className="text-gray-500">({totalReviews} đánh giá)</span>
                      </Link>
                  </div>
               </div>

               <div className="flex flex-col items-end gap-2">
                   <Badge variant={court.isAvailable ? "outline" : "destructive"} className="text-sm px-3 py-1 border-primary text-primary bg-primary/5">
                     {court.isAvailable ? "Sân trống" : "Hết sân"}
                   </Badge>
               </div>
            </div>
            
            <div className="flex gap-6 text-sm text-gray-600 mt-6 border-y py-4 bg-slate-50/50 px-4 rounded-lg">
               <span className="flex items-center gap-2">
                   <span className="text-xl">⚽</span> 
                   <span className="font-medium text-gray-900">Sân bóng cỏ nhân tạo chuyên nghiệp</span>
               </span>
            </div>
          </div>

          <div className="pt-2">
            <h3 className="text-xl font-bold text-gray-800 mb-3">Mô tả sân</h3>
            <p className="text-gray-600 leading-7 whitespace-pre-line text-justify">
              {court.courtType.description}
            </p>
          </div>

          <div className="pt-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Tiện nghi có sẵn</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {court.courtType.amenities.map((amenity: any) => (
                <div key={amenity.id} className="flex items-center gap-3 p-3 border rounded-lg bg-white shadow-sm hover:border-primary transition-colors">
                  <div className="p-2 bg-primary/10 rounded-full text-primary">
                    {getAmenityIcon(amenity.name)}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{amenity.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div id="reviews-section" className="border-t pt-10 mt-10 scroll-mt-24">
             <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                Đánh giá từ cầu thủ 
                <span className="text-base font-normal text-gray-500">({totalReviews})</span>
             </h3>

             <div className="bg-slate-50 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center gap-8 border border-slate-100">
                <div className="flex flex-col items-center justify-center min-w-[150px]">
                    <span className="text-5xl font-extrabold text-gray-900">{averageRating}</span>
                    <div className="flex gap-1 my-2">
                        {renderStars(Math.round(numericRating))}
                    </div>
                    <span className="text-sm text-gray-500">trên 5.0</span>
                </div>
                
                <div className="w-[1px] h-20 bg-gray-200 hidden md:block"></div>

                <div className="flex-1 text-center md:text-left">
                    <h4 className="font-semibold text-gray-900 mb-2">Trải nghiệm thi đấu</h4>
                    <p className="text-sm text-gray-600 max-w-md">
                        {totalReviews > 0 
                            ? "Cầu thủ đánh giá cao về chất lượng mặt cỏ, hệ thống chiếu sáng và phong cách phục vụ."
                            : "Chưa có đánh giá nào. Hãy là người đầu tiên trải nghiệm và chia sẻ!"}
                    </p>
                </div>

                <div className="hidden md:block">
                    <MessageSquare className="w-12 h-12 text-slate-200" />
                </div>
             </div>

             <ReviewForm 
                courtId={court.id} 
                currentUser={session?.user} 
             />

             <div className="space-y-6 mt-8">
                 <ReviewsList reviews={court.reviews} />
             </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 border rounded-2xl shadow-xl shadow-slate-200/50 p-6 bg-white overflow-hidden">
             <div className="flex items-baseline justify-between mb-2">
                <div>
                    <span className="text-2xl font-bold text-blue-600">
                        {formatCurrency(Number(court.courtType.basePrice))}
                    </span>
                    <span className="text-gray-500 text-sm"> / ca</span>
                </div>
                <div className="flex items-center text-sm font-medium text-yellow-500">
                    <Star className="w-4 h-4 fill-current mr-1"/>
                    {averageRating}
                </div>
             </div>
             <p className="text-xs text-green-600 mb-6 font-medium">Hỗ trợ hủy sân trước giờ thi đấu 6 tiếng</p>
             
             <BookingForm 
                courtId={court.id} 
                basePrice={Number(court.courtType.basePrice)} 
                isAvailable={court.isAvailable}
             />
             
             <div className="mt-4 pt-4 border-t text-center text-xs text-gray-400">
                Thanh toán linh hoạt sau khi sử dụng dịch vụ
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}