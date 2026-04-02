"use server";
import { sendWelcomeEmail } from "@/lib/mail";
import * as z from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signIn } from "@/lib/auth"; 
import { LoginSchema, RegisterSchema } from "@/schemas";
import { AuthError } from "next-auth";

export const login = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) return { error: "Dữ liệu không hợp lệ!" };

  const { email, password } = validatedFields.data;

  try {
    const existingUser = await db.user.findUnique({ where: { email } });

    if (!existingUser || !existingUser.password) {
      return { error: "Tài khoản không tồn tại!" };
    }

    // 1. Thực hiện đăng nhập
    // Dùng redirect: false để kiểm soát luồng ở Client
    await signIn("credentials", {
      email,
      password,
      redirect: false, 
    });
    
    // 2. Trả về Role để Client dùng window.location.assign
    return { 
      success: "Đăng nhập thành công!",
      role: existingUser.role 
    };

  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Email hoặc mật khẩu không chính xác!" };
        default:
          return { error: "Đã xảy ra lỗi xác thực!" };
      }
    }
    // Rất quan trọng: Phải throw error để Next.js xử lý redirect nếu cần
    throw error;
  }
};
export const register = async (values: z.infer<typeof RegisterSchema>) => {
  // 1. Validate dữ liệu đầu vào bằng Zod
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Dữ liệu không hợp lệ!" };
  }

  const { email, password, name } = validatedFields.data;

  // 2. Mã hóa mật khẩu
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. Kiểm tra email đã tồn tại chưa
  const existingUser = await db.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "Email này đã được sử dụng!" };
  }

  try {
    // 4. Tạo User mới trong Database
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        // role: "USER", // Mặc định thường là USER, prisma sẽ tự lấy default nếu bạn đã set trong schema
      },
    });

    // 5. 👇 BẮN MAIL CHÀO MỪNG
    // Chúng ta không dùng 'await' ở đây nếu không muốn người dùng phải đợi mail gửi xong mới thấy thông báo thành công
    // Hoặc dùng await nếu bạn muốn đảm bảo mail phải gửi được mới báo thành công
    await sendWelcomeEmail(user.email, user.name || "Quý khách");

    return { success: "Đăng ký thành công! Email chào mừng đã được gửi." };
  } catch (error) {
    console.error("REGISTER_ERROR:", error);
    return { error: "Đã xảy ra lỗi khi tạo tài khoản!" };
  }
};