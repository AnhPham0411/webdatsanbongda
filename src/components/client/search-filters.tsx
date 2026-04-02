"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  Search,
  Activity,
  BoxSelect,
  MapPin,
  Clock,
  Map,
} from "lucide-react";

import { getLocations } from "@/actions/client/get-locations"; 
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface SearchFiltersProps {
  className?: string;
  vertical?: boolean;
}

type LocationOption = {
  id: string;
  name: string;
};

export const SearchFilters = ({ className, vertical = false }: SearchFiltersProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [date, setDate] = useState<Date | undefined>();
  const [timeSlot, setTimeSlot] = useState("");
  const [district, setDistrict] = useState("");
  const [locationId, setLocationId] = useState("");
  
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await getLocations();
        setLocations(data);
      } catch (error) {
        console.error("Failed to load locations");
      } finally {
        setIsLoadingLocations(false);
      }
    };
    fetchLocations();

    const paramDate = searchParams.get("date");
    const paramTimeSlot = searchParams.get("timeSlot");
    const paramDistrict = searchParams.get("district");
    const paramLocation = searchParams.get("locationId");

    if (paramDate) {
        const dateObj = new Date(paramDate);
        if(!isNaN(dateObj.getTime())) {
             setDate(dateObj);
        }
    }
    if (paramTimeSlot) setTimeSlot(paramTimeSlot);
    if (paramDistrict) setDistrict(paramDistrict);
    if (paramLocation) setLocationId(paramLocation);
  }, [searchParams]);

  const onSearch = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (locationId && locationId !== "all") params.set("locationId", locationId);
    else params.delete("locationId");

    if (date) params.set("date", date.toISOString());
    else params.delete("date");

    if (timeSlot && timeSlot !== "all") params.set("timeSlot", timeSlot);
    else params.delete("timeSlot");

    if (district && district !== "all") params.set("district", district);
    else params.delete("district");

    router.push(`/search?${params.toString()}`);
  };

  const triggerHeight = "min-h-[76px]";
  const triggerClass = cn(
    triggerHeight,
    "w-full rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-100",
    "px-4 py-3 transition-all flex items-start gap-4 text-left"
  );
  const iconBoxClass = "mt-1 flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center";
  const textClass = "flex-1 font-semibold text-slate-700 text-base leading-tight";

  const FieldWrapper = ({ children }: { children: React.ReactNode }) =>
    vertical ? <div className="rounded-2xl border bg-white p-2 shadow-sm">{children}</div> : <>{children}</>;

  return (
    <div
      className={cn(
        "w-full rounded-3xl bg-white transition-all",
        vertical ? "flex flex-col gap-5 p-0" : "flex flex-col gap-4 p-3 lg:flex-row lg:items-center",
        className
      )}
    >
      {/* 1. ĐỊA ĐIỂM CỤM SÂN */}
      <div className="flex-1">
        <FieldWrapper>
          <Select value={locationId} onValueChange={setLocationId}>
            <SelectTrigger className={cn(triggerClass, "hover:border-emerald-400 focus:ring-emerald-100")}>
              <div className={cn(iconBoxClass, "bg-emerald-100 text-emerald-600")}><MapPin className="h-6 w-6" /></div>
              <div className={textClass}>
                <span className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Cụm sân</span>
                <SelectValue placeholder={isLoadingLocations ? "Đang tải..." : "Bạn muốn đá ở đâu?"} />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả cụm sân</SelectItem>
              {locations.map((loc) => (
                <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
              ))}
              {!isLoadingLocations && locations.length === 0 && (
                 <div className="p-2 text-sm text-slate-500 text-center">Chưa có cụm sân nào</div>
              )}
            </SelectContent>
          </Select>
        </FieldWrapper>
      </div>

      {/* 2. NGÀY ĐÁ (Single Date) */}
      <div className="flex-1">
        <FieldWrapper>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn(triggerClass, "hover:border-rose-400 focus:ring-rose-100 justify-start")}>
                <div className={cn(iconBoxClass, "bg-rose-100 text-rose-600")}><CalendarIcon className="h-6 w-6" /></div>
                <div className={textClass}>
                  <span className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Ngày đá</span>
                  {date ? (
                    <span>{format(date, "dd/MM/yyyy", { locale: vi })}</span>
                  ) : (
                    <span className="font-normal text-slate-400">Chọn ngày</span>
                  )}
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="single"
                defaultMonth={date}
                selected={date}
                onSelect={setDate}
                locale={vi}
                disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
              />
            </PopoverContent>
          </Popover>
        </FieldWrapper>
      </div>

      {/* 3. KHUNG GIỜ (Time Slot) */}
      <div className="flex-1">
        <FieldWrapper>
          <Select value={timeSlot} onValueChange={setTimeSlot}>
            <SelectTrigger className={cn(triggerClass, "hover:border-blue-400 focus:ring-blue-100")}>
              <div className={cn(iconBoxClass, "bg-blue-100 text-blue-600")}><Clock className="h-6 w-6" /></div>
              <div className={textClass}>
                <span className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Khung giờ</span>
                <SelectValue placeholder="Chọn ca đá" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="0530-0700">05:30 - 07:00</SelectItem>
              <SelectItem value="0700-0830">07:00 - 08:30</SelectItem>
              <SelectItem value="1600-1730">16:00 - 17:30</SelectItem>
              <SelectItem value="1730-1900">17:30 - 19:00</SelectItem>
              <SelectItem value="1900-2030">19:00 - 20:30</SelectItem>
              <SelectItem value="2030-2200">20:30 - 22:00</SelectItem>
            </SelectContent>
          </Select>
        </FieldWrapper>
      </div>

      {/* 4. KHU VỰC (District) */}
      <div className="flex-1">
        <FieldWrapper>
          <Select value={district} onValueChange={setDistrict}>
            <SelectTrigger className={cn(triggerClass, "hover:border-orange-400 focus:ring-orange-100")}>
              <div className={cn(iconBoxClass, "bg-orange-100 text-orange-600")}><Map className="h-6 w-6" /></div>
              <div className={textClass}>
                <span className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Khu vực</span>
                <SelectValue placeholder="Chọn quận/huyện" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="dong_da">Quận Đống Đa</SelectItem>
              <SelectItem value="cau_giay">Quận Cầu Giấy</SelectItem>
              <SelectItem value="thanh_xuan">Quận Thanh Xuân</SelectItem>
              <SelectItem value="ha_dong">Quận Hà Đông</SelectItem>
            </SelectContent>
          </Select>
        </FieldWrapper>
      </div>

      {/* 5. SEARCH BUTTON */}
      <div className={cn(vertical ? "w-full pt-3" : "w-full lg:w-auto")}>
        <Button
          onClick={onSearch}
          className={cn(
            "h-[76px] w-full rounded-2xl bg-blue-600 text-lg font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 transition-all"
          )}
        >
          <Search className="mr-2 h-5 w-5" />
          {vertical ? "Tìm kiếm ngay" : "Tìm sân"}
        </Button>
      </div>
    </div>
  );
};