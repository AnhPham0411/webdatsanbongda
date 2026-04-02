import { db } from "@/lib/db";
import { CategoryForm } from "@/components/admin/category-form";

const NewCategoryPage = async () => {
  // 1. Lấy danh sách tiện nghi
  const amenities = await db.amenity.findMany({
    orderBy: {
      name: "asc",
    },
  });

  // 2. Lấy danh sách vị trí (MỚI THÊM)
  // Lưu ý: Kiểm tra lại tên bảng trong schema của bạn (db.location, db.hotel, hay db.branch...)
  const locations = await db.location.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return ( 
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CategoryForm 
            amenityOptions={amenities} 
            locationOptions={locations} // <--- Truyền vào đây
        />
      </div>
    </div>
  );
}

export default NewCategoryPage;