import { AdminNavbar } from "@/components/admin/navbar";
import { AdminSidebar } from "@/components/admin/sidebar";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Dòng này sẽ in ra Terminal của VS Code (không phải trình duyệt)
  // Hãy nhìn vào đó để xem Role thực tế là gì
  // console.log("DEBUG LAYOUT ROLE:", session?.user?.role);

  // Sửa điều kiện: Chỉ đuổi ra ngoài nếu KHÔNG PHẢI Admin VÀ KHÔNG PHẢI Staff
  const canAccess = session?.user?.role === "ADMIN" || session?.user?.role === "STAFF";

  if (!canAccess) {
    return redirect("/");
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <AdminSidebar role={session?.user?.role} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminNavbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
            {children}
        </main>
      </div>
    </div>
  );
}