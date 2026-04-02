"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon, Loader2, Clock } from "lucide-react";
import { toast } from "sonner"; 

interface TimeSlotModel {
  id: string;
  startTime: string; // e.g., "17:00"
  endTime: string;   // e.g., "18:30"
  status: "available" | "booked" | "pending"; 
}

interface BookingFormProps {
  courtId?: string; 
  roomId?: string; // Tương thích ngược với file cha nếu chưa đổi
  basePrice: number;
  isAvailable: boolean;
}

// TODO: Replace with Real API Data
const MOCK_TIME_SLOTS: TimeSlotModel[] = [
  { id: "1", startTime: "16:00", endTime: "17:30", status: "booked" }, // Booked (Red)
  { id: "2", startTime: "17:30", endTime: "19:00", status: "pending" }, // Hold (Yellow)
  { id: "3", startTime: "19:00", endTime: "20:30", status: "available" }, // Trống (Green)
  { id: "4", startTime: "20:30", endTime: "22:00", status: "available" },
];

export const BookingForm = ({ courtId, roomId, basePrice, isAvailable }: BookingFormProps) => {
  const router = useRouter();
  const actualId = courtId || roomId;
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [slots, setSlots] = useState<TimeSlotModel[]>(MOCK_TIME_SLOTS);

  // You can implement useEffect to fetch actual TimeSlots from backend when `date` changes.

  const onBooking = async () => {
    if (!date || !selectedSlotId || !actualId) return;
    setIsLoading(true);

    try {
      const params = new URLSearchParams({
        courtId: actualId,
        date: date.toISOString(),
        timeSlotId: selectedSlotId,
        totalPrice: basePrice.toString(), // Simplified base price
      });
      
      router.push(`/booking/checkout?${params.toString()}`);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">1. Chọn ngày đá</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "dd/MM/yyyy", { locale: vi }) : <span>Chọn ngày</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              mode="single"
              locale={vi}
              defaultMonth={date}
              selected={date}
              onSelect={(d) => { setDate(d); setSelectedSlotId(null); }}
              disabled={(d) => d < new Date(new Date().setHours(0,0,0,0))}
            />
          </PopoverContent>
        </Popover>
      </div>

      {date && (
        <div className="space-y-3">
          <label className="text-sm font-medium flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            2. Chọn ca đá
          </label>
          <div className="grid grid-cols-2 gap-3">
            {slots.map((slot) => {
               // Color UI Logic
               let slotVariantClasses = "";
               const isSelected = selectedSlotId === slot.id;

               if (slot.status === "booked") {
                 slotVariantClasses = "bg-red-50 hover:bg-red-50 border-red-200 text-red-500 cursor-not-allowed opacity-70";
               } else if (slot.status === "pending") {
                 slotVariantClasses = "bg-yellow-50 hover:bg-yellow-50 border-yellow-200 text-yellow-600 cursor-not-allowed opacity-70";
               } else {
                 if (isSelected) {
                   slotVariantClasses = "bg-emerald-500 hover:bg-emerald-600 border-emerald-600 text-white shadow-md transform scale-[1.02]";
                 } else {
                   slotVariantClasses = "bg-white hover:bg-emerald-50 border-emerald-200 text-emerald-700 hover:border-emerald-400";
                 }
               }

               return (
                 <button
                   key={slot.id}
                   disabled={slot.status !== "available"}
                   onClick={() => setSelectedSlotId(slot.id)}
                   className={cn(
                     "flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200", 
                     slotVariantClasses
                   )}
                 >
                   <span className="font-semibold">{slot.startTime} - {slot.endTime}</span>
                   <span className="text-xs opacity-90 mt-1">
                     {slot.status === "available" ? "Trống" : slot.status === "booked" ? "Đã đặt" : "Đang giữ"}
                   </span>
                 </button>
               )
            })}
          </div>
        </div>
      )}

      {selectedSlotId && (
        <div className="bg-slate-50 p-4 rounded-lg space-y-2 text-sm border">
          <div className="flex justify-between">
            <span className="text-slate-600">Giá ca đã chọn</span>
            <span className="font-medium">{formatCurrency(basePrice)}</span>
          </div>
          <div className="flex justify-between text-base font-bold pt-2 border-t">
            <span>Tổng cộng</span>
            <span className="text-emerald-600">{formatCurrency(basePrice)}</span>
          </div>
        </div>
      )}

      <Button 
        size="lg" 
        className="w-full text-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50" 
        onClick={onBooking}
        disabled={!isAvailable || !date || !selectedSlotId || isLoading}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {isAvailable ? "Đặt sân ngay" : "Sân tạm đóng cửa"}
      </Button>
      
      {!isAvailable && (
        <p className="text-xs text-red-500 text-center">
          Sân này hiện không hoạt động.
        </p>
      )}
    </div>
  );
};