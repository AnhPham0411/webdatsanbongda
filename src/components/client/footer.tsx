"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter, BedDouble } from "lucide-react";
import { useTranslations } from "next-intl";

export const Footer = () => {
  const t = useTranslations("Footer");
  const navT = useTranslations("Navbar");

  return (
    <footer className="border-t bg-slate-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          
          {/* Cột 1: Thông tin thương hiệu */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 text-white">
                <BedDouble className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Sport <span className="text-sky-500">Arena</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed">
              {t("description")}
            </p>
          </div>

          {/* Cột 2: Liên kết nhanh */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900">
              {t("explore")}
            </h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li>
                <Link href="/search" className="hover:text-sky-600 hover:underline transition-colors">
                  {navT("search")}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-sky-600 hover:underline transition-colors">
                  {navT("about")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-sky-600 hover:underline transition-colors">
                  {navT("contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Chính sách */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900">
              {t("policy")}
            </h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li>
                <Link href="/terms" className="hover:text-sky-600 hover:underline transition-colors">
                  {t("terms")}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-sky-600 hover:underline transition-colors">
                  {t("privacy")}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-sky-600 hover:underline transition-colors">
                  {t("faq")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 4: Mạng xã hội */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900">
              {t("connect")}
            </h3>
            <div className="flex space-x-4">
              <Link href="#" className="text-slate-400 hover:text-sky-500 hover:bg-sky-50 p-2 rounded-full transition-all">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-slate-400 hover:text-pink-600 hover:bg-pink-50 p-2 rounded-full transition-all">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-slate-400 hover:text-sky-400 hover:bg-sky-50 p-2 rounded-full transition-all">
                <Twitter className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Dòng bản quyền */}
        <div className="mt-12 border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left text-sm text-slate-500">
          <p>© {new Date().getFullYear()} Sport Arena. {t("rights")}</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-sky-600 transition-colors">{t("privacy")}</Link>
            <Link href="#" className="hover:text-sky-600 transition-colors">{t("cookies")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};