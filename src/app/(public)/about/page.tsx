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
              <strong>Sport Arena</strong> là hệ thống đặt sân bóng tự động hàng đầu, giúp bạn dễ dàng tìm kiếm và đặt sân chỉ với vài cú click. Chúng tôi cung cấp mặt cỏ chuẩn FIFA và hệ thống chiếu sáng hiện đại.
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
            "Chúng tôi hiểu rằng một mặt cỏ tốt là nền tảng cho những pha bóng đẹp. Sứ mệnh của <span className="font-semibold text-sky-600">Sport Arena</span> là kết nối những người hâm mộ thể thao lại với nhau, cung cấp điều kiện thi đấu tốt nhất, giúp mỗi cầu thủ chỉ cần tập trung vào việc tận hưởng từng đường bóng lăn."
          </p>
          <Separator className="w-24 mx-auto bg-sky-200 h-1" />
        </div>
      </section>

      {/* 4. FEATURES SECTION */}
      <section className="bg-slate-900 text-slate-50 py-20 relative overflow-hidden">
        {/* Background Pattern mờ */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-sky-500 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-sky-500 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Tại sao chọn Sport Arena?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Chuẩn mực mới cho phong trào thể thao thủ đô.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <Card className="bg-slate-800/50 border-slate-700 text-slate-100 backdrop-blur-sm">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="w-12 h-12 bg-sky-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Gem className="w-6 h-6 text-sky-400" />
                </div>
                <h3 className="text-xl font-bold">Chất lượng hàng đầu</h3>
                <p className="text-slate-400">
                  Hệ thống mặt cỏ nhân tạo và ánh sáng đạt chuẩn, đáp ứng mọi nhu cầu thi đấu khắt khe nhất.
                </p>
              </CardContent>
            </Card>

            {/* Card 2 */}
            <Card className="bg-slate-800/50 border-slate-700 text-slate-100 backdrop-blur-sm">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="w-12 h-12 bg-sky-500/20 rounded-full flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-6 h-6 text-sky-400" />
                </div>
                <h3 className="text-xl font-bold">Minh bạch & Dễ dàng</h3>
                <p className="text-slate-400">
                  Giá giờ thuê rõ ràng. Đặt sân dễ dàng trên hệ thống, không thu thêm phí ẩn, hỗ trợ nhanh chóng.
                </p>
              </CardContent>
            </Card>

            {/* Card 3 */}
            <Card className="bg-slate-800/50 border-slate-700 text-slate-100 backdrop-blur-sm">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="w-12 h-12 bg-sky-500/20 rounded-full flex items-center justify-center mx-auto">
                  <Activity className="w-6 h-6 text-sky-400" />
                </div>
                <h3 className="text-xl font-bold">Kết nối phong trào</h3>
                <p className="text-slate-400">
                  Hỗ trợ tìm kiếm các đội bóng giao hữu, cung cấp dịch vụ trọng tài và tổ chức các giải đấu phong trào.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 5. TEAM/STORY */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden shadow-xl shadow-sky-100 order-2 md:order-1">
             <img 
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop" 
              alt="Our Team" 
              className="w-full h-full object-cover hover:scale-105 transition duration-700"
            />
          </div>
          <div className="space-y-6 order-1 md:order-2">
            <h2 className="text-3xl font-bold text-slate-900">Đội ngũ Sport Arena</h2>
            <p className="text-slate-600">
              Chúng tôi là những người anh em chung niềm đam mê cháy bỏng với trái bóng tròn.
              Kết hợp giữa sự thấu hiểu nhu cầu của một "Dân bóng" và công nghệ hiện đại, chúng tôi xây dựng nền tảng này để phục vụ cộng đồng.
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