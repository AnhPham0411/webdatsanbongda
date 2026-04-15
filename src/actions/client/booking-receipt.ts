"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import fs from "node:fs/promises";
import path from "node:path";

/**
 * Tải ảnh minh chứng thanh toán lên server và cập nhật vào đơn hàng.
 * @param bookingId ID của đơn đặt sân
 * @param formData Dữ liệu ảnh từ client
 */
export const uploadPaymentReceipt = async (bookingId: string, formData: FormData) => {
  try {
    const session = await auth();
    if (!session?.user) return { error: "Bạn chưa đăng nhập!" };

    const file = formData.get("file") as File;
    if (!file) return { error: "Vui lòng chọn ảnh!" };

    // 1. Kiểm tra đơn hàng thuộc về user này không
    const booking = await db.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) return { error: "Không tìm thấy đơn hàng!" };
    if (booking.userId !== session.user.id) return { error: "Bạn không có quyền này!" };

    // 2. Kiểm tra thời gian (Phải trong vòng 10 phút đầu nếu chưa có bill)
    const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
    if (!(booking as any).paymentBill && new Date(booking.createdAt) < tenMinsAgo) {
      return { error: "Thời gian giữ chỗ 10 phút đã hết. Vui lòng liên hệ Admin!" };
    }

    // 3. Xử lý lưu ảnh vào thư mục local (public/uploads)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const fileName = `bill-${bookingId}-${Date.now()}.jpg`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "bills");
    
    // Đảm bảo thư mục tồn tại
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);
    const fileUrl = `/uploads/bills/${fileName}`;

    // 4. Cập nhật Database (Xác nhận ảo)
    await (db.booking as any).update({
      where: { id: bookingId },
      data: {
        paymentBill: fileUrl,
        billUploadedAt: new Date(),
      }
    });

    revalidatePath("/my-bookings");
    revalidatePath("/admin/bookings");

    return { success: "Đã gửi ảnh Bill thành công! Hệ thống sẽ giữ chỗ vĩnh viễn cho bạn.", fileUrl };
  } catch (error) {
    console.error("RECEIPT_UPLOAD_ERROR:", error);
    return { error: "Lỗi hệ thống khi tải ảnh!" };
  }
};
