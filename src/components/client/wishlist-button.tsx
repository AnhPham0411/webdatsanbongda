"use client";

import { useTransition } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { toggleWishlist } from "@/actions/client/wishlist";
import { cn } from "@/lib/utils";
import { useWishlistStore } from "@/hooks/use-wishlist-store"; // 👈 1. Import Store

interface WishlistButtonProps {
  roomId: string;
  // Các thông tin cần thiết để thêm vào Store hiển thị trên Navbar
  roomName?: string;
  roomPrice?: number;
  roomAddress?: string;
  roomImage?: string;
  currentUser?: any;
}

export const WishlistButton = ({ 
  roomId, 
  roomName = "", 
  roomPrice = 0, 
  roomAddress = "", 
  roomImage = "",
  currentUser 
}: WishlistButtonProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  // 2. Lấy state và hàm từ Store
  const { items, addItem, removeItem } = useWishlistStore();
  
  // 3. Kiểm tra xem phòng này có trong Store không (Thay vì dùng props isLiked cũ)
  // Store là nguồn chân lý duy nhất (Single Source of Truth)
  const isLiked = items.some((item) => item.id === roomId);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      toast.error("Vui lòng đăng nhập", {
        description: "Bạn cần đăng nhập để lưu phòng yêu thích.",
        action: {
          label: "Đăng nhập",
          onClick: () => router.push("/auth/login"),
        },
      });
      return;
    }

    // 4. OPTIMISTIC UI: Cập nhật Store ngay lập tức
    if (isLiked) {
      removeItem(roomId); // Xóa khỏi Store -> Navbar giảm số, Card tim xám ngay
      toast.success("Đã xóa khỏi danh sách");
    } else {
      addItem({ // Thêm vào Store -> Navbar tăng số, Card tim đỏ ngay
        id: roomId,
        name: roomName,
        price: roomPrice,
        address: roomAddress,
        image: roomImage
      });
      toast.success("Đã lưu vào danh sách yêu thích");
    }

    // 5. Gọi Server Action (ngầm) để lưu vào DB
    startTransition(async () => {
      const res = await toggleWishlist(roomId);
      
      if (res.error) {
        // Nếu lỗi server thì revert lại Store (Hoàn tác)
        if (isLiked) {
            // Lúc nãy xóa nhầm, giờ thêm lại
            addItem({ id: roomId, name: roomName, price: roomPrice, address: roomAddress, image: roomImage });
        } else {
            // Lúc nãy thêm nhầm, giờ xóa đi
            removeItem(roomId);
        }
        toast.error(res.error);
      } else {
        // Thành công thì refresh để đồng bộ state server (nếu cần thiết cho các phần khác)
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
            ? "fill-rose-500 text-rose-500" // Đã like (theo Store)
            : "text-slate-500 group-hover/heart:text-rose-500" // Chưa like
        )}
      />
    </button>
  );
};