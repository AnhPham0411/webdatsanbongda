import { Suspense } from "react";
import Link from "next/link";
import { getCourts } from "@/actions/client/get-courts";
import { CourtCard } from "@/components/client/court-card";
import { SearchFilters } from "@/components/client/search-filters";
import { SearchSorter } from "@/components/client/search-sorter";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { 
  SearchX, 
  Home, 
  ChevronRight
} from "lucide-react";

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SearchPage(props: SearchPageProps) {
  const params = await props.searchParams;
  const session = await auth();

  const category = typeof params.category === 'string' ? params.category : undefined;
  const guests = typeof params.guests === 'string' ? parseInt(params.guests) : undefined;
  const startDate = typeof params.startDate === 'string' ? params.startDate : undefined;
  const endDate = typeof params.endDate === 'string' ? params.endDate : undefined;
  const sort = typeof params.sort === 'string' ? params.sort : undefined;
  const locationId = typeof params.locationId === 'string' ? params.locationId : undefined;
  const district = typeof params.district === 'string' ? params.district : undefined;

  const courts = await getCourts({
    category,
    guests,
    startDate,
    endDate,
    sort,
    locationId, 
    district,
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
            <div className="flex items-center text-sm text-slate-500 mb-4">
                <Link href="/" className="hover:text-blue-600 flex items-center gap-1">
                    <Home className="h-3 w-3" /> Trang chủ
                </Link>
                <ChevronRight className="h-3 w-3 mx-1" />
                <span className="text-slate-900 font-medium">Tìm kiếm</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                Kết quả tìm kiếm
            </h1>
        </div>
      </div>

      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b shadow-sm">
         <div className="container mx-auto px-4 py-4">
            <SearchFilters className="flex-row gap-4 shadow-sm border border-slate-200 p-2 rounded-xl bg-white" />
         </div>
      </div>

      <div className="container mx-auto px-4 py-8">
         <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
            <div>
                <p className="text-slate-600">
                    Tìm thấy <span className="font-bold text-slate-900">{courts.length}</span> sân phù hợp
                    {category && category !== "all" && (
                      <span> thuộc loại <span className="font-semibold text-blue-600">"{category}"</span></span>
                    )}
                </p>
            </div>

            <Suspense fallback={<div className="w-[180px] h-10 bg-slate-100 rounded animate-pulse" />}>
                <SearchSorter />
            </Suspense>
         </div>

         <Suspense fallback={<SearchSkeleton />}>
            {courts.length === 0 ? (
                <EmptyState />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {courts.map((court) => (
                        <CourtCard 
                            key={court.id} 
                            court={court} 
                            currentUser={session?.user}
                        />
                    ))}
                </div>
            )}
         </Suspense>
      </div>
    </div>
  );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 text-center px-4">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <SearchX className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Không tìm thấy sân bóng nào</h3>
            <p className="text-slate-500 max-w-md mt-2 mb-6">
                Rất tiếc, chúng tôi không tìm thấy sân nào phù hợp với bộ lọc của bạn hoặc các sân đã được đặt hết trong khoảng thời gian này.
            </p>
            <Link href="/search">
                <Button variant="outline" className="min-w-[150px]">
                    Xóa tất cả bộ lọc
                </Button>
            </Link>
        </div>
    );
}

function SearchSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden border shadow-sm h-[400px] animate-pulse">
                    <div className="h-48 bg-slate-200" />
                    <div className="p-4 space-y-3">
                        <div className="h-6 bg-slate-200 rounded w-3/4" />
                        <div className="h-4 bg-slate-200 rounded w-1/2" />
                        <div className="h-10 bg-slate-200 rounded mt-4" />
                    </div>
                </div>
            ))}
        </div>
    );
}