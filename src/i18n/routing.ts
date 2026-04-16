export const locales = ["vi", "en"] as const;
export const defaultLocale = "vi" as const;
export const localePrefix = "never"; // TUYỆT ĐỐI KHÔNG thêm /vi hoặc /en vào URL
export type Locale = (typeof locales)[number];
