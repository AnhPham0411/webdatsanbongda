import { db } from "@/lib/db";
import { LocationsClient } from "@/components/admin/locations-client";

const LocationsPage = async () => {
  // Lấy dữ liệu từ Server (Prisma)
  const locations = await db.location.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        {/* Truyền data xuống Client Component */}
        <LocationsClient data={locations} />
      </div>
    </div>
  );
};

export default LocationsPage;