import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    // 1. Kiểm tra quyền (Chỉ Admin mới được up ảnh)
    // const session = await auth();
    // if (session?.user?.role !== "ADMIN") {
    //   return new NextResponse("Unauthorized", { status: 401 });
    // }

    // 2. Lấy file từ FormData
    const body = await req.formData();
    const file = body.get("file") as File;

    if (!file) {
      return new NextResponse("No file uploaded", { status: 400 });
    }

    // 3. Convert file sang Buffer để upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // 4. Upload lên Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: "booking-app-rooms", // Tên thư mục trên Cloudinary
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(result);
        }
      ).end(buffer);
    });

    // 5. Trả về URL ảnh
    // @ts-ignore
    return NextResponse.json({ url: result.secure_url });

  } catch (error) {
    console.log("[UPLOAD_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}