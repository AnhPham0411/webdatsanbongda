import { RegisterForm } from "@/components/auth/register-form"; // Nhớ có ngoặc nhọn { }

export default function RegisterPage() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Tạo tài khoản mới</h1>
        <p className="text-slate-500">Điền thông tin bên dưới để bắt đầu</p>
      </div>
      
      <RegisterForm />
    </div>
  );
}