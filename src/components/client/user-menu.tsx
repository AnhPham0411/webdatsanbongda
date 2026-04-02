"use client";

import { User } from "next-auth";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  LogOut, 
  CalendarDays, 
  User as UserIcon, 
  Settings, 
  CreditCard 
} from "lucide-react";

interface UserMenuProps {
  user: User;
}

export const UserMenu = ({ user }: UserMenuProps) => {
  const router = useRouter();

  // Tạo chữ cái đầu tên (Ví dụ: "Tuan Anh" -> "T")
  const initials = user.name?.charAt(0).toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none group">
        <Avatar className="h-9 w-9 cursor-pointer border border-slate-200 transition group-hover:ring-2 group-hover:ring-primary/20 group-hover:border-primary">
          <AvatarImage src={user.image || ""} alt={user.name || "User"} />
          <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-60 p-2">
        {/* Header thông tin User */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold leading-none text-slate-900">
              {user.name}
            </p>
            <p className="text-xs leading-none text-muted-foreground truncate font-medium">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {/* Nhóm chức năng cá nhân */}
        <DropdownMenuGroup>
          {/* Link chuẩn tới trang Profile */}
          <DropdownMenuItem 
            className="cursor-pointer focus:bg-slate-50 focus:text-primary"
            onClick={() => router.push("/profile")}
          >
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Hồ sơ cá nhân</span>
          </DropdownMenuItem>

          <DropdownMenuItem 
            className="cursor-pointer focus:bg-slate-50 focus:text-primary"
            onClick={() => router.push("/my-bookings")}
          >
            <CalendarDays className="mr-2 h-4 w-4" />
            <span>Đơn đặt của tôi</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Nhóm cài đặt (Optional - Để menu đỡ trống) */}
        <DropdownMenuGroup>
           {/* Ví dụ thêm mục Cài đặt - có thể bỏ qua nếu chưa làm */}
          <DropdownMenuItem disabled className="cursor-not-allowed opacity-50">
             <Settings className="mr-2 h-4 w-4" />
             <span>Cài đặt chung</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        
        {/* Nút đăng xuất */}
        <DropdownMenuItem 
          className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Đăng xuất</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};