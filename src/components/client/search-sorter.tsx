"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const SearchSorter = () => {
  const router = useRouter();
  const pathname = usePathname(); // 1. Lấy đường dẫn hiện tại động
  const searchParams = useSearchParams();
  
  const currentSort = searchParams.get("sort") || "recommended";

  const onSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);

    // 2. Dùng pathname động + scroll: false để trải nghiệm mượt hơn
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-500 hidden sm:inline-block">Sắp xếp:</span>
      <Select value={currentSort} onValueChange={onSortChange}>
        <SelectTrigger className="w-[180px] h-9 bg-white shadow-sm border-slate-200">
          <SelectValue placeholder="Sắp xếp" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recommended">Được đề xuất</SelectItem>
          <SelectItem value="price_asc">Giá: Thấp đến Cao</SelectItem>
          <SelectItem value="price_desc">Giá: Cao đến Thấp</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};