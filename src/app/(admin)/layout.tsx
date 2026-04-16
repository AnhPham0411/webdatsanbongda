import { AdminNavbar } from "@/components/admin/navbar";
import { AdminSidebar } from "@/components/admin/sidebar";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Inter } from "next/font/google";
import "../globals.css";
import { Toaster } from "@/components/ui/sonner";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const canAccess = session?.user?.role === "ADMIN" || session?.user?.role === "STAFF";

  if (!canAccess) {
    return redirect("/vi");
  }

  return (
    <html lang="vi">
      <body className={inter.className} suppressHydrationWarning={true}>
        <Providers>
          <div className="flex h-screen bg-gray-100 overflow-hidden">
            <AdminSidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <AdminNavbar />
              <main className="flex-1 overflow-y-auto p-4 md:p-8">
                  {children}
              </main>
            </div>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}