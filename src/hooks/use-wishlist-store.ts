import { create } from 'zustand';

// Định nghĩa kiểu dữ liệu cho 1 món trong Wishlist
interface WishlistItem {
  id: string;
  name: string;
  price: number;
  address: string;
  image: string;
}

// Định nghĩa kiểu dữ liệu cho Store
interface WishlistStore {
  items: WishlistItem[];
  hasLoaded: boolean; // Cờ kiểm tra đã fetch dữ liệu lần đầu chưa
  
  // Các hành động (Actions)
  setItems: (items: WishlistItem[]) => void;
  addItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
}

// Khởi tạo Store
export const useWishlistStore = create<WishlistStore>((set) => ({
  items: [],
  hasLoaded: false,

  // Hành động: Gán toàn bộ danh sách (Dùng khi fetch từ Server lần đầu)
  setItems: (items) => set({ items, hasLoaded: true }),

  // Hành động: Thêm 1 món (Dùng cho nút Tim)
  addItem: (item) => set((state) => {
    // Nếu đã tồn tại thì không thêm nữa để tránh trùng
    if (state.items.find((i) => i.id === item.id)) return state;
    return { items: [item, ...state.items] };
  }),

  // Hành động: Xóa 1 món (Dùng cho nút Tim hoặc nút X trên Navbar)
  removeItem: (id) => set((state) => ({
    items: state.items.filter((i) => i.id !== id),
  })),
}));