/**
 * @file page.tsx (Public Home)
 * @description Trang chủ của hệ thống đặt sân bóng (Sport Arena).
 * Hiển thị Banner, bộ lọc tìm kiếm nhanh, các sân bóng nổi bật và thông tin dịch vụ.
 */
import { Suspense } from "react";
import Link from "next/link";
import { getCourts } from "@/actions/client/get-courts";
import { CourtCard } from "@/components/client/court-card";
import { SearchFilters } from "@/components/client/search-filters";
import { HeroSlider } from "@/components/client/hero-slider";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth"; 
import Image from "next/image";
import { 
  ArrowRight, MapPin, Clock, ShieldCheck, Heart, Waves, LayoutGrid
} from "lucide-react";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

import { getTranslations } from "next-intl/server";

export default async function HomePage(props: PageProps) {
  const t = await getTranslations("Hero");
  const params = await props.searchParams;
  const session = await auth();

  // Xử lý tham số truy vấn từ URL để lọc danh sách sân
  const category = typeof params.category === "string" ? params.category : undefined;
  const guests = typeof params.guests === "string" ? Number(params.guests) : undefined;
  const startDate = typeof params.startDate === "string" ? params.startDate : undefined;
  const endDate = typeof params.endDate === "string" ? params.endDate : undefined;

  /**
   * Lấy danh sách sân bóng dựa trên bộ lọc.
   * Logic lọc được thực hiện tại Server Action getCourts.
   */
  const courts = await getCourts({ category, guests, startDate, endDate });

  /**
   * Lọc và sắp xếp các sân bóng có đánh giá (rating) cao nhất để làm "Sân bóng nổi bật".
   */
  const highRatedCourts = courts
    .map((court) => {
      const totalReviews = court.reviews?.length || 0;
      const avgRating = totalReviews > 0
        ? court.reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / totalReviews
        : 0;
      return { ...court, avgRating };
    })
    .filter((r) => r.avgRating >= 4.0)
    .sort((a, b) => b.avgRating - a.avgRating)
    .slice(0, 8);

  const currentT = await getTranslations("Home");

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 font-sans">
      
      {/* 1. Phần Hero Section: Slider hình ảnh và Bộ lọc tìm kiếm nhanh */}
      <section className="relative h-[500px] md:h-[600px]">
        <HeroSlider />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 z-40 translate-y-1/2 px-4">
          <div className="container mx-auto">
            <div className="mx-auto max-w-5xl rounded-2xl border border-slate-100 bg-white p-6 shadow-xl">
              <SearchFilters />
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 pt-32 pb-24 space-y-24">
        
        {/* 2. Phần Giới thiệu: Lý do lựa chọn hệ thống Sport Arena */}
        <section>
             <div className="text-center mb-16 space-y-3">
                 <span className="text-blue-600 font-bold tracking-widest uppercase text-xs">{currentT("whyChoose.badge")}</span>
                 <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">{currentT("whyChoose.title")}</h2>
                 <p className="text-slate-500 max-w-2xl mx-auto italic">{currentT("whyChoose.description")}</p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { icon: ShieldCheck, title: currentT("whyChoose.item1.title"), desc: currentT("whyChoose.item1.desc"), color: "bg-green-100 text-green-600" },
                    { icon: Clock, title: currentT("whyChoose.item2.title"), desc: currentT("whyChoose.item2.desc"), color: "bg-blue-100 text-blue-600" },
                    { icon: MapPin, title: currentT("whyChoose.item3.title"), desc: currentT("whyChoose.item3.desc"), color: "bg-purple-100 text-purple-600" },
                    { icon: Heart, title: currentT("whyChoose.item4.title"), desc: currentT("whyChoose.item4.desc"), color: "bg-red-100 text-red-600" },
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

        {/* 3. Phần Danh sách Sân bóng nổi bật: Hiển thị các sân đánh giá cao */}
        <section id="courts" className="scroll-mt-32">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <div className="h-1 w-10 bg-blue-600 rounded-full"></div>
                    <span className="text-blue-600 font-bold uppercase text-sm tracking-widest">{currentT("featured.badge")}</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
                    {currentT("featured.title")}
                </h2>
            </div>
            <Link href="/courts">
                <Button variant="outline" className="rounded-full px-6 border-slate-300 hover:border-blue-600 hover:text-blue-600 transition-colors">
                    {currentT("featured.viewAll")} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </Link>
          </div>
          
          <Suspense fallback={<div className="h-40 flex items-center justify-center">{currentT("featured.loading")}</div>}>
            {highRatedCourts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <LayoutGrid className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">{currentT("featured.emptyTitle")}</h3>
                    <p className="text-slate-500 max-w-sm mt-2">
                        {currentT("featured.emptyDesc")}
                    </p>
                    <Link href="/courts">
                        <Button variant="link" className="mt-2 text-blue-600">{currentT("featured.viewAllLink")}</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {highRatedCourts.map((court) => (
                        <CourtCard 
                            key={court.id} 
                            court={court} 
                            currentUser={session?.user} 
                        />
                    ))}
                </div>
            )}
          </Suspense>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-white rounded-3xl p-8 lg:p-12 shadow-lg border border-slate-100 overflow-hidden">
            <div className="space-y-6">
                <span className="text-orange-500 font-bold uppercase text-sm tracking-widest">{currentT("amenities.badge")}</span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
                    {currentT("amenities.title")}
                </h2>
                <p className="text-slate-500 text-lg leading-relaxed">
                    {currentT("amenities.description")}
                </p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentT.raw("amenities.items").map((item: string, i: number) => (
                        <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                            <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                                <ShieldCheck className="h-4 w-4" />
                            </div>
                            {item}
                        </li>
                    ))}
                </ul>
                <Button asChild className="mt-4 bg-slate-900 hover:bg-slate-800 text-white px-8 py-6 rounded-xl h-auto text-lg w-full md:w-auto">
                    <Link href="/courts">{currentT("amenities.cta")}</Link>
                </Button>
            </div>
            <div className="relative h-[300px] lg:h-[500px] rounded-2xl overflow-hidden group">
                <Image 
                  fill 
                  src="https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&q=80&w=1200" 
                  alt="Dịch vụ tiện ích" 
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
            </div>
        </section>

        <section className="relative rounded-[2rem] overflow-hidden min-h-[400px] flex items-center justify-center py-20 px-6 text-center shadow-2xl group">
             <div className="absolute inset-0">
                <Image 
                  fill 
                  src="/images/cta-ready.png" 
                  alt="Sẵn sàng ra sân" 
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
             </div>
             <div className="absolute inset-0 bg-slate-950/70" />
             
             <div className="absolute -bottom-1/2 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" />
             <div className="absolute -top-1/2 right-1/4 w-[500px] h-[500px] bg-yellow-600/10 rounded-full blur-[120px]" />

             <div className="absolute top-8 left-8 text-white/40">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,2L4.5,20.29L5.21,21L12,18L18.79,21L19.5,20.29L12,2Z" />
                </svg>
             </div>
             
             <div className="relative z-10 max-w-4xl mx-auto space-y-6">
                 <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-widest drop-shadow-lg">
                     {currentT("cta.title")}
                 </h2>
                 <p className="text-gray-200 text-lg md:text-xl font-medium max-w-2xl mx-auto">
                     {currentT("cta.description")}
                 </p>
                 <div className="pt-4">
                    <Link href="/courts">
                        <Button size="lg" className="h-14 px-12 text-lg bg-white text-slate-900 hover:bg-gray-100 font-bold rounded-lg shadow-2xl border-0 transition-all hover:scale-105 active:scale-95">
                            {currentT("cta.button")}
                        </Button>
                    </Link>
                 </div>
             </div>
        </section>

      </main>
    </div>
  );
}