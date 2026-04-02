import { db } from "@/lib/db";
import { RoomForm } from "@/components/admin/room-form";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// 1. Định nghĩa kiểu Props cho Next.js 15+
interface RoomIdPageProps {
  params: Promise<{
    roomId: string;
  }>;
}

export default async function RoomIdPage(props: RoomIdPageProps) {
  // 2. Await params trước khi sử dụng
  const params = await props.params;
  const { roomId } = params;

  // Kiểm tra nếu roomId không hợp lệ (đề phòng)
  if (!roomId) {
    return redirect("/admin/rooms");
  }

  // 3. Fetch dữ liệu
  const [room, roomTypes] = await Promise.all([
    db.room.findUnique({
      where: { id: roomId }, // Sử dụng biến roomId đã await
      include: { images: true }
    }),
    db.roomType.findMany()
  ]);

  // Nếu không tìm thấy phòng -> Quay về danh sách
  if (!room) {
    return redirect("/admin/rooms");
  }

  // 4. Convert Decimal -> Number
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

        {/* Form chính */}
        <RoomForm 
            initialData={room} 
            roomTypes={formattedRoomTypes} 
        />
      </div>
    </div>
  );
}