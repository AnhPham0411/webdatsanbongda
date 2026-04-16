"use client";
import { Activity } from "lucide-react";
import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Menu, Heart, MapPin, X } from "lucide-react"; 
import { cn, formatCurrency } from "@/lib/utils";
import { UserMenu } from "@/components/client/user-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getWishlist } from "@/actions/client/get-wishlist"; 
import { toggleWishlist } from "@/actions/client/wishlist"; 
import { useWishlistStore } from "../../hooks/use-wishlist-store"; 
import { NotificationNav } from "@/components/client/notification-nav";
import { LanguageSwitcher } from "@/components/client/language-switcher";
import { useTranslations } from "next-intl";

const WishlistNav = () => {
  const { data: session } = useSession();
  const router = useRouter();
  
  const { items, setItems, removeItem, hasLoaded } = useWishlistStore();

  useEffect(() => {
    if (session?.user && !hasLoaded) {
      getWishlist().then((data) => setItems(data));
    }
  }, [session, hasLoaded, setItems]);

  const handleRemove = async (courtId: string, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    
    removeItem(courtId);
    await toggleWishlist(courtId);
    router.refresh();
  };

  if (!session) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors">
          <Heart className={cn("h-5 w-5 transition-colors", items.length > 0 ? "fill-rose-500 text-rose-500" : "")} />
          {items.length > 0 && (
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-600 ring-2 ring-white" />
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent align="end" className="w-96 p-0 shadow-xl border-slate-100 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-white flex justify-between items-center">
          <div>
             <h4 className="font-bold text-slate-900">Sân yêu thích</h4>
             <p className="text-xs text-slate-500 mt-0.5">Bạn đã lưu {items.length} sân</p>
          </div>
          {items.length > 0 && (
             <span className="text-[10px] bg-rose-100 text-rose-600 px-2 py-1 rounded-full font-bold">
               {items.length}
             </span>
          )}
        </div>
        
        <div className="max-h-[350px] overflow-y-auto min-h-[100px] bg-slate-50/30">
            {items.length === 0 ? (
                <div className="py-10 text-center text-slate-500 text-sm flex flex-col items-center">
                    <Heart className="h-8 w-8 text-slate-300 mb-2" />
                    Chưa có sân nào
                </div>
            ) : (
                <div className="p-2 space-y-2">
                    {items.map((item) => (
                        <Link 
                            key={item.id} 
                            href={`/courts/${item.id}`}
                            className="flex items-start gap-3 p-3 hover:bg-white hover:shadow-md rounded-xl transition-all group relative border border-transparent hover:border-slate-100 bg-white shadow-sm"
                        >
                            <div className="relative h-20 w-20 rounded-lg overflow-hidden flex-shrink-0 border border-slate-100 bg-slate-100">
                                <Image src={item.image} alt={item.name} fill className="object-cover" />
                            </div>

                            <div className="flex-1 min-w-0 pr-6 flex flex-col justify-between h-20 py-0.5">
                                <div>
                                    <h5 className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                                        {item.name}
                                    </h5>
                                    <div className="flex items-center gap-1 mt-1 text-slate-500">
                                        <MapPin className="h-3 w-3 flex-shrink-0" />
                                        <p className="text-xs truncate max-w-[180px]">{item.address}</p>
                                    </div>
                                </div>
                                <p className="text-sm font-bold text-blue-600">
                                    {formatCurrency(item.price)}
                                </p>
                            </div>

                            <button 
                                className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-rose-50 text-slate-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                                title="Xóa khỏi danh sách"
                                onClick={(e) => handleRemove(item.id, e)}
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </Link>
                    ))}
                </div>
            )}
        </div>

        <div className="p-3 border-t border-slate-100 bg-white">
            <Button asChild className="w-full bg-slate-900 hover:bg-blue-600 text-white shadow-lg transition-all rounded-xl h-11 font-semibold">
                <Link href="/wishlist">Xem tất cả danh sách</Link>
            </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export const Navbar = () => {
  const t = useTranslations("Navbar");
  const pathname = usePathname();
  const { data: session } = useSession();

  // Kiểm tra active route (loại bỏ locale để so khớp)
  const isHome = pathname === "/" || pathname === "/vi" || pathname === "/en";
  const isSearch = pathname.includes("/search");
  const isAbout = pathname.includes("/about");
  const isContact = pathname.includes("/contact");

  const routes = [
    { href: "/", label: t("home"), active: isHome },
    { href: "/search", label: t("search"), active: isSearch },
    { href: "/about", label: t("about"), active: isAbout },
    { href: "/contact", label: t("contact"), active: isContact },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3 group">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500 text-white shadow-lg shadow-sky-200 group-hover:bg-sky-600 group-hover:scale-105 transition-all duration-300">
        <Activity className="h-6 w-6" />
      </div>
      
      <div className="flex flex-col">
        <span className="text-lg font-bold tracking-tight text-slate-900 leading-none">
          Sport
        </span>
        <span className="text-xs font-bold text-sky-500 tracking-[0.2em] uppercase">
          Arena
        </span>
      </div>
    </Link>

        <div className="hidden md:flex items-center gap-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-full transition-all duration-200",
                route.active 
                  ? "bg-slate-100 text-blue-600" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-blue-600"
              )}
            >
              {route.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          
          <div className="hidden md:flex items-center gap-3 mr-1">
             <LanguageSwitcher />
             <NotificationNav />
             <WishlistNav />
          </div>

          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>

          <div className="hidden md:flex items-center gap-2">
            {session && session.user ? (
              <UserMenu user={session.user} />
            ) : (
              <>
                <Button variant="ghost" asChild className="rounded-full font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50">
                  <Link href="/login">Đăng nhập</Link>
                </Button>
                <Button asChild className="rounded-full bg-blue-600 hover:bg-blue-700 font-bold px-6 shadow-md shadow-blue-200">
                  <Link href="/register">Đăng ký</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;