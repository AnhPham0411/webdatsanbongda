import { getCourts } from "@/actions/client/get-courts";
import { CourtCard } from "@/components/client/court-card";
import { SearchFilters } from "@/components/client/search-filters";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, Home, Filter, SearchX } from "lucide-react";
import { auth } from "@/lib/auth";

interface CourtsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CourtsPage(props: CourtsPageProps) {
  const params = await props.searchParams;
  const session = await auth();

  const category = typeof params.category === "string" ? params.category : undefined;
  const guests = typeof params.guests === "string" ? parseInt(params.guests) : undefined;
  const startDate = typeof params.startDate === "string" ? params.startDate : undefined;
  const endDate = typeof params.endDate === "string" ? params.endDate : undefined;

  const courts = await getCourts({
    category,
    guests,
    startDate,
    endDate,
  });

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                <Link href="/" className="hover:text-blue-600 transition-colors flex items-center">
                    <Home className="w-3.5 h-3.5 mr-1" /> Trang chủ
                </Link>
                <ChevronLeft className="w-4 h-4 rotate-180" />
                <span className="text-slate-900 font-medium">Danh sách sân</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Tất cả sân bóng</h1>
            <p className="text-slate-500 mt-2 max-w-2xl">
                Tìm sân cỏ nhân tạo chất lượng tốt nhất khu vực cho trận đấu của bạn.
            </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          <aside className="w-full lg:w-[300px] flex-shrink-0">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24">
              <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                <Filter className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-lg text-slate-800">Bộ lọc</h3>
              </div>
              
              <SearchFilters vertical className="flex-col gap-5 shadow-none border-0 p-0" />
            </div>
          </aside>

          <main className="flex-1">
            
            <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
               <span className="text-slate-700 font-medium">
                  Hiển thị <strong className="text-blue-600">{courts.length}</strong> sân
               </span>
            </div>

            {courts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-300 rounded-2xl bg-white text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-400">
                    <SearchX className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Không tìm thấy sân nào</h3>
                <p className="text-slate-500 mt-2 max-w-md px-4">
                  Hiện tại không có sân nào phù hợp với tiêu chí của bạn. Hãy thử chọn lại khu vực.
                </p>
                <Button variant="outline" className="mt-6 border-blue-200 text-blue-600 hover:bg-blue-50" asChild>
                   <Link href="/courts">Xóa bộ lọc</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {courts.map((court) => (
                  <CourtCard 
                    key={court.id} 
                    court={court} 
                    currentUser={session?.user} 
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}