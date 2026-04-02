"use server";

import fs from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth"; // ✅ Đảm bảo import auth của bạn

export const uploadImageLocal = async (formData: FormData) => {
  try {
    // 🔒 BẢO MẬT: Chỉ cho phép ADMIN và STAFF upload file lên server
    const session = await auth();
    const role = session?.user?.role;

    if (role !== "ADMIN" && role !== "STAFF") {
      return { error: "Bạn không có quyền upload ảnh lên hệ thống!" };
    }

    const file = formData.get("file") as File;
    
    if (!file) {
      return { error: "Không có file nào được chọn" };
    }

    // 🛡️ KIỂM TRA ĐỊNH DẠNG (Bổ sung thêm để an toàn)
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      return { error: "Định dạng file không hỗ trợ (Chỉ nhận JPG, PNG, WEBP)" };
    }

    // 🛡️ KIỂM TRA DUNG LƯỢNG (Ví dụ: Chặn file > 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { error: "Dung lượng ảnh quá lớn (Tối đa 5MB)" };
    }

    // 1. Chuyển File sang Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // 2. Tạo tên file độc nhất
    const fileName = `${Date.now()}-${file.name.replace(/\s/g, "-")}`;
    
    // 3. Xác định đường dẫn lưu
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);

    // 4. Ghi file vào ổ cứng
    await fs.writeFile(filePath, buffer);

    // 5. Trả về đường dẫn ảnh
    const fileUrl = `/uploads/${fileName}`;
    
    return { success: fileUrl };

  } catch (error) {
    console.error("Upload error:", error);
    return { error: "Lỗi khi lưu file" };
  }
};