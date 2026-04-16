import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ProfileForm from "@/components/client/profile-form"; 

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    return redirect("/login");
  }

  // Fetch data mới nhất (đảm bảo lấy trường phone)
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
        id: true,
        name: true,
        email: true,
        phone: true, // 👈 Quan trọng
        image: true,
        role: true,
    }
  });

  if (!user) return redirect("/login");

  const initial = user.name?.charAt(0).toUpperCase() || "U";
  // Xử lý hiển thị role an toàn
  const displayRole = user.role ? user.role.toLowerCase() : "user";

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Thông tin tài khoản</h1>

      <div className="grid gap-6">
        {/* Card hiển thị - Read Only */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="w-16 h-16 border-2 border-white shadow-sm">
               <AvatarImage src={user.image || ""} />
               <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
                 {initial}
               </AvatarFallback>
            </Avatar>
            <div>
               <CardTitle className="text-xl">{user.name}</CardTitle>
               <CardDescription>{user.email}</CardDescription>
               <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-md mt-2 inline-block capitalize">
                  {displayRole}
               </span>
               {/* Hiển thị SĐT ngay trên card nếu có */}
               {user.phone && (
                 <p className="text-sm text-muted-foreground mt-1">Tel: {user.phone}</p>
               )}
            </div>
          </CardHeader>
        </Card>

        {/* Card cập nhật - Form */}
        <Card>
            <CardHeader>
                <CardTitle>Cập nhật thông tin</CardTitle>
                <CardDescription>Thay đổi tên hiển thị và số điện thoại liên hệ.</CardDescription>
            </CardHeader>
            <CardContent>
                <ProfileForm user={user} />
            </CardContent>
        </Card>
      </div>
    </div>
  );
}