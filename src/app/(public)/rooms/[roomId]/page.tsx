import { getRoomById } from "@/actions/client/get-rooms";
import { BookingForm } from "@/components/client/booking-form";
import { ReviewsList } from "@/components/client/reviews-list";
import { ReviewForm } from "@/components/client/review-form"; // <--- Import ReviewForm
import { notFound } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Wifi, Tv, Wind, Coffee, Utensils, Star, MapPin, MessageSquare, Users } from "lucide-react"; // Added Users here
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { auth } from "@/lib/auth"; // <--- Import auth to get current user

// Next.js 15+ Params type definition
interface RoomDetailPageProps {
  params: Promise<{ roomId: string }>;
}

export default async function RoomDetailPage(props: RoomDetailPageProps) {
  const params = await props.params;
  
  // 1. Fetch Room Data
  const room = await getRoomById(params.roomId);
  
  // 2. Get Current User Session
  const session = await auth();

  if (!room) return notFound();

  // --- RATING CALCULATION LOGIC ---
  const totalReviews = room.reviews.length;
  
  // Calculate average rating safely
  const averageRating = totalReviews > 0
    ? (room.reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : "0.0";
  
  const numericRating = parseFloat(averageRating);

  // Helper: Render Star Icons
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "fill-slate-200 text-slate-200"}`} 
      />
    ));
  };

  // Helper: Get Amenity Icon
  const getAmenityIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("wifi")) return <Wifi className="w-4 h-4"/>;
    if (n.includes("tivi") || n.includes("tv")) return <Tv className="w-4 h-4"/>;
    if (n.includes("lạnh") || n.includes("điều hòa")) return <Wind className="w-4 h-4"/>;
    if (n.includes("cafe")) return <Coffee className="w-4 h-4"/>;
    return <Utensils className="w-4 h-4"/>;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 1. Image Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[400px] md:h-[500px] mb-8 rounded-2xl overflow-hidden shadow-sm">
        <div className="md:col-span-2 relative h-full group cursor-pointer">
           <Image 
             src={room.images[0]?.url || "/images/placeholder.jpg"} 
             alt={room.name} 
             fill 
             className="object-cover hover:scale-105 transition-transform duration-700"
             priority
           />
        </div>
        <div className="md:col-span-2 grid grid-cols-2 gap-4 h-full">
           {room.images.slice(1, 5).map((img, idx) => (
             <div key={idx} className="relative h-full overflow-hidden rounded-lg cursor-pointer">
                <Image 
                  src={img.url} 
                  alt={`Room Image ${idx}`} 
                  fill 
                  className="object-cover hover:scale-110 transition duration-500" 
                />
             </div>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* 2. Room Details (Left Column) */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
               <div>
                  <h1 className="text-3xl font-bold text-gray-900">{room.name}</h1>
                  
                  {/* --- RATING & LOCATION BADGES --- */}
                  <div className="flex items-center gap-4 mt-2 text-sm">
                      <div className="flex items-center text-gray-600">
                          <MapPin className="w-4 h-4 mr-1 text-primary" />
                          {/* Ensure room.roomType.location exists in your data fetching */}
                          <span>{(room.roomType as any).location?.name || "Ha Long Bay"}</span>
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
                   <Badge variant={room.isAvailable ? "outline" : "destructive"} className="text-sm px-3 py-1 border-primary text-primary bg-primary/5">
                     {room.isAvailable ? "Phòng trống" : "Hết phòng"}
                   </Badge>
               </div>
            </div>
            
            <div className="flex gap-6 text-sm text-gray-600 mt-6 border-y py-4 bg-slate-50/50 px-4 rounded-lg">
               <span className="flex items-center gap-2">
                   <Users className="w-4 h-4 text-primary" /> 
                   <span className="font-medium text-gray-900">{room.roomType.capacity}</span> Khách
               </span>
               <div className="w-[1px] h-full bg-gray-300"></div>
               <span className="flex items-center gap-2">
                   <span className="text-xl">🛏️</span> 
                   <span className="font-medium text-gray-900">Giường đôi cao cấp</span>
               </span>
            </div>
          </div>

          <div className="pt-2">
            <h3 className="text-xl font-bold text-gray-800 mb-3">Mô tả phòng</h3>
            <p className="text-gray-600 leading-7 whitespace-pre-line text-justify">
              {room.roomType.description}
            </p>
          </div>

          <div className="pt-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Tiện nghi có sẵn</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {room.roomType.amenities.map((amenity) => (
                <div key={amenity.id} className="flex items-center gap-3 p-3 border rounded-lg bg-white shadow-sm hover:border-primary transition-colors">
                  <div className="p-2 bg-primary/10 rounded-full text-primary">
                    {getAmenityIcon(amenity.name)}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{amenity.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* --- 3. REVIEWS SECTION (IMPROVED UI) --- */}
          <div id="reviews-section" className="border-t pt-10 mt-10 scroll-mt-24">
             <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                Đánh giá từ khách hàng 
                <span className="text-base font-normal text-gray-500">({totalReviews})</span>
             </h3>

             {/* Review Summary Card */}
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
                    <h4 className="font-semibold text-gray-900 mb-2">Trải nghiệm khách hàng</h4>
                    <p className="text-sm text-gray-600 max-w-md">
                        {totalReviews > 0 
                            ? "Khách hàng của chúng tôi đánh giá cao về sự sạch sẽ, tiện nghi và thái độ phục vụ."
                            : "Chưa có đánh giá nào. Hãy là người đầu tiên trải nghiệm và chia sẻ!"}
                    </p>
                </div>

                <div className="hidden md:block">
                    <MessageSquare className="w-12 h-12 text-slate-200" />
                </div>
             </div>

             {/* --- REVIEW FORM (ONLY IF LOGGED IN) --- */}
             <ReviewForm 
                roomId={room.id} 
                currentUser={session?.user} 
             />

             {/* Review List */}
             <div className="space-y-6 mt-8">
                 <ReviewsList reviews={room.reviews} />
             </div>
          </div>
        </div>

        {/* 3. Booking Form (Right Column - Sticky) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 border rounded-2xl shadow-xl shadow-slate-200/50 p-6 bg-white overflow-hidden">
             <div className="flex items-baseline justify-between mb-2">
                <div>
                    <span className="text-2xl font-bold text-primary">
                        {formatCurrency(Number(room.roomType.basePrice))}
                    </span>
                    <span className="text-gray-500 text-sm"> / đêm</span>
                </div>
                <div className="flex items-center text-sm font-medium text-yellow-500">
                    <Star className="w-4 h-4 fill-current mr-1"/>
                    {averageRating}
                </div>
             </div>
             <p className="text-xs text-green-600 mb-6 font-medium">Miễn phí hủy phòng trước 24h</p>
             
             <BookingForm 
                roomId={room.id} 
                basePrice={Number(room.roomType.basePrice)} 
                isAvailable={room.isAvailable}
             />
             
             <div className="mt-4 pt-4 border-t text-center text-xs text-gray-400">
                Không trừ tiền thẻ tín dụng ngay lập tức
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}