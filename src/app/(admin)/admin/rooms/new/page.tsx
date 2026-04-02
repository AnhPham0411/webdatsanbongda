import { db } from "@/lib/db";
import { RoomForm } from "@/components/admin/room-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default async function NewRoomPage() {
  const roomTypes = await db.roomType.findMany();

  // 👇 Format dữ liệu: Convert Decimal -> Number
  const formattedRoomTypes = roomTypes.map((type) => ({
    ...type,
    basePrice: type.basePrice.toNumber(),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
         {/* Nút quay lại */}
         <div className="flex items-center gap-2 mb-2">
            <Link href="/admin/rooms">
                <Button variant="ghost" size="sm" className="gap-1 pl-0 text-muted-foreground hover:text-foreground">
                    <ChevronLeft className="h-4 w-4" />
                    Quay lại danh sách
                </Button>
            </Link>
        </div>

        {/* Form chính (initialData = null) */}
        <RoomForm 
            initialData={null} 
            roomTypes={formattedRoomTypes} 
        />
      </div>
    </div>
  );
}