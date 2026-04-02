import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;
  const { pathname } = req.nextUrl;

  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isAdminArea = pathname.startsWith("/admin");

  // 1. Nếu vào trang Auth (Login/Register)
  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // 2. Nếu vào vùng Admin
  if (isAdminArea) {
    // Chưa đăng nhập -> Login
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Đã đăng nhập nhưng KHÔNG PHẢI Admin/Staff -> Trang chủ
    if (role !== "ADMIN" && role !== "STAFF") {
      // console.log("❌ ACCESS DENIED: Role is", role);
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Nếu là STAFF, kiểm tra xem có vào trang cấm không
    if (role === "STAFF") {
      const restrictedRoutes = [
        "/admin/users",
        "/admin/locations",
        "/admin/categories",
        "/admin/amenities",
        "/admin/settings"
      ];

      // Chỉ chặn nếu pathname khớp chính xác hoặc bắt đầu bằng route cấm + /
      const isTryingToAccessRestricted = restrictedRoutes.some(route => 
        pathname === route || pathname.startsWith(`${route}/`)
      );

      if (isTryingToAccessRestricted) {
        console.log("⚠️ STAFF restricted access to:", pathname);
        return NextResponse.redirect(new URL("/admin", req.url));
      }
    }
    
    // Nếu pass hết các điều kiện trên (là ADMIN hoặc STAFF vào trang cho phép)
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};