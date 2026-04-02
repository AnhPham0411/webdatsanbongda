"use server";

import { db } from "@/lib/db";

export const checkVoucher = async (code: string, currentTotal: number) => {
  try {
    // 0. Kiểm tra giá trị đầu vào để tránh lỗi NaN từ đầu
    if (isNaN(currentTotal) || currentTotal < 0) {
      return { error: "Giá trị đơn hàng không hợp lệ!" };
    }

    // 1. Tìm voucher trong DB
    const voucher = await db.voucher.findUnique({
      where: { code: code.toUpperCase() },
    });

    // 2. Các bước kiểm tra hợp lệ
    if (!voucher || !voucher.isActive) {
      return { error: "Mã giảm giá không tồn tại hoặc đã bị khóa!" };
    }

    // --- 👇 SỬA LỖI NGÀY GIỜ (QUAN TRỌNG) 👇 ---
    const now = new Date();
    const startDate = new Date(voucher.startDate);
    const endDate = new Date(voucher.endDate);

    // Ép thời gian về mốc chuẩn để so sánh chính xác:
    // Ngày bắt đầu: Tính từ 00:00:00 sáng
    startDate.setHours(0, 0, 0, 0);
    // Ngày kết thúc: Tính đến 23:59:59 đêm
    endDate.setHours(23, 59, 59, 999);

    if (now < startDate) return { error: "Mã này chưa đến đợt áp dụng!" };
    if (now > endDate) return { error: "Mã này đã hết hạn sử dụng!" };
    // --- 👆 KẾT THÚC SỬA LỖI NGÀY GIỜ 👆 ---


    if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
      return { error: "Mã này đã hết lượt sử dụng!" };
    }

    // Ép kiểu Number() cho minOrderValue để so sánh an toàn
    const minOrder = voucher.minOrderValue ? Number(voucher.minOrderValue) : 0;
    if (currentTotal < minOrder) {
      return { 
        error: `Đơn hàng phải từ ${minOrder.toLocaleString("vi-VN")}đ mới dùng được mã này!` 
      };
    }

    // 3. Tính toán số tiền giảm
    let discountAmount = 0;
    const discountVal = Number(voucher.discountValue); // Ép kiểu Decimal sang Number

    if (voucher.discountType === "PERCENT") {
      discountAmount = (currentTotal * discountVal) / 100;
      
      // Kiểm tra giảm tối đa (nếu có)
      if (voucher.maxDiscount) {
        const maxDisc = Number(voucher.maxDiscount);
        if (discountAmount > maxDisc) {
          discountAmount = maxDisc;
        }
      }
    } else {
      // Giảm tiền mặt (FIXED)
      discountAmount = discountVal;
    }

    // Đảm bảo không giảm quá giá trị đơn hàng
    if (discountAmount > currentTotal) {
      discountAmount = currentTotal;
    }

    // Làm tròn số tiền giảm để tránh số lẻ thập phân
    discountAmount = Math.floor(discountAmount);

    return {
      success: "Áp dụng mã thành công!",
      discountAmount,
      voucherId: voucher.id,
      code: voucher.code
    };

  } catch (error) {
    console.log("Check Voucher Error:", error);
    return { error: "Lỗi hệ thống khi kiểm tra mã!" };
  }
};