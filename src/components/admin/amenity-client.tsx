"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Amenity } from "@prisma/client";
import { Trash2, Plus, Loader2, Check, LayoutGrid } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// Import Action của bạn
import { createAmenity, deleteAmenity } from "@/actions/admin/amenities"; 

interface AmenityClientProps {
  initialData: Amenity[];
}

// 👇 Sử dụng Named Export để tránh lỗi import
export const AmenityClient = ({ initialData }: AmenityClientProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");

  const onAdd = () => {
    if (!name.trim()) return;

    startTransition(async () => {
      // 👇 SỬA Ở ĐÂY: Truyền object { name } thay vì string để khớp với Zod Schema
      const result = await createAmenity({ name: name });
      
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
        setName(""); // Reset ô nhập
        router.refresh();
      }
    });
  };

  const onDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteAmenity(id);
      
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Form Thêm mới */}
      <div className="flex gap-4 items-center bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex-1">
          <Input 
            placeholder="Tên dịch vụ (Ví dụ: Thuê áo bít, Nước suối, Trọng tài...)" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
            className="h-10"
            onKeyDown={(e) => {
              if (e.key === "Enter") onAdd();
            }}
          />
        </div>
        <Button onClick={onAdd} disabled={isPending || !name.trim()}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
          Thêm dịch vụ
        </Button>
      </div>

      <div className="space-y-2">
         <h3 className="font-semibold text-gray-700">Dịch vụ hiện có ({initialData.length})</h3>
         
         {/* Danh sách tiện ích */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {initialData.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center justify-between p-3 border rounded-lg bg-white hover:shadow-md transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                    <LayoutGrid className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-sm">{item.name}</span>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                  onClick={() => onDelete(item.id)}
                  disabled={isPending}
                >
                  {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </Button>
              </div>
            ))}
            
            {initialData.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-400 border-2 border-dashed rounded-xl">
                  Chưa có dịch vụ nào được tạo.
              </div>
            )}
         </div>
      </div>
    </div>
  );
};