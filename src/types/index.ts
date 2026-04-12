import { Court, CourtImage, CourtType, Amenity } from "@prisma/client";

// SafeCourt: Loại bỏ các trường không tồn tại hoặc không an toàn
export type SafeCourt = Omit<Court, "createdAt"> & {
  createdAt: string;
  courtType: Omit<CourtType, "basePrice"> & {
    basePrice: number;
    amenities: Amenity[];
  };
  images: CourtImage[];
  reviews?: any[];
};