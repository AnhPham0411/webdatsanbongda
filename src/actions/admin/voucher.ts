"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { sendVoucherNotification } from "@/lib/mail"; 
import { format } from "date-fns"; 
import { createNotification, broadcastNotification } from "@/actions/client/notifications";

export const getVouchers = async () => {
  return await db.voucher.findMany({ 
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" } 
  });
};

export const createVoucher = async (data: any) => {
  try {
    const voucher = await db.voucher.create({
      data: {
        code: data.code.toUpperCase(),
        discountType: data.discountType,
        discountValue: data.discountValue,
        minOrderValue: data.minOrderValue || 0,
        maxDiscount: data.maxDiscount || null,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        usageLimit: data.usageLimit || null,
        userId: data.userId || null,
        isActive: true,
      },
    });

    // Nếu gán cho 1 user cụ thể, tự động gửi thông báo ngay
    if (data.userId) {
      await sendVoucherToUsers(voucher.id, data.userId);
    }

    revalidatePath("/admin/vouchers");
    return { success: "Tạo mã thành công!" };
  } catch (error) {
    console.error("CREATE_VOUCHER_ERROR:", error);
    return { error: "Mã đã tồn tại hoặc lỗi hệ thống!" };
  }
};

export const updateVoucher = async (id: string, data: any) => {
  try {
    const { userId, ...rest } = data;
    await db.voucher.update({
      where: { id },
      data: {
        ...rest,
        userId: userId || null,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      },
    });
    revalidatePath("/admin/vouchers");
    return { success: "Cập nhật thành công!" };
  } catch (error) {
    console.error("UPDATE_VOUCHER_ERROR:", error);
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

// 👇 HÀM GỬI EMAIL & THÔNG BÁO ĐÃ ĐƯỢC NÂNG CẤP 👇
export const sendVoucherToUsers = async (voucherId: string, targetUserId?: string) => {
  try {
    // 1. Lấy thông tin Voucher
    const voucher = await db.voucher.findUnique({ where: { id: voucherId } });
    if (!voucher) return { error: "Không tìm thấy voucher!" };

    // Chuẩn bị nội dung hiển thị
    const discountText = voucher.discountType === "PERCENT" 
      ? `${voucher.discountValue}%` 
      : `${Number(voucher.discountValue).toLocaleString("vi-VN")} VNĐ`;
    
    const endDateFormatted = format(new Date(voucher.endDate), "dd/MM/yyyy");

    // 2. Trường hợp GỬI RIÊNG LẺ (Khách hàng thân thiết)
    if (targetUserId) {
        const user = await db.user.findUnique({ where: { id: targetUserId } });
        if (!user) return { error: "Không tìm thấy khách hàng!" };

        // Gửi Email
        await sendVoucherNotification(user.email, voucher.code, discountText, endDateFormatted);
        
        // Gửi Thông báo trên web
        await createNotification({
            userId: user.id,
            title: "Quà tặng dành riêng cho bạn! 🎁",
            message: `Bạn nhận được mã ưu đãi ${voucher.code} giảm ${discountText}. Hạn dùng đến ${endDateFormatted}.`,
            type: "VOUCHER",
            link: "/profile"
        });

        return { success: `Đã gửi mã khuyến mãi cho ${user.name || user.email}` };
    }

    // 3. Trường hợp GỬI HÀNG LOẠT (Dịp lễ / Toàn bộ user)
    const users = await db.user.findMany({ 
      where: { role: "USER" },
      select: { id: true, email: true } 
    });

    if (users.length === 0) return { error: "Chưa có khách hàng nào trong hệ thống!" };

    // Gửi Email hàng loạt
    const emailPromises = users.map((u) => 
      sendVoucherNotification(u.email, voucher.code, discountText, endDateFormatted)
    );
    await Promise.all(emailPromises);

    // Gửi Thông báo hệ thống hàng loạt
    await broadcastNotification({
        title: "Ưu đãi mới từ Sport Arena! 🎊",
        message: `Tết đến xuân về, nhận ngay mã ${voucher.code} giảm ${discountText} cho mọi đơn đặt sân.`,
        type: "VOUCHER",
        link: "/search"
    });

    return { success: `Đã gửi mã khuyến mãi tới toàn bộ ${users.length} khách hàng!` };
  } catch (error) {
    console.error("Lỗi gửi mail voucher:", error);
    return { error: "Có lỗi xảy ra trong quá trình gửi mail." };
  }
};