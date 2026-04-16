import { Suspense } from "react";
// 👇 SỬA Ở ĐÂY: Thêm dấu ngoặc nhọn { } vì bên file kia là export const
import { LoginForm } from "@/components/auth/login-form"; 

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Chào mừng trở lại</h1>
        <p className="text-slate-500">Nhập thông tin để truy cập vào hệ thống</p>
      </div>
      
      {/* 👇 Bọc Suspense để tránh lỗi khi build và render */}
      <Suspense fallback={<div>Đang tải form...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}