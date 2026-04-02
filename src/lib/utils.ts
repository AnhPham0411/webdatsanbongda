import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Hàm cn: Dùng để gộp class Tailwind (bắt buộc cho Shadcn UI)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Hàm formatCurrency: Dùng để hiển thị tiền VND
export function formatCurrency(amount: number | string) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(Number(amount));
}