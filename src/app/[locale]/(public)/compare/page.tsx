"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Check, ArrowRight, Users, Maximize, AlertCircle, LayoutGrid } from "lucide-react";

import { useCompareStore } from "@/hooks/use-compare-store";
import { getCourtsByIds } from "@/actions/client/get-courts";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function ComparePage() {
  const { ids, removeCourt, clear } = useCompareStore();
  const [courts, setCourts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      if (ids.length === 0) {
        setCourts([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      const data = await getCourtsByIds(ids);
      setCourts(data);
      setLoading(false);
    };

    fetchData();
  }, [ids]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Đang tải dữ liệu...</div>;
  }

  if (courts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="mb-6 flex justify-center">
            <div className="bg-slate-100 p-6 rounded-full">
                <AlertCircle className="w-12 h-12 text-slate-400" />
            </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Chưa có sân bóng nào để so sánh</h2>
        <p className="text-slate-500 mb-8">Hãy chọn các sân bóng bạn quan tâm để xem sự khác biệt.</p>
        <Link href="/search">
          <Button>Khám phá sân bóng ngay</Button>
        </Link>
      </div>
    );
  }

  const renderRow = (label: string, renderCell: (court: any) => React.ReactNode) => (
    <tr className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
      <td className="p-4 font-semibold text-slate-700 bg-slate-50/30 w-[200px] align-top">
        {label}
      </td>
      {courts.map((court) => (
        <td key={court.id} className="p-4 align-top min-w-[250px]">
          {renderCell(court)}
        </td>
      ))}
    </tr>
  );

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-900">So sánh sân bóng ({courts.length}/3)</h1>
        {courts.length > 0 && (
            <Button variant="ghost" onClick={clear} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                Xóa tất cả
            </Button>
        )}
      </div>

      <div className="overflow-x-auto pb-10">
        <table className="w-full border-collapse bg-white shadow-sm rounded-xl overflow-hidden border border-slate-200">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 text-left min-w-[200px]">Thông tin</th>
              {courts.map((court) => (
                <th key={court.id} className="p-4 min-w-[250px] relative">
                  <button 
                    onClick={() => removeCourt(court.id)}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-red-50 hover:text-red-500 transition-colors"
                    title="Xóa sân bóng này"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="font-bold text-slate-900 text-lg mb-1 line-clamp-1">{court.name}</div>
                  <div className="text-blue-600 font-bold text-xl">
                    {formatCurrency(Number(court.courtType.basePrice))}
                    <span className="text-sm font-normal text-slate-500"> / ca</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody className="text-sm">
            {renderRow("Loại & Vị trí", (court) => (
              <div className="space-y-1">
                <Badge variant="outline">{court.courtType.name}</Badge>
                <div className="text-slate-500 flex items-center mt-1">
                    {court.courtType.location?.name || "Hà Nội"}
                </div>
              </div>
            ))}

            {renderRow("Sức chứa & Đặc tính", (court) => (
               <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-slate-700">
                      <Users className="w-4 h-4" /> 
                      <span>Sân tiêu chuẩn thi đấu</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                      <LayoutGrid className="w-4 h-4" /> 
                      <span>Mặt cỏ nhân tạo cao cấp</span>
                  </div>
               </div>
            ))}

            {renderRow("Mô tả", (court) => (
               <p className="text-slate-600 line-clamp-4 leading-relaxed">
                   {court.courtType.description}
               </p>
            ))}

            {renderRow("Tiện ích kèm theo", (court) => (
               <div className="space-y-2">
                   {court.courtType.amenities.map((am: any) => (
                       <div key={am.id} className="flex items-center gap-2 text-slate-700">
                           <Check className="w-4 h-4 text-green-500" />
                           <span>{am.name}</span>
                       </div>
                   ))}
               </div>
            ))}

            {renderRow("", (court) => (
               <Link href={`/courts/${court.id}`} className="block w-full">
                   <Button className="w-full bg-slate-900 hover:bg-blue-600 transition-colors">
                       Xem chi tiết <ArrowRight className="w-4 h-4 ml-2" />
                   </Button>
               </Link>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}