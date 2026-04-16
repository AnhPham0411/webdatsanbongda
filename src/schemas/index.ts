import * as z from "zod";

export const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().email({
    message: "Email không hợp lệ",
  }),
  password: z.string().min(1, {
    message: "Vui lòng nhập mật khẩu",
  }),
});

export const RegisterSchema = z.object({
  email: z.string().trim().toLowerCase().email({
    message: "Email không hợp lệ",
  }),
  password: z.string().min(6, {
    message: "Mật khẩu tối thiểu 6 ký tự",
  }),
  name: z.string().min(1, {
    message: "Vui lòng nhập tên",
  }),
});