import { Room, RoomImage, RoomType, Amenity } from "@prisma/client";

// SafeRoom: Loại bỏ các trường không tồn tại hoặc không an toàn
export type SafeRoom = Omit<Room, "createdAt"> & {
  createdAt: string;
  // updatedAt: string;  <-- XÓA DÒNG NÀY (Vì bảng Room không có cột này)
  roomType: Omit<RoomType, "basePrice"> & {
    basePrice: number;
    amenities: Amenity[];
  };
  images: RoomImage[];
};