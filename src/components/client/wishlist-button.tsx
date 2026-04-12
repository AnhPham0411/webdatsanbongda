"use client";

import { useTransition } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { toggleWishlist } from "@/actions/client/wishlist";
import { cn } from "@/lib/utils";
import { useWishlistStore } from "@/hooks/use-wishlist-store"; 

interface WishlistButtonProps {
  courtId: string;
  courtName?: string;
  courtPrice?: number;
  courtAddress?: string;
  courtImage?: string;
  currentUser?: any;
}

export const WishlistButton = ({ 
  courtId, 
  courtName = "", 
  courtPrice = 0, 
  courtAddress = "", 
  courtImage = "",
  currentUser 
}: WishlistButtonProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const { items, addItem, removeItem } = useWishlistStore();
  
  const isLiked = items.some((item) => item.id === courtId);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      toast.error("Vui lòng đăng nhập", {
        description: "Bạn cần đăng nhập để lưu sân bóng yêu thích.",
        action: {
          label: "Đăng nhập",
          onClick: () => router.push("/login"),
        },
      });
      return;
    }

    if (isLiked) {
      removeItem(courtId);
      toast.success("Đã xóa khỏi danh sách");
    } else {
      addItem({
        id: courtId,
        name: courtName,
        price: courtPrice,
        address: courtAddress,
        image: courtImage
      });
      toast.success("Đã lưu vào danh sách yêu thích");
    }

    startTransition(async () => {
      const res = await toggleWishlist(courtId);
      
      if (res.error) {
        if (isLiked) {
            addItem({ id: courtId, name: courtName, price: courtPrice, address: courtAddress, image: courtImage });
        } else {
            removeItem(courtId);
        }
        toast.error(res.error);
      } else {
        router.refresh();
      }
    });
  };

  return (
    <button
      onClick={onClick}
      disabled={isPending}
      className="p-2.5 rounded-full bg-white/90 hover:bg-white shadow-sm hover:scale-110 transition-all group/heart flex items-center justify-center"
      title={isLiked ? "Bỏ yêu thích" : "Yêu thích"}
    >
      <Heart
        className={cn(
          "w-5 h-5 transition-colors",
          isLiked
            ? "fill-rose-500 text-rose-500"
            : "text-slate-500 group-hover/heart:text-rose-500"
        )}
      />
    </button>
  );
};