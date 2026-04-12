import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Providers from "@/components/Providers"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sport Arena - Hệ thống đặt sân bóng trực tuyến",
  description: "Hệ thống quản lý và đặt sân bóng đá cỏ nhân tạo hiện đại, tiện lợi và uy chín.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={inter.className} suppressHydrationWarning={true}>
        <Providers>
            {children}
            <Toaster />
        </Providers>
      </body>
    </html>
  );
}