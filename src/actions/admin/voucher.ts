"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { sendVoucherNotification } from "@/lib/mail"; 
import { format } from "date-fns"; 
import { createNotification, broadcastNotification } from "@/actions/client/notifications";

export const getVouchers = async () => {
  const vouchers = await db.voucher.findMany({ 
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" } 
  });

  return vouchers.map(voucher => ({
    ...voucher,
    discountValue: Number(voucher.discountValue),
    minOrderValue: voucher.minOrderValue ? Number(voucher.minOrderValue) : 0,
    maxDiscount: voucher.maxDiscount ? Number(voucher.maxDiscount) : null,
  }));
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
    const oldVoucher = await db.voucher.findUnique({ where: { id } });
    if (!oldVoucher) return { error: "Không tìm thấy voucher!" };

    const { userId, ...rest } = data;
    const newStartDate = new Date(data.startDate);
    const newEndDate = new Date(data.endDate);

    const voucher = await db.voucher.update({
      where: { id },
      data: {
        ...rest,
        userId: userId || null,
        startDate: newStartDate,
        endDate: newEndDate,
      },
    });

    // Kiểm tra các điều kiện để gửi lại thông báo:
    // 1. Thay đổi mức giảm giá hoặc loại giảm giá
    // 2. Gia hạn ngày kết thúc
    // 3. Kích hoạt lại voucher (từ false sang true)
    const discountChanged = oldVoucher.discountValue.toNumber() !== Number(data.discountValue) || oldVoucher.discountType !== data.discountType;
    const extended = newEndDate > new Date(oldVoucher.endDate);
    const reactivated = !oldVoucher.isActive && data.isActive;

    if (discountChanged || extended || reactivated) {
      await sendVoucherToUsers(voucher.id, voucher.userId || undefined);
    }

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
    
    const startDateFormatted = format(new Date(voucher.startDate), "dd/MM/yyyy");
    const endDateFormatted = format(new Date(voucher.endDate), "dd/MM/yyyy");

    const messageContent = `Bạn nhận được mã ưu đãi **${voucher.code}** giảm ${discountText}. Có hiệu lực từ ngày ${startDateFormatted} đến ${endDateFormatted}.`;

    // 2. Trường hợp GỬI RIÊNG LẺ (Khách hàng thân thiết)
    if (targetUserId) {
        const user = await db.user.findUnique({ where: { id: targetUserId } });
        if (!user) return { error: "Không tìm thấy khách hàng!" };

        // Gửi Email
        await sendVoucherNotification(user.email, voucher.code, discountText, startDateFormatted, endDateFormatted);
        
        // Gửi Thông báo trên web
        await createNotification({
            userId: user.id,
            title: "Quà tặng dành riêng cho bạn! 🎁",
            message: messageContent,
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
      sendVoucherNotification(u.email, voucher.code, discountText, startDateFormatted, endDateFormatted)
    );
    await Promise.all(emailPromises);

    // Gửi Thông báo hệ thống hàng loạt
    await broadcastNotification({
        title: "Ưu đãi mới từ Sport Arena! 🎊",
        message: messageContent,
        type: "VOUCHER",
        link: "/search"
    });

    return { success: `Đã gửi mã khuyến mãi tới toàn bộ ${users.length} khách hàng!` };
  } catch (error) {
    console.error("Lỗi gửi mail voucher:", error);
    return { error: "Có lỗi xảy ra trong quá trình gửi mail." };
  }
};