import { Suspense } from "react";
import Link from "next/link";
import { getRooms } from "@/actions/client/get-rooms";
import { RoomCard } from "@/components/client/room-card";
import { SearchFilters } from "@/components/client/search-filters";
import { HeroSlider } from "@/components/client/hero-slider";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth"; 
import { 
  Wifi, Utensils, Waves, Car, ArrowRight, 
  MapPin, Clock, ShieldCheck, Heart, SearchX
} from "lucide-react";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function HomePage(props: PageProps) {
  // 1. Xử lý SearchParams & Auth
  const params = await props.searchParams;
  const session = await auth();

  const category = typeof params.category === "string" ? params.category : undefined;
  const guests = typeof params.guests === "string" ? Number(params.guests) : undefined;
  const startDate = typeof params.startDate === "string" ? params.startDate : undefined;
  const endDate = typeof params.endDate === "string" ? params.endDate : undefined;

  // 2. Lấy dữ liệu
  const rooms = await getRooms({ category, guests, startDate, endDate });

  // 3. Lọc phòng rating cao
  const highRatedRooms = rooms
    .map((room) => {
      const totalReviews = room.reviews?.length || 0;
      const avgRating = totalReviews > 0
        ? room.reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / totalReviews
        : 0;
      return { ...room, avgRating };
    })
    .filter((r) => r.avgRating >= 4.0)
    .sort((a, b) => b.avgRating - a.avgRating)
    .slice(0, 8);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 font-sans">
      
      {/* --- HERO SECTION (ĐÃ KHÔI PHỤC VỀ CŨ) --- */}
      <section className="relative h-[500px] md:h-[600px]">
        <HeroSlider />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* SEARCH FLOATING */}
        <div className="absolute bottom-0 left-0 right-0 z-40 translate-y-1/2 px-4">
          <div className="container mx-auto">
            <div className="mx-auto max-w-5xl rounded-2xl border border-slate-100 bg-white p-6 shadow-xl">
              <SearchFilters />
            </div>
          </div>
        </div>
      </section>

      {/* --- MAIN CONTENT --- */}
      <main className="container mx-auto px-4 pt-32 pb-24 space-y-24">
        
        <section>
             <div className="text-center mb-16 space-y-3">
                 <span className="text-blue-600 font-bold tracking-widest uppercase text-xs">Dịch vụ đẳng cấp</span>
                 <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Tại sao chọn Sport Arena?</h2>
                 <p className="text-slate-500 max-w-2xl mx-auto italic">Hệ thống cụm sân được bảo trì thường xuyên, mặt cỏ tốt, đèn sáng, phù hợp cho anh em đá phủi và giao lưu kết nối.</p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { icon: ShieldCheck, title: "An toàn tuyệt đối", desc: "Bảo mật thông tin & thanh toán an toàn.", color: "bg-green-100 text-green-600" },
                    { icon: Clock, title: "Hỗ trợ 24/7", desc: "Đội ngũ quản lý sân luôn sẵn sàng hỗ trợ bạn đặt lịch và tổ chức trận đấu.", color: "bg-blue-100 text-blue-600" },
                    { icon: MapPin, title: "Vị trí đắc địa", desc: "Tọa lạc tại vị trí trung tâm, giao thông thuận tiện. Ví dụ: Cụm sân Chùa Láng, Đống Đa, Hà Nội.", color: "bg-purple-100 text-purple-600" },
                    { icon: Heart, title: "Dịch vụ tận tâm", desc: "Mặt cỏ nhân tạo chất lượng, dàn đèn LED bù sáng tốt, giúp anh em yên tâm thi đấu.", color: "bg-red-100 text-red-600" },
                ].map((item, idx) => (
                    <div key={idx} className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                        <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                            <item.icon className="h-6 w-6" />
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 mb-2">{item.title}</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                    </div>
                ))}
             </div>
        </section>

        {/* FEATURED ROOMS */}
        <section id="rooms" className="scroll-mt-32">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <div className="h-1 w-10 bg-blue-600 rounded-full"></div>
                    <span className="text-blue-600 font-bold uppercase text-sm tracking-widest">Gợi ý cho bạn</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
                    Sân Bóng Nổi Bật
                </h2>
            </div>
            <Link href="/search">
                <Button variant="outline" className="rounded-full px-6 border-slate-300 hover:border-blue-600 hover:text-blue-600 transition-colors">
                    Xem tất cả <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </Link>
          </div>
          
          <Suspense fallback={<div className="h-40 flex items-center justify-center">Đang tải danh sách sân...</div>}>
            {highRatedRooms.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <Waves className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Chưa có sân bóng nổi bật</h3>
                    <p className="text-slate-500 max-w-sm mt-2">
                        Hiện tại chưa có sân nào đạt đánh giá cao. Mời bạn xem tất cả sân bóng.
                    </p>
                    <Link href="/search">
                        <Button variant="link" className="mt-2 text-blue-600">Xem tất cả sân</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {highRatedRooms.map((room) => (
                        <RoomCard 
                            key={room.id} 
                            room={room} 
                            currentUser={session?.user} 
                        />
                    ))}
                </div>
            )}
          </Suspense>
        </section>

        {/* DISCOVER FOOD */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-white rounded-3xl p-8 lg:p-12 shadow-lg border border-slate-100 overflow-hidden">
            <div className="space-y-6 order-2 lg:order-1">
                <span className="text-orange-500 font-bold uppercase text-sm tracking-widest">Tiện Ích & Dịch Vụ</span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
                    Dịch Vụ & Tiện Ích Đầy Đủ
                </h2>
                <p className="text-slate-500 text-lg leading-relaxed">
                    Sport Arena giúp bạn tìm và giữ chỗ sân 7 nhanh chóng. Cung cấp đầy đủ các nhu cầu thiết yếu cho anh em trước và sau trận đấu như: Cho thuê bóng, áo bíp, nước giải khát.
                </p>
                <ul className="space-y-3">
                    {['Cho thuê bóng & Áo bíp', 'Khu vực Canteen nước giải khát', 'Khu nghỉ ngơi và nhà vệ sinh chuẩn sạch'].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                            <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                                <Wifi className="h-3 w-3" />
                            </div>
                            {item}
                        </li>
                    ))}
                </ul>
                <Button className="mt-4 bg-slate-900 hover:bg-slate-800 text-white px-8 py-6 rounded-xl h-auto text-lg">
                    Xem chi tiết
                </Button>
            </div>
            <div className="relative h-[300px] lg:h-[500px] rounded-2xl overflow-hidden group order-1 lg:order-2">
                <div className="absolute inset-0 bg-slate-300 animate-pulse group-hover:scale-105 transition-transform duration-700 bg-[url('https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
            </div>
        </section>

        {/* CTA FOOTER */}
        <section className="relative rounded-[2rem] overflow-hidden min-h-[300px] flex items-center justify-center py-20 px-6 text-center shadow-2xl group">
             {/* Stadium Background Image */}
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2093&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-700 group-hover:scale-110" />
             
             {/* Navy Overlay */}
             <div className="absolute inset-0 bg-slate-950/70" />
             
             {/* Light Flares / Accents */}
             <div className="absolute -bottom-1/2 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" />
             <div className="absolute -top-1/2 right-1/4 w-[500px] h-[500px] bg-yellow-600/10 rounded-full blur-[120px]" />

             {/* Football Player Icon (Top Left) */}
             <div className="absolute top-8 left-8 text-white/40">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,2L4.5,20.29L5.21,21L12,18L18.79,21L19.5,20.29L12,2Z" />
                </svg>
             </div>
             
             <div className="relative z-10 max-w-4xl mx-auto space-y-6">
                 <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-widest drop-shadow-lg">
                     Sẵn Sàng Ra Sân!
                 </h2>
                 <p className="text-gray-200 text-lg md:text-xl font-medium max-w-2xl mx-auto">
                     Đặt sân chỉ với vài cú click, lịch trình rõ ràng, hỗ trợ nhanh chóng. Nhận ưu đãi lên đến <span className="text-yellow-400 font-bold">20%</span> tiền sân.
                 </p>
                 <div className="pt-4">
                    <Link href="/search">
                        <Button size="lg" className="h-14 px-12 text-lg bg-white text-slate-900 hover:bg-gray-100 font-bold rounded-lg shadow-2xl border-0 transition-all hover:scale-105 active:scale-95">
                            Đặt sân ngay
                        </Button>
                    </Link>
                 </div>
             </div>
        </section>

      </main>
    </div>
  );
}