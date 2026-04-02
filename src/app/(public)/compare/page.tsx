"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Check, ArrowRight, BedDouble, Users, Maximize, AlertCircle } from "lucide-react";

import { useCompareStore } from "@/hooks/use-compare-store";
import { getRoomsByIds } from "@/actions/client/get-rooms";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function ComparePage() {
  const { ids, removeRoom, clear } = useCompareStore();
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch dữ liệu dựa trên IDs từ LocalStorage
  useEffect(() => {
    const fetchData = async () => {
      if (ids.length === 0) {
        setRooms([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      const data = await getRoomsByIds(ids);
      setRooms(data);
      setLoading(false);
    };

    fetchData();
  }, [ids]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Đang tải dữ liệu...</div>;
  }

  if (rooms.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="mb-6 flex justify-center">
            <div className="bg-slate-100 p-6 rounded-full">
                <AlertCircle className="w-12 h-12 text-slate-400" />
            </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Chưa có phòng nào để so sánh</h2>
        <p className="text-slate-500 mb-8">Hãy chọn các phòng bạn quan tâm để xem sự khác biệt.</p>
        <Link href="/search">
          <Button>Khám phá phòng ngay</Button>
        </Link>
      </div>
    );
  }

  // Helper để render hàng so sánh
  const renderRow = (label: string, renderCell: (room: any) => React.ReactNode) => (
    <tr className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
      <td className="p-4 font-semibold text-slate-700 bg-slate-50/30 w-[200px] align-top">
        {label}
      </td>
      {rooms.map((room) => (
        <td key={room.id} className="p-4 align-top min-w-[250px]">
          {renderCell(room)}
        </td>
      ))}
    </tr>
  );

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-900">So sánh phòng ({rooms.length}/3)</h1>
        {rooms.length > 0 && (
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
              {rooms.map((room) => (
                <th key={room.id} className="p-4 min-w-[250px] relative">
                  <button 
                    onClick={() => removeRoom(room.id)}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-red-50 hover:text-red-500 transition-colors"
                    title="Xóa phòng này"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="font-bold text-slate-900 text-lg mb-1 line-clamp-1">{room.name}</div>
                  <div className="text-primary font-bold text-xl">
                    {formatCurrency(Number(room.roomType.basePrice))}
                    <span className="text-sm font-normal text-slate-500"> / đêm</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody className="text-sm">
            {/* 1. Hình ảnh */}
            {renderRow("Hình ảnh", (room) => (
              <div className="relative w-full h-40 rounded-lg overflow-hidden group">
                <Image 
                    src={room.images[0]?.url || "/placeholder.jpg"} 
                    alt={room.name} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-500" 
                />
              </div>
            ))}

            {/* 2. Loại phòng & Địa điểm */}
            {renderRow("Loại & Vị trí", (room) => (
              <div className="space-y-1">
                <Badge variant="outline">{room.roomType.name}</Badge>
                <div className="text-slate-500 flex items-center mt-1">
                    {room.roomType.location?.name || "Ha Long"}
                </div>
              </div>
            ))}

            {/* 3. Sức chứa */}
            {renderRow("Sức chứa", (room) => (
               <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-slate-700">
                      <Users className="w-4 h-4" /> 
                      <span>{room.roomType.capacity} người lớn</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                      <BedDouble className="w-4 h-4" /> 
                      <span>1 Giường đôi lớn</span>
                  </div>
               </div>
            ))}

            {/* 4. Mô tả ngắn */}
            {renderRow("Mô tả", (room) => (
               <p className="text-slate-600 line-clamp-4 leading-relaxed">
                   {room.roomType.description}
               </p>
            ))}

            {/* 5. Tiện nghi (So sánh logic) */}
            {renderRow("Tiện nghi", (room) => (
               <div className="space-y-2">
                   {room.roomType.amenities.map((am: any) => (
                       <div key={am.id} className="flex items-center gap-2 text-slate-700">
                           <Check className="w-4 h-4 text-green-500" />
                           <span>{am.name}</span>
                       </div>
                   ))}
               </div>
            ))}

            {/* 6. Hành động */}
            {renderRow("", (room) => (
               <Link href={`/rooms/${room.id}`} className="block w-full">
                   <Button className="w-full">
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