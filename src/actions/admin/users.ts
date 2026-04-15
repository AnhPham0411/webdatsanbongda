"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth"; 
import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";

export const updateUserRole = async (userId: string, newRole: UserRole) => {
  try {
    const session = await auth();

    // 1. Check quyền Admin tầng Server
    if (session?.user?.role !== "ADMIN") {
      return { error: "Từ chối truy cập: Chỉ Quản trị viên tối cao mới có quyền này!" };
    }

    // 2. Chặn tự đổi quyền chính mình (Bảo vệ tài khoản Admin hiện tại)
    if (session.user.id === userId) {
      return { error: "Bạn không thể tự hạ quyền của chính mình để tránh mất quyền quản trị!" };
    }

    // 3. Kiểm tra User mục tiêu có tồn tại không trước khi Update
    const targetUser = await db.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!targetUser) {
      return { error: "Người dùng không tồn tại trong hệ thống!" };
    }

    // 4. Update CHỈ trường ROLE
    await db.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    // 5. Làm mới cache trang quản lý người dùng
    revalidatePath("/admin/users");
    
    return { success: `Đã nâng cấp người dùng thành ${newRole} thành công!` };
  } catch (error) {
    console.error("[UPDATE_USER_ROLE_ERROR]", error);
    return { error: "Lỗi hệ thống khi cập nhật quyền!" };
  }
};

/**
 * Lấy danh sách toàn bộ khách hàng (role: USER) 
 * phục vụ cho việc gán Voucher độc quyền.
 */
export const getUsersOnly = async () => {
    try {
        const users = await db.user.findMany({
            where: { role: "USER" },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
            },
            orderBy: { name: 'asc' }
        });
        return users;
    } catch (error) {
        console.error("[GET_USERS_ONLY_ERROR]", error);
        return [];
    }
};