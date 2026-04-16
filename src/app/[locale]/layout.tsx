import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { Toaster } from "@/components/ui/sonner";
import Providers from "@/components/Providers"; 
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Navbar } from "@/components/client/navbar";
import { Footer } from "@/components/client/footer";
import { getSettings } from "@/actions/admin/settings";
import { auth } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sport Arena - Hệ thống đặt sân bóng trực tuyến",
  description: "Hệ thống quản lý và đặt sân bóng đá cỏ nhân tạo hiện đại, tiện lợi và uy chín.",
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();
  const settings = await getSettings();
  const session = await auth();
  
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "STAFF";

  // Kiểm tra chế độ bảo trì
  if (settings?.maintenanceMode && !isAdmin) {
    return (
      <html lang={locale}>
        <body className={inter.className} suppressHydrationWarning={true}>
          <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-xl w-full">
              {/* Card Container */}
              <div className="bg-white rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden text-center p-10 md:p-16 relative">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-orange-50/50 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-sky-50/50 rounded-full blur-3xl" />
                
                <div className="relative z-10 space-y-10">
                  {/* Icon Section */}
                  <div className="relative inline-block">
                    <div className="w-28 h-28 bg-orange-50 rounded-[32px] flex items-center justify-center mx-auto transform rotate-12 transition-transform hover:rotate-0 duration-500">
                      <svg className="w-14 h-14 text-orange-500 -rotate-12 hover:rotate-0 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>

                  {/* Text Section */}
                  <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                      {locale === 'vi' ? 'Đang bảo trì' : 'Service Down'}
                    </h1>
                    <p className="text-slate-500 text-lg md:text-xl font-medium leading-relaxed max-w-md mx-auto">
                      {locale === 'vi' 
                        ? 'Hệ thống hiện đang được bảo trì để nâng cấp trải nghiệm. Vui lòng quay lại sau!' 
                        : 'Web system is currently under maintenance. Please come back later!'}
                    </p>
                  </div>

                  {/* Contact Info */}
                  {(settings?.contactPhone || settings?.contactEmail) && (
                    <div className="pt-10 border-t border-slate-100 flex flex-col items-center gap-3">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">LIÊN HỆ HỖ TRỢ</p>
                      <div className="flex flex-wrap justify-center gap-6">
                        {settings.contactPhone && (
                          <div className="flex items-center gap-2 text-slate-700 bg-slate-50 px-4 py-2 rounded-full font-semibold text-sm">
                            <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                            {settings.contactPhone}
                          </div>
                        )}
                        {settings.contactEmail && (
                          <div className="flex items-center gap-2 text-slate-700 bg-slate-50 px-4 py-2 rounded-full font-semibold text-sm">
                            <span className="w-2 h-2 bg-sky-500 rounded-full animate-pulse" />
                            {settings.contactEmail}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Back to Home if it was actually useful, but here we block everything */}
              <p className="mt-8 text-slate-400 text-sm font-medium">
                © {new Array().fill(new Date().getFullYear())} {settings?.siteName || 'Sport Arena'}. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang={locale}>
      <body className={inter.className} suppressHydrationWarning={true}>
        <NextIntlClientProvider messages={messages}>
          <Providers>
              <Navbar />
              <main className="min-h-screen">
                {children}
              </main>
              <Footer />
              <Toaster />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}