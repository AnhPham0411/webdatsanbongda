"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { SafeCourt } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Star, Check } from "lucide-react"; 
import { WishlistButton } from "@/components/client/wishlist-button";
import { useTranslations } from "next-intl";

interface CourtCardProps {
  court: SafeCourt & { isLiked?: boolean };
  currentUser?: any;
}

export const CourtCard = ({ court, currentUser }: CourtCardProps) => {
  const t = useTranslations("CourtCard");
  const address = (court.courtType as any).location?.name || court.courtType.description || "";

  // 2. Rating
  const totalReviews = court.reviews?.length || 0;
  const avgRating = totalReviews > 0
    ? (court.reviews?.reduce((acc: number, r: any) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : "0.0";

  return (
    <Card className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full border-slate-200 bg-white rounded-2xl">
      
      {/* --- PHẦN NỘI DUNG --- */}
      <CardContent className="p-6 flex-1 flex flex-col relative">
         {/* Badge: Hết sân - Moved inside content */}
         {!court.isAvailable && (
          <div className="absolute top-6 right-6 bg-red-100 text-red-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
            {t("unavailable")}
          </div>
        )}

         <div className="mb-4 flex justify-between items-start">
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-md">
               {court.courtType.name}
            </span>
            
            {/* Wishlist Button - Relocated */}
            <WishlistButton 
                courtId={court.id} 
                currentUser={currentUser} 
                courtName={court.name}
                courtPrice={Number(court.courtType.basePrice)}
                courtImage={""} 
                courtAddress={address}
            />
         </div>

        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-slate-900 line-clamp-1 group-hover:text-blue-700 transition-colors">
            {court.name}
          </h3>
        </div>

        <div className="flex items-center text-slate-500 text-sm mb-4">
          <Star className="w-4 h-4 mr-1.5 text-yellow-500 fill-yellow-500" />
          <span className="font-bold text-slate-800">{avgRating}</span>
          <span className="ml-1">({totalReviews} {t("reviews")})</span>
        </div>

        <p className="line-clamp-2 text-sm text-slate-600 mb-6 flex-1 leading-relaxed">
          {court.courtType.description}
        </p>

        {/* Giá tiền */}
        <div className="flex items-baseline gap-1 mt-auto pt-4 border-t border-slate-100">
          <span className="text-xl font-bold text-blue-600">
            {formatCurrency(Number(court.courtType.basePrice))}
          </span>
          <span className="text-xs text-slate-400 font-medium">{t("perSlot")}</span>
        </div>
      </CardContent>

      {/* --- PHẦN FOOTER --- */}
      <CardFooter className="p-5 pt-0">
        <Button asChild className="w-full h-11 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-medium shadow-md shadow-slate-200 transition-all duration-300">
          <Link href={`/courts/${court.id}`}>
            {t("viewDetails")}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};