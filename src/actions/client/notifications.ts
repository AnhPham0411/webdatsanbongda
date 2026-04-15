"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

/**
 * Gửi thông báo cho một người dùng cụ thể
 */
export const createNotification = async (data: {
  userId: string;
  title: string;
  message: string;
  type?: string;
  link?: string;
}) => {
  try {
    const notification = await (db as any).notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type || "INFO",
        link: data.link,
      },
    });
    
    revalidatePath("/", "layout");
    return notification;
  } catch (error) {
    console.error("CREATE_NOTIFICATION_ERROR:", error);
    return null;
  }
};

/**
 * Gửi thông báo cho toàn bộ người dùng trong hệ thống
 */
export const broadcastNotification = async (data: {
  title: string;
  message: string;
  type?: string;
  link?: string;
}) => {
  try {
    // Lấy danh sách ID của tất cả người dùng
    const users = await db.user.findMany({
      select: { id: true }
    });

    // Tạo thông báo cho từng người
    // Với quy mô vừa, dùng Promise.all hoặc loop là ổn. 
    // Nếu cực lớn (>10k user) thì nên dùng background job.
    const createPromises = users.map(user => 
      (db as any).notification.create({
        data: {
          userId: user.id,
          title: data.title,
          message: data.message,
          type: data.type || "INFO",
          link: data.link,
        }
      })
    );

    await Promise.all(createPromises);
    
    revalidatePath("/", "layout");
    return { success: true, count: users.length };
  } catch (error) {
    console.error("BROADCAST_NOTIFICATION_ERROR:", error);
    return { error: "Lỗi khi gửi thông báo đồng loạt." };
  }
};

/**
 * Lấy danh sách thông báo của người dùng hiện tại
 */
export const getMyNotifications = async (userId: string) => {
    try {
        return await (db as any).notification.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 20
        });
    } catch (error) {
        return [];
    }
}

/**
 * Đánh dấu thông báo đã đọc
 */
export const markAsRead = async (notificationId: string) => {
    try {
        await (db as any).notification.update({
            where: { id: notificationId },
            data: { isRead: true }
        });
        revalidatePath("/", "layout");
        return { success: true };
    } catch (error) {
        return { error: "Không thể cập nhật trạng thái." };
    }
}
