import { db } from "@/lib/db";
import { CourtForm } from "@/components/admin/court-form";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// 1. Định nghĩa kiểu Props cho Next.js 15+
interface CourtIdPageProps {
  params: Promise<{
    courtId: string;
  }>;
}

export default async function CourtIdPage(props: CourtIdPageProps) {
  // 2. Await params trước khi sử dụng
  const params = await props.params;
  const { courtId } = params;

  // Kiểm tra nếu courtId không hợp lệ (đề phòng)
  if (!courtId) {
    return redirect("/admin/courts");
  }

  // 3. Fetch dữ liệu
  const [court, courtTypes] = await Promise.all([
    db.court.findUnique({
      where: { id: courtId }, 
      include: { images: true }
    }),
    db.courtType.findMany({
      include: {
        location: true,
      }
    })
  ]);

  // Nếu không tìm thấy sân -> Quay về danh sách
  if (!court) {
    return redirect("/admin/courts");
  }

  // 4. Convert Decimal -> Number
  const formattedCourtTypes = courtTypes.map((type) => ({
    ...type,
    basePrice: type.basePrice.toNumber(),
    locationName: type.location?.name || "Chưa xác định",
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        {/* Nút quay lại */}
        <div className="flex items-center gap-2 mb-2">
            <Link href="/admin/courts">
                <Button variant="ghost" size="sm" className="gap-1 pl-0 text-muted-foreground hover:text-foreground">
                    <ChevronLeft className="h-4 w-4" />
                    Quay lại danh sách
                </Button>
            </Link>
        </div>

        {/* Form chính */}
        <CourtForm 
            initialData={court} 
            courtTypes={formattedCourtTypes} 
        />
      </div>
    </div>
  );
}