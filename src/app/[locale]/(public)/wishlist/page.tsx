import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { CourtCard } from "@/components/client/court-card";
import { HeartCrack } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function WishlistPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return redirect("/auth/login");
  }

  // Lấy danh sách sân từ bảng Wishlist
  const wishlists = await db.wishlist.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      court: {
        include: {
          images: true, // Renamed in schema.prisma
          courtType: {
            include: { amenities: true, location: true }
          },
          bookings: { // Renamed in schema.prisma
             where: { review: { isNot: null } },
             select: { review: { select: { rating: true } } }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  // Map dữ liệu về chuẩn SafeCourt cho CourtCard
  const likedCourts = wishlists.map((item) => {
      const court = item.court;
      const images = (court as any).images || [];
      const courtType = (court as any).courtType || {};
      const bookings = (court as any).bookings || [];

      // Flatten reviews logic
      const reviews = bookings.map((b: any) => b.review).filter((r: any) => r !== null);
      
      return {
          ...court,
          createdAt: court.createdAt.toISOString(),
          courtType: {
              ...courtType,
              basePrice: Number(courtType.basePrice)
          },
          images: images,
          reviews,
          isLiked: true 
      };
  });

  return (
    <div className="container mx-auto px-4 py-10 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Danh sách yêu thích</h1>
        <p className="text-slate-500 mt-2">Bạn đã lưu {likedCourts.length} sân bóng.</p>
      </div>

      {likedCourts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <div className="bg-white p-6 rounded-full mb-4 shadow-sm">
                <HeartCrack className="w-12 h-12 text-slate-300" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900">Danh sách trống</h3>
            <p className="text-slate-500 mt-2 mb-6">Bạn chưa lưu sân bóng nào.</p>
            <Link href="/search">
                <Button>Khám phá ngay</Button>
            </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {likedCourts.map((court) => (
            <CourtCard key={court.id} court={court as any} currentUser={session.user} />
          ))}
        </div>
      )}
    </div>
  );
}