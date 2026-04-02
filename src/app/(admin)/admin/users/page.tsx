import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Search, Users, Mail, Phone } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserRoleSelect } from "@/components/admin/user-role-select"; 

export default async function UsersPage({
  searchParams,
}: {
  searchParams: { query?: string };
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const query = searchParams?.query || "";

  const users = await db.user.findMany({
    where: {
      OR: [
        { name: { contains: query } },
        { email: { contains: query } },
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quản lý Người dùng</h2>
          <p className="text-muted-foreground">
            Danh sách tài khoản. Admin chỉ có quyền phân cấp (Role).
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng tài khoản</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
         </Card>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2 bg-white p-1 rounded-lg w-full md:w-auto">
         <form className="relative w-full md:w-[300px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
                name="query" 
                placeholder="Tìm user..." 
                className="pl-8 h-9"
                defaultValue={query}
            />
         </form>
         <Button variant="secondary" size="sm" type="submit">Tìm</Button>
      </div>

      {/* Table - KHÔNG CÓ CỘT ACTION SỬA/XÓA */}
      <div className="rounded-md border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[300px]">Người dùng</TableHead>
              <TableHead>Liên hệ</TableHead>
              <TableHead>Ngày tham gia</TableHead>
              <TableHead>Phân quyền (Role)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        Không tìm thấy người dùng nào.
                    </TableCell>
                </TableRow>
            ) : (
                users.map((user) => (
                <TableRow key={user.id} className="hover:bg-slate-50/50">
                    {/* Cột 1: Thông tin cơ bản (Chỉ hiển thị) */}
                    <TableCell>
                        <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border">
                                <AvatarImage src={user.image || ""} />
                                <AvatarFallback className="bg-slate-100 text-slate-600 font-bold">
                                    {user.name?.charAt(0).toUpperCase() || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="font-medium text-sm text-slate-900">
                                    {user.name || "Chưa đặt tên"}
                                </span>
                                <span className="text-[10px] text-muted-foreground font-mono">
                                    ID: {user.id.slice(-4)}
                                </span>
                            </div>
                        </div>
                    </TableCell>
                    
                    {/* Cột 2: Email & SĐT (Chỉ hiển thị - Không cho sửa) */}
                    <TableCell>
                        <div className="flex flex-col text-sm">
                            <div className="flex items-center gap-1 text-slate-600">
                                <Mail className="h-3 w-3" />
                                {user.email}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                <Phone className="h-3 w-3" />
                                {user.phone || "---"}
                            </div>
                        </div>
                    </TableCell>
                    
                    {/* Cột 3: Ngày tạo (Chỉ hiển thị) */}
                    <TableCell className="text-sm text-slate-600">
                        {format(new Date(user.createdAt), "dd/MM/yyyy", { locale: vi })}
                    </TableCell>
                    
                    {/* Cột 4: Role - ĐÂY LÀ CHỖ DUY NHẤT ADMIN CAN THIỆP */}
                    <TableCell>
                        <UserRoleSelect 
                            userId={user.id} 
                            defaultValue={user.role} 
                            isCurrentUser={session.user.id === user.id}
                        />
                    </TableCell>
                </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}