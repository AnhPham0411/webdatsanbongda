"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";
import { updateUserLanguage } from "@/actions/client/user";
import { useSession } from "next-auth/react";

export const LanguageSwitcher = () => {
  const [isPending, startTransition] = useTransition();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();

  const switchLanguage = (nextLocale: string) => {
    if (nextLocale === locale) return;
    
    startTransition(async () => {
      // 1. Nếu user đã đăng nhập, lưu tùy chọn vào DB
      if (session?.user?.id) {
          try {
            await updateUserLanguage(nextLocale);
          } catch (error) {
            console.error("Failed to update language in DB", error);
          }
      }

      // 2. Thiết lập cookie trực tiếp giúp middleware và server components nhận diện ngay
      document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;

      // 3. Sử dụng reload() để ép trình duyệt tải lại toàn bộ trang với locale mới từ cookie.
      // Điều này là cách tin cậy nhất khi sử dụng 'localePrefix: never' vì URL không đổi.
      window.location.reload();
    });
  };

  return (
    <div className="flex items-center gap-1.5 text-[10px] font-bold">
      <button 
        onClick={() => switchLanguage("vi")}
        className={locale === "vi" 
            ? "text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded" 
            : "text-slate-400 hover:text-slate-600 px-1.5 py-0.5"}
        disabled={isPending}
      >
        VI
      </button>
      <span className="text-slate-200">|</span>
      <button 
        onClick={() => switchLanguage("en")}
        className={locale === "en" 
            ? "text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded" 
            : "text-slate-400 hover:text-slate-600 px-1.5 py-0.5"}
        disabled={isPending}
      >
        EN
      </button>
    </div>
  );
};
