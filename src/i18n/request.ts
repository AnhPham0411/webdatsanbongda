import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { locales, defaultLocale } from './routing';

export default getRequestConfig(async ({ locale: rawLocale }) => {
  // 1. Phục hồi locale từ cookie nếu next-intl không tự nhận diện được (khi dùng prefix 'never')
  let locale = rawLocale;
  
  if (!locale) {
    const cookieStore = await cookies();
    locale = cookieStore.get('NEXT_LOCALE')?.value || defaultLocale;
  }

  // Debug: Log the locale being used
  console.log(`[i18n] Request Config for locale: "${locale}" (original: "${rawLocale}")`);

  // Xác minh xem locale có hợp lệ không
  if (!locales.includes(locale as any)) {
    console.error(`[i18n] Invalid locale: "${locale}". Calling notFound()`);
    notFound();
  }

  return {
    locale: locale as string,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
