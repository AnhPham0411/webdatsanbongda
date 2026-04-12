import { db } from "@/lib/db";
import { CategoryForm } from "@/components/admin/category-form";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface CategoryIdPageProps {
  params: Promise<{
    categoryId: string;
  }>;
}

export default async function CategoryIdPage(props: CategoryIdPageProps) {
  const params = await props.params;
  
  // 1. Lấy thông tin Category hiện tại
  const category = await db.courtType.findUnique({
    where: { id: params.categoryId },
    // QUAN TRỌNG: Phải include amenities để biết sân này đã có tiện nghi gì
    include: {
        amenities: true 
    } 
  });

  // Nếu không tìm thấy -> Quay về danh sách
  if (!category) {
    return redirect("/admin/categories");
  }

  // 2. Lấy danh sách options (BẮT BUỘC ĐỂ FORM CÓ DỮ LIỆU CHỌN)
  const amenities = await db.amenity.findMany({
    orderBy: { name: "asc" },
  });

  const locations = await db.location.findMany({
    orderBy: { name: "asc" },
  });

  // Convert Decimal -> Number
  const formattedCategory = {
    ...category,
    basePrice: Number(category.basePrice),
  };

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center gap-2 mb-2">
            <Link href="/admin/categories">
                <Button variant="ghost" size="sm" className="gap-1 pl-0 text-muted-foreground hover:text-foreground">
                    <ChevronLeft className="h-4 w-4" />
                    Quay lại danh sách
                </Button>
            </Link>
        </div>

        <CategoryForm 
            initialData={formattedCategory} 
            amenityOptions={amenities} // <--- Truyền vào đây
            locationOptions={locations} // <--- Truyền vào đây
        />
      </div>
    </div>
  );
}