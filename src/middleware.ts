import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale, localePrefix } from "./i18n/routing";

// 1. Initialize next-intl middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix, 
});

/**
 * Main Middleware (Next.js 16 Proxy)
 * Combines Authentication (NextAuth) and Internationalization (next-intl)
 */
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // 1. SKIP static files and API
  if (
    pathname.startsWith("/api") || 
    pathname.startsWith("/_next") || 
    pathname.includes(".") || 
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Debug: Log the incoming request and cookies
  const localeCookie = req.cookies.get("NEXT_LOCALE")?.value;
  console.log(`[Proxy] Request: ${pathname} | Cookie Locale: ${localeCookie}`);

  // 2. FORCE REDIRECT URLs with locale prefixes to prefix-less versions
  const firstSegment = pathname.split("/")[1];
  if (locales.includes(firstSegment as any)) {
    const newPath = pathname.replace(`/${firstSegment}`, "") || "/";
    const response = NextResponse.redirect(new URL(newPath, req.url));
    // Important: Set cookie for the redirect
    response.cookies.set("NEXT_LOCALE", firstSegment);
    return response;
  }

  // 3. ROLE PROTECTION for /admin
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    const role = req.auth?.user?.role;
    if (role !== "ADMIN" && role !== "STAFF") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // 4. AUTH PAGES protection
  const isAuthPage = pathname.includes("/login") || pathname.includes("/register");
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  /**
   * 5. HANDLE next-intl REWRITE
   * If we have a locale cookie, ensures next-intl uses it.
   */
  const response = intlMiddleware(req);
  
  // Important: next-intl expects to find the locale in the header for 'localePrefix: never'
  // We need to ensure it's on the request that the server components see.
  const finalLocale = localeCookie || defaultLocale;
  response.headers.set("x-next-intl-locale", finalLocale);

  return response;
});

// Configure Matcher
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};