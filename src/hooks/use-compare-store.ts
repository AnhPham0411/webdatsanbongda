import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from 'sonner';

interface CompareStore {
  ids: string[];
  addCourt: (id: string) => void;
  removeCourt: (id: string) => void;
  clear: () => void;
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      ids: [],
      addCourt: (id: string) => {
        const currentIds = get().ids;
        if (currentIds.includes(id)) {
          toast.info("Sân này đã có trong danh sách so sánh!");
          return;
        }
        if (currentIds.length >= 3) {
          toast.warning("Chỉ được so sánh tối đa 3 sân!");
          return;
        }
        set({ ids: [...currentIds, id] });
        toast.success("Đã thêm vào so sánh");
      },
      removeCourt: (id: string) => {
        set({ ids: get().ids.filter((i) => i !== id) });
        toast.success("Đã xóa khỏi danh sách");
      },
      clear: () => set({ ids: [] }),
    }),
    {
      name: 'compare-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);