import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminRootPage() {
  const session = await auth();

  if (!session?.user) {
    return redirect("/login");
  }

  // Sửa lại: Nếu không phải ADMIN VÀ không phải STAFF thì mới bị đuổi
  if (session.user.role !== "ADMIN" && session.user.role !== "STAFF") {
    return redirect("/");
  }

  // Cả Admin và Staff đều được dẫn vào dashboard
  return redirect("/admin/dashboard");
}