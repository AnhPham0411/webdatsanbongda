"use client";

import { UserMenu } from "@/components/client/user-menu"; // Tái sử dụng component cũ
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { Menu } from "lucide-react";

export const AdminNavbar = () => {
  const { data: session } = useSession();

  return (
    <div className="flex items-center p-4 border-b bg-white h-16 shadow-sm">
      {/* Nút mở menu mobile (Logic mở sidebar sẽ làm sau nếu cần) */}
      <Button variant="ghost" size="icon" className="md:hidden mr-4">
        <Menu />
      </Button>

      {/* Breadcrumb hoặc Tiêu đề */}
      <div className="flex-1 font-semibold text-lg text-slate-700">
        Dashboard
      </div>

      {/* User Menu bên phải */}
      <div className="flex items-center gap-x-4">
        {session?.user && (
           <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                  <p className="text-sm font-medium">{session.user.name}</p>
                  <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
              <UserMenu user={session.user} />
           </div>
        )}
      </div>
    </div>
  );
};

export default AdminNavbar;