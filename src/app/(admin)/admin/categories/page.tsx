import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Users, DollarSign, Activity, Pencil, MapPin } from "lucide-react";
import { DeleteCategoryButton } from "@/components/admin/delete-category-button";
import { Badge } from "@/components/ui/badge";

export default async function CategoriesPage() {
  const categories = await db.courtType.findMany({
    include: { 
        _count: { select: { courts: true } },
        location: true 
    },
    orderBy: [
      { location: { name: 'asc' } }, 
      { basePrice: 'asc' }
    ]
  });

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Loại sân (Hạng sân)</h2>
          <p className="text-muted-foreground">
            Thiết lập các loại sân cho từng cụm sân trong hệ thống Sport Arena.
          </p>
        </div>
        <Link href="/admin/categories/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Thêm loại sân
          </Button>
        </Link>
      </div>

      {categories.length === 0 ? (
         <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg bg-slate-50/50">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 mb-4">
               <Activity className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Chưa có dữ liệu</h3>
            <p className="text-muted-foreground mb-4">Bạn chưa tạo loại sân nào.</p>
            <Link href="/admin/categories/new">
              <Button variant="outline">Tạo loại sân đầu tiên</Button>
            </Link>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div key={cat.id} className="group flex flex-col justify-between overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:shadow-md hover:border-blue-300">
              
              <div className="p-5">
                <div className="mb-3">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 gap-1 pl-2 pr-2.5 py-0.5">
                      <MapPin className="h-3 w-3" /> 
                      {cat.location?.name || "Chưa cập nhật cụm sân"}
                    </Badge>
                </div>

                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {cat.name}
                    </h3>
                    <div className="text-xs text-muted-foreground mt-1">
                      {cat._count.courts} sân đang hoạt động
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-slate-600 border-t pt-4 border-dashed">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-500">
                          <Users className="h-4 w-4" /> Sức chứa
                      </div>
                      <span className="font-medium text-slate-900">{cat.capacity} người</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-500">
                          <DollarSign className="h-4 w-4" /> Giá gốc
                      </div>
                      <span className="font-bold text-slate-900 text-base">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(cat.basePrice))}
                      </span>
                    </div>
                </div>
              </div>

              <div className="bg-slate-50 p-3 px-4 flex items-center gap-2 border-t">
                 <Link href={`/admin/categories/${cat.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full bg-white hover:bg-slate-100 h-9">
                        <Pencil className="mr-2 h-3.5 w-3.5" /> Chỉnh sửa
                    </Button>
                 </Link>
                 <DeleteCategoryButton id={cat.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}