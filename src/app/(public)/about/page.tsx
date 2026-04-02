import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle2, 
  Gem, 
  Headphones, 
  HeartHandshake, 
  ShieldCheck, 
  Activity, 
  Trophy 
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* 1. HERO SECTION */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Kết nối đam mê, <br />
              <span className="text-sky-500">Bùng nổ trên sân cỏ</span>
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              <strong>Sport Arena</strong> là hệ thống đặt sân bóng sân 7 nhanh chóng, giúp bạn dễ dàng tìm kiếm và giữ chỗ chỉ với vài cú click. Chúng tôi cung cấp mặt cỏ nhân tạo chất lượng và dàn đèn LED bù sáng tốt.
            </p>
            <div className="flex gap-4">
              <Button asChild size="lg" className="h-12 px-8 text-base bg-sky-500 hover:bg-sky-600 shadow-sky-200 shadow-lg border-none">
                <Link href="/search">Đặt sân ngay</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base border-sky-200 text-sky-600 hover:bg-sky-50">
                <Link href="/contact">Liên hệ hợp tác</Link>
              </Button>
            </div>
          </div>
          
          {/* Ảnh minh họa: Football Field */}
          <div className="relative overflow-hidden rounded-2xl shadow-2xl shadow-sky-100">
            <img 
              src="https://images.unsplash.com/photo-1459865264687-595d652de67e?q=80&w=1920" 
              alt="High quality football field" 
              className="w-full h-full object-cover transform hover:scale-105 transition duration-700"
            />
          </div>
        </div>
      </section>

      {/* 2. STATS SECTION */}
      <section className="bg-sky-50 py-16 border-y border-sky-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-sky-600">50+</h3>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Cụm sân</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-sky-600">10k+</h3>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Cầu thủ</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-sky-600">TOP 1</h3>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Tại Hà Nội</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-4xl font-bold text-sky-600">24/7</h3>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Hỗ trợ đặt sân</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MISSION SECTION */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <Trophy className="w-16 h-16 text-sky-500 mx-auto opacity-20" />
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            Sứ mệnh của chúng tôi
          </h2>
          <p className="text-xl text-slate-600 leading-relaxed font-light">
            "Chúng tôi hiểu rằng một mặt cỏ tốt là nền tảng cho những pha bóng đẹp. Sứ mệnh của <span className="font-semibold text-sky-600">Sport Arena</span> là kết nối anh em phủi, cung cấp sân bãi chất lượng, đèn sáng, giúp anh em chỉ cần tập trung vào việc tận hưởng từng đường bóng lăn."
          </p>
          <Separator className="w-24 mx-auto bg-sky-200 h-1" />
        </div>
      </section>

      {/* 4. FEATURES SECTION (REDESIGNED) */}
      <section className="bg-slate-950 text-slate-50 py-24 relative overflow-hidden">
        {/* Deep Ambient Glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-48 -left-48 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[120px]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[140px]"></div>
            <div className="absolute -bottom-48 -right-48 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px]"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-1.5 mb-4 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold uppercase tracking-widest">
              Ưu điểm vượt trội
            </div>
            <h2 className="text-4xl font-extrabold text-white mb-6">Tại sao chọn Sport Arena?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
              Kiến tạo tiêu chuẩn mới cho trải nghiệm thể thao cộng đồng tại thủ đô.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {/* Card 1 */}
            <div className="group relative p-8 rounded-3xl bg-slate-900 border border-slate-800 transition-all duration-500 hover:border-sky-500/50 hover:shadow-[0_20px_50px_rgba(14,165,233,0.15)] overflow-hidden">
              <span className="absolute -bottom-4 -right-2 text-9xl font-black text-slate-800/20 group-hover:text-sky-500/10 transition-colors duration-500 select-none">01</span>
              <div className="relative z-10 space-y-6">
                <div className="relative w-14 h-14">
                  <div className="absolute inset-0 bg-sky-500 blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                  <div className="relative w-14 h-14 rounded-2xl bg-sky-500/10 flex items-center justify-center transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110">
                    <Gem className="w-7 h-7 text-sky-400" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white group-hover:text-sky-400 transition-colors">Chất lượng tốt</h3>
                <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                  Hệ thống mặt cỏ nhân tạo chất lượng và dàn đèn LED bù sáng tốt, mang lại trải nghiệm thi đấu tốt nhất cho anh em.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group relative p-8 rounded-3xl bg-slate-900 border border-slate-800 transition-all duration-500 hover:border-sky-500/50 hover:shadow-[0_20px_50px_rgba(14,165,233,0.15)] overflow-hidden">
              <span className="absolute -bottom-4 -right-2 text-9xl font-black text-slate-800/20 group-hover:text-sky-500/10 transition-colors duration-500 select-none">02</span>
              <div className="relative z-10 space-y-6">
                <div className="relative w-14 h-14">
                  <div className="absolute inset-0 bg-sky-500 blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                  <div className="relative w-14 h-14 rounded-2xl bg-sky-500/10 flex items-center justify-center transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110">
                    <ShieldCheck className="w-7 h-7 text-sky-400" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white group-hover:text-sky-400 transition-colors">Minh bạch & Dễ dàng</h3>
                <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                  Quy trình đặt sân tự động hóa 100%. Giá cả minh bạch, không chi phí ẩn, thanh toán bảo mật.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group relative p-8 rounded-3xl bg-slate-900 border border-slate-800 transition-all duration-500 hover:border-sky-500/50 hover:shadow-[0_20px_50px_rgba(14,165,233,0.15)] overflow-hidden">
              <span className="absolute -bottom-4 -right-2 text-9xl font-black text-slate-800/20 group-hover:text-sky-500/10 transition-colors duration-500 select-none">03</span>
              <div className="relative z-10 space-y-6">
                <div className="relative w-14 h-14">
                  <div className="absolute inset-0 bg-sky-500 blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                  <div className="relative w-14 h-14 rounded-2xl bg-sky-500/10 flex items-center justify-center transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110">
                    <Activity className="w-7 h-7 text-sky-400" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white group-hover:text-sky-400 transition-colors">Kết nối phong trào</h3>
                <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                  Cộng đồng kết nối mạnh mẽ, hỗ trợ tìm đối giao hữu và tổ chức giải đấu chuyên nghiệp.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TEAM/STORY */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative h-72 md:h-[450px] rounded-3xl overflow-hidden shadow-2xl shadow-sky-500/10 order-2 md:order-1 border-4 border-white">
             <img 
              src="/images/about/team.png" 
              alt="Our Management Team" 
              className="w-full h-full object-cover hover:scale-105 transition duration-1000 ease-out"
            />
            {/* Soft Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent pointer-events-none"></div>
          </div>
          <div className="space-y-6 order-1 md:order-2">
            <h2 className="text-3xl font-bold text-slate-900">Đội ngũ Sport Arena</h2>
            <p className="text-slate-600">
              Chúng tôi là những anh em chung niềm đam mê phủi. 
              Kết hợp giữa sự thấu hiểu nhu cầu của anh em sân cỏ và công nghệ hiện đại, chúng tôi xây dựng nền tảng này để phục vụ cộng đồng.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-slate-700">
                <CheckCircle2 className="w-5 h-5 text-sky-500" />
                <span>Hoạt động 24/7 không ngừng nghỉ</span>
              </li>
              <li className="flex items-center gap-3 text-slate-700">
                <CheckCircle2 className="w-5 h-5 text-sky-500" />
                <span>Đặt sự chuyên nghiệp của dịch vụ lên hàng đầu</span>
              </li>
              <li className="flex items-center gap-3 text-slate-700">
                <CheckCircle2 className="w-5 h-5 text-sky-500" />
                <span>Công nghệ chọn ca đá tối ưu thời gian</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}