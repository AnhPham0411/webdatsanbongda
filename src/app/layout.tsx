import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

// Lưu ý: Kiểm tra xem file Providers của bạn export default hay export const
// Nếu export default function Providers... thì dùng dòng dưới:
import Providers from "@/components/Providers"; 
// Nếu export const Providers = ... thì dùng: import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hệ thống đặt sân bóng",
  description: "Graduation Project",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      {/* 👇 THÊM suppressHydrationWarning={true} ĐỂ SỬA LỖI EXTENSION TRÌNH DUYỆT 👇 */}
      <body className={inter.className} suppressHydrationWarning={true}>
        <Providers>
            {children}
            <Toaster />
        </Providers>
      </body>
    </html>
  );
}