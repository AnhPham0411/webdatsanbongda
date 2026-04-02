"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { sendVoucherNotification } from "@/lib/mail"; // Import hàm vừa tạo
import { format } from "date-fns"; // Dùng để format ngày cho đẹp (nếu chưa có thì: npm i date-fns)

export const getVouchers = async () => {
  return await db.voucher.findMany({ orderBy: { createdAt: "desc" } });
};

export const createVoucher = async (data: any) => {
  try {
    await db.voucher.create({
      data: {
        code: data.code.toUpperCase(),
        discountType: data.discountType,
        discountValue: data.discountValue,
        minOrderValue: data.minOrderValue || 0,
        maxDiscount: data.maxDiscount || null,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        usageLimit: data.usageLimit || null,
        isActive: true,
      },
    });
    revalidatePath("/admin/vouchers");
    return { success: "Tạo mã thành công!" };
  } catch (error) {
    return { error: "Mã đã tồn tại!" };
  }
};

export const updateVoucher = async (id: string, data: any) => {
  try {
    await db.voucher.update({
      where: { id },
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      },
    });
    revalidatePath("/admin/vouchers");
    return { success: "Cập nhật thành công!" };
  } catch (error) {
    return { error: "Lỗi cập nhật!" };
  }
};

export const deleteVoucher = async (id: string) => {
  await db.voucher.delete({ where: { id } });
  revalidatePath("/admin/vouchers");
  return { success: "Đã xóa voucher!" };
};

export const toggleVoucherStatus = async (id: string, currentStatus: boolean) => {
  await db.voucher.update({ where: { id }, data: { isActive: !currentStatus } });
  revalidatePath("/admin/vouchers");
};

// 👇 HÀM GỬI EMAIL ĐÃ ĐƯỢC NÂNG CẤP 👇
export const sendVoucherToUsers  = async (id: string) => {
  try {
    // 1. Lấy thông tin Voucher
    const voucher = await db.voucher.findUnique({ where: { id } });
    if (!voucher) return { error: "Không tìm thấy voucher!" };

    // 2. Lấy danh sách khách hàng (Chỉ lấy email để tối ưu query)
    const users = await db.user.findMany({ 
      where: { role: "USER" },
      select: { email: true } 
    });

    if (users.length === 0) return { error: "Chưa có khách hàng nào trong hệ thống!" };

    // 3. Chuẩn bị nội dung hiển thị
    const discountText = voucher.discountType === "PERCENT" 
      ? `${voucher.discountValue}%` 
      : `${Number(voucher.discountValue).toLocaleString("vi-VN")} VNĐ`;
    
    const endDateFormatted = format(new Date(voucher.endDate), "dd/MM/yyyy");

    // 4. Gửi email song song (Promise.all) để tăng tốc độ
    // Lưu ý: Nếu user quá đông (>100 người), nên dùng Queue (Upstash/BullMQ) thay vì Promise.all
    const emailPromises = users.map((user) => 
      sendVoucherNotification(
        user.email, 
        voucher.code, 
        discountText, 
        endDateFormatted
      )
    );

    await Promise.all(emailPromises);

    return { success: `Đã gửi mã khuyến mãi tới ${users.length} khách hàng!` };
  } catch (error) {
    console.error("Lỗi gửi mail voucher:", error);
    return { error: "Có lỗi xảy ra trong quá trình gửi mail." };
  }
};