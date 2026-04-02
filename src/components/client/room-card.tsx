"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { SafeRoom } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Users, Check } from "lucide-react"; 
import { WishlistButton } from "@/components/client/wishlist-button";

interface RoomCardProps {
  room: SafeRoom & { isLiked?: boolean };
  currentUser?: any;
}

export const RoomCard = ({ room, currentUser }: RoomCardProps) => {
  // 1. Chuẩn bị dữ liệu hiển thị (Image & Address)
  const coverImage = room.images[0]?.url || "/images/placeholder.jpg";
  const address = room.roomType.location?.name || room.roomType.description || "";

  return (
    <Card className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full border-slate-200 bg-white rounded-2xl">
      
      {/* --- PHẦN HÌNH ẢNH --- */}
      <div className="relative h-[240px] w-full overflow-hidden">
        <Image
          src={coverImage}
          alt={room.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700"
        />
        
        {/* Badge: Hết sân */}
        {!room.isAvailable && (
          <div className="absolute top-3 left-3 bg-red-500/90 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm z-10 uppercase tracking-wide">
            Hết sân
          </div>
        )}

        {/* --- CỤM NÚT TƯƠNG TÁC (Góc Phải) --- */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
            
            {/* 1. Nút Wishlist (Đã cập nhật props cho Store) */}
            <div className="relative">
                <WishlistButton 
                    roomId={room.id} 
                    currentUser={currentUser} 
                    // 👇 Props quan trọng để Store hoạt động
                    roomName={room.name}
                    roomPrice={Number(room.roomType.basePrice)}
                    roomImage={coverImage}
                    roomAddress={address}
                />
            </div>
        </div>

        {/* Overlay gradient */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* --- PHẦN NỘI DUNG --- */}
      <CardContent className="p-5 flex-1 flex flex-col">
        <div className="mb-3">
           <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-md">
              {room.roomType.name}
           </span>
        </div>

        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-slate-900 line-clamp-1 group-hover:text-blue-700 transition-colors">
            {room.name}
          </h3>
        </div>

        <div className="flex items-center text-slate-500 text-sm mb-4">
          <Users className="w-4 h-4 mr-1.5 text-slate-400" />
          <span className="font-medium">{room.roomType.capacity} khách</span>
        </div>

        <p className="line-clamp-2 text-sm text-slate-600 mb-6 flex-1 leading-relaxed">
          {room.roomType.description}
        </p>

        {/* Giá tiền */}
        <div className="flex items-baseline gap-1 mt-auto pt-4 border-t border-slate-100">
          <span className="text-xl font-bold text-blue-600">
            {formatCurrency(Number(room.roomType.basePrice))}
          </span>
          <span className="text-xs text-slate-400 font-medium">/ đêm</span>
        </div>
      </CardContent>

      {/* --- PHẦN FOOTER --- */}
      <CardFooter className="p-5 pt-0">
        <Button asChild className="w-full h-11 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-medium shadow-md shadow-slate-200 transition-all duration-300">
          <Link href={`/rooms/${room.id}`}>
            Xem chi tiết
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};