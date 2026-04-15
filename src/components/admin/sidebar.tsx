/**
 * @file sidebar.tsx
 * @description Thành phần thanh bên (Sidebar) cho giao diện quản trị (Admin).
 * Chứa các navigation link chính và xử lý phân quyền hiển thị dựa trên vai trò của người dùng.
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  Users, 
  Settings, 
  Star, 
  MapPin, 
  ListOrdered, 
  TicketPercent, 
  Activity, 
  ShoppingBag,
  MessageSquare,
  LayoutDashboard,
  CalendarRange,
  CalendarDays,
  DoorOpen,
  LayoutList
} from "lucide-react";

/**
 * Danh sách các tuyến đường (routes) trong hệ thống Admin.
 * Mỗi route bao gồm label, icon, đường dẫn, màu sắc và danh sách các vai trò (roles) được phép truy cập.
 */
const routes = [
  {
    label: "Tổng quan",
    icon: LayoutDashboard,
    href: "/admin",
    color: "text-sky-500",
    roles: ["ADMIN", "STAFF"],
  },
  {
    label: "Lịch biểu",
    icon: CalendarRange,
    href: "/admin/calendar",
    color: "text-indigo-600",
    roles: ["ADMIN", "STAFF"],
  },
  {
    label: "Đơn đặt sân",
    icon: CalendarDays,
    href: "/admin/bookings",
    color: "text-green-700",
    roles: ["ADMIN", "STAFF"],
  },

  {
    label: "Quản lý Sân",
    icon: DoorOpen,
    href: "/admin/courts",
    color: "text-violet-500",
    roles: ["ADMIN", "STAFF"],
  },
  {
    label: "Hệ thống sân",
    icon: LayoutList,
    href: "/admin/categories",
    color: "text-pink-700",
    roles: ["ADMIN"],
  },
  {
    label: "Dịch vụ",
    icon: ShoppingBag,
    href: "/admin/amenities",
    color: "text-orange-700",
    roles: ["ADMIN"],
  },
  {
    label: "Người dùng",
    icon: Users,
    href: "/admin/users",
    color: "text-blue-700",
    roles: ["ADMIN"],
  },
  {
    label: "Đánh giá",
    icon: Star,
    href: "/admin/reviews",
    color: "text-yellow-600",
    roles: ["ADMIN", "STAFF"],
  },
  {
    label: "Yêu cầu hỗ trợ",
    icon: MessageSquare,
    href: "/admin/inquiries",
    color: "text-sky-400",
    roles: ["ADMIN", "STAFF"],
  },
  {
    label: "Mã giảm giá",
    icon: TicketPercent,
    href: "/admin/voucher",
    color: "text-amber-500",
    roles: ["ADMIN"],
  },
  {
    label: "Cài đặt",
    icon: Settings,
    href: "/admin/settings",
    color: "text-gray-500",
    roles: ["ADMIN"],
  },
];

/**
 * Component Sidebar Admin chính.
 * @returns JSX.Element
 */
export const AdminSidebar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  // Lọc danh sách menu dựa trên vai trò (Role) của người dùng hiện tại
  const filteredRoutes = routes.filter((route) => 
    userRole ? route.roles.includes(userRole) : false
  );

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-slate-900 text-white w-64 border-r border-slate-800">
      <div className="px-3 py-2 flex-1">
        {/* Logo và tiêu đề ứng dụng */}
        <Link href="/admin" className="flex items-center gap-3 group pl-3 mb-10">
          {/* Stylized Icon */}
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500 text-white shadow-lg shadow-sky-400/20 group-hover:bg-sky-600 group-hover:scale-105 transition-all duration-300">
            <Activity className="h-6 w-6" />
          </div>
          
          {/* Stylized Text */}
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white leading-none">
              Sport
            </span>
            <span className="text-xs font-bold text-sky-400 tracking-[0.2em] uppercase">
              Arena
            </span>
          </div>
        </Link>
          {/* Hiển thị danh sách menu đã lọc */}
          <div className="space-y-1">
            {filteredRoutes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                  pathname === route.href || pathname.startsWith(route.href + "/") 
                    ? "text-white bg-white/10 shadow-sm" 
                    : "text-zinc-400"
                )}
              >
                <div className="flex items-center flex-1">
                  <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                  {route.label}
                </div>
              </Link>
            ))}
          </div>
      </div>
      
      {/* Phần hiển thị thông tin tài khoản người dùng ở dưới cùng */}
      <div className="px-6 py-4 border-t border-slate-800">
        <div className="flex flex-col gap-y-1">
          <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Tài khoản</p>
          <p className="text-sm font-medium text-zinc-300 truncate">{session?.user?.name}</p>
          <span className="text-[10px] bg-white/10 text-zinc-400 px-2 py-0.5 rounded-full w-fit">
            {userRole}
          </span>
        </div>
      </div>
    </div>
  );
};