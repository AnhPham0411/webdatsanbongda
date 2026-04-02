import { db } from "@/lib/db";
import {AmenityClient} from "@/components/admin/amenity-client"; // Handles Create/Delete interactions

export default async function AmenitiesPage() {
  const amenities = await db.amenity.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Dịch vụ & Tiện ích</h1>
        <p className="text-gray-500">Quản lý các dịch vụ đi kèm (Nước uống, Áo bít, Cho thuê giày...)</p>
      </div>
      
      {/* Client component to handle Add/Delete without page reload */}
      <AmenityClient initialData={amenities} />
    </div>
  );
}