"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import { useTranslations, useLocale } from "next-intl";
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
  district?: string | null;
};

export const SearchFilters = ({ className, vertical = false }: SearchFiltersProps) => {
  const t = useTranslations("SearchFilters");
  const currentLocale = useLocale();
  const dateLocale = currentLocale === "en" ? enUS : vi;

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
    "px-3 py-3 transition-all flex items-start gap-2.5 text-left"
  );
  const iconBoxClass = "mt-1 flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center";
  const textClass = "flex-1 font-semibold text-slate-700 text-[14px] leading-tight min-w-0 overflow-hidden";

  const FieldWrapper = ({ children }: { children: React.ReactNode }) =>
    vertical ? <div className="rounded-2xl border bg-white p-2 shadow-sm">{children}</div> : <>{children}</>;

  const handleDistrictChange = (val: string) => {
    setDistrict(val);
    setLocationId(""); // Clear selected cluster when district changes
  };

  const isDistrictSelected = district && district !== "all";
  const filteredLocations = isDistrictSelected 
     ? locations.filter(loc => loc.district === district) 
     : locations;

  return (
    <div
      className={cn(
        "w-full rounded-3xl bg-white transition-all",
        vertical ? "flex flex-col gap-5 p-0" : "grid grid-cols-1 gap-4 p-3 lg:grid-cols-[1fr_1fr_1fr_1fr_80px] lg:items-stretch",
        className
      )}
    >
      {/* 1. KHU VỰC (District) */}
      <div className="w-full">
        <FieldWrapper>
          <Select value={district} onValueChange={handleDistrictChange}>
            <SelectTrigger className={cn(triggerClass, "hover:border-orange-400 focus:ring-orange-100")}>
              <div className={cn(iconBoxClass, "bg-orange-100 text-orange-600")}><Map className="h-5 w-5" /></div>
              <div className={textClass}>
                <span className="mb-1 block text-xs uppercase tracking-wider text-slate-400">{t("district")}</span>
                <SelectValue placeholder={t("districtPlaceholder")} />
              </div>
            </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allDistricts")}</SelectItem>
                <SelectItem value="Đống Đa">Đống Đa</SelectItem>
                <SelectItem value="Cầu Giấy">Cầu Giấy</SelectItem>
                <SelectItem value="Thanh Xuân">Thanh Xuân</SelectItem>
                <SelectItem value="Hà Đông">Hà Đông</SelectItem>
              </SelectContent>
          </Select>
        </FieldWrapper>
      </div>

      {/* 2. ĐỊA ĐIỂM CỤM SÂN */}
      <div className="w-full">
        <FieldWrapper>
          <Select value={locationId} onValueChange={setLocationId} disabled={!isDistrictSelected}>
            <SelectTrigger className={cn(triggerClass, "hover:border-emerald-400 focus:ring-emerald-100", !isDistrictSelected && "opacity-60 cursor-not-allowed")}>
              <div className={cn(iconBoxClass, "bg-emerald-100 text-emerald-600")}><MapPin className="h-5 w-5" /></div>
              <div className={textClass}>
                <span className="mb-1 block text-xs uppercase tracking-wider text-slate-400">{t("location")}</span>
                <SelectValue placeholder={!isDistrictSelected ? t("locationWait") : (isLoadingLocations ? t("loading") : t("locationPlaceholder"))} />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allLocations")}</SelectItem>
              {filteredLocations.map((loc) => (
                <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
              ))}
              {!isLoadingLocations && filteredLocations.length === 0 && (
                 <div className="p-2 text-sm text-slate-500 text-center">{t("noLocations")}</div>
              )}
            </SelectContent>
          </Select>
        </FieldWrapper>
      </div>

      {/* 3. NGÀY ĐÁ (Single Date) */}
      <div className="w-full">
        <FieldWrapper>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn(triggerClass, "hover:border-rose-400 focus:ring-rose-100 justify-start")}>
                <div className={cn(iconBoxClass, "bg-rose-100 text-rose-600")}><CalendarIcon className="h-5 w-5" /></div>
                <div className={textClass}>
                  <span className="mb-1 block text-xs uppercase tracking-wider text-slate-400">{t("date")}</span>
                  {date ? (
                    <span>{format(date, "dd/MM/yyyy", { locale: dateLocale })}</span>
                  ) : (
                    <span className="font-normal text-slate-400">{t("datePlaceholder")}</span>
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
                locale={dateLocale}
                disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
              />
            </PopoverContent>
          </Popover>
        </FieldWrapper>
      </div>

      {/* 4. KHUNG GIỜ (Time Slot) */}
      <div className="w-full">
        <FieldWrapper>
          <Select value={timeSlot} onValueChange={setTimeSlot}>
            <SelectTrigger className={cn(triggerClass, "hover:border-blue-400 focus:ring-blue-100")}>
              <div className={cn(iconBoxClass, "bg-blue-100 text-blue-600")}><Clock className="h-5 w-5" /></div>
              <div className={textClass}>
                <span className="mb-1 block text-xs uppercase tracking-wider text-slate-400">{t("timeSlot")}</span>
                <SelectValue placeholder={t("timeSlotPlaceholder")} />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allTimeSlots")}</SelectItem>
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

      {/* 5. SEARCH BUTTON */}
      <div className="w-full">
        <Button
          onClick={onSearch}
          className={cn(
            "h-[76px] w-full rounded-2xl bg-blue-600 font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 transition-all flex items-center justify-center p-0"
          )}
          title={t("searchButton")}
        >
          <Search className={cn("h-6 w-6", !vertical && "lg:m-0 mr-2")} />
          <span className={cn(vertical ? "block text-lg" : "lg:hidden block text-lg")}>
             {vertical ? t("searchButtonVertical") : t("searchButton")}
          </span>
        </Button>
      </div>
    </div>
  );
};