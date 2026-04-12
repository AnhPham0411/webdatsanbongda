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
import { CalendarIcon, Loader2, Clock, Plus, Minus, Shirt, Waves } from "lucide-react";
import { getExtraServices } from "@/actions/client/get-services";
import { getAvailableTimeSlots } from "@/actions/client/booking";

interface TimeSlotModel {
  id: string;
  startTime: string;
  endTime: string;
  status: "available" | "booked" | "pending"; 
}

interface BookingFormProps {
  courtId: string; 
  basePrice: number;
  isAvailable: boolean;
}

export const BookingForm = ({ courtId, basePrice, isAvailable }: BookingFormProps) => {
  const router = useRouter();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [slots, setSlots] = useState<TimeSlotModel[]>([]);
  const [extraServices, setExtraServices] = useState<any[]>([]);
  const [selectedServices, setSelectedServices] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchServices = async () => {
      const data = await getExtraServices();
      setExtraServices(data);
    };
    fetchServices();
  }, []);

  useEffect(() => {
    const fetchSlots = async () => {
       if (date && courtId) {
          const fetchedSlots = await getAvailableTimeSlots(courtId, date.toISOString());
          setSlots(fetchedSlots as TimeSlotModel[]);
          setSelectedSlotId(null);
       } else {
          setSlots([]);
       }
    };
    fetchSlots();
  }, [date, courtId]);

  const updateServiceQuantity = (id: string, delta: number) => {
    setSelectedServices((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: next };
    });
  };

  const calculateTotalExtras = () => {
    return Object.entries(selectedServices).reduce((total, [id, qty]) => {
      const service = extraServices.find(s => s.id === id);
      return total + (Number(service?.price || 0) * qty);
    }, 0);
  };

  const totalAmount = basePrice + calculateTotalExtras();

  const onBooking = async () => {
    if (!date || !selectedSlotId || !courtId) return;
    setIsLoading(true);

    try {
      const params = new URLSearchParams({
        courtId: courtId,
        date: date.toISOString(),
        timeSlotId: selectedSlotId,
        totalPrice: totalAmount.toString(),
        services: JSON.stringify(selectedServices),
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
               let slotVariantClasses = "";
               const isSelected = selectedSlotId === slot.id;

               if (slot.status === "booked") {
                 slotVariantClasses = "bg-red-50 hover:bg-red-50 border-red-200 text-red-500 cursor-not-allowed opacity-70";
               } else if (slot.status === "pending") {
                 slotVariantClasses = "bg-yellow-50 hover:bg-yellow-50 border-yellow-200 text-yellow-600 cursor-not-allowed opacity-70";
               } else {
                 if (isSelected) {
                   slotVariantClasses = "bg-blue-600 hover:bg-blue-700 border-blue-700 text-white shadow-md transform scale-[1.02]";
                 } else {
                   slotVariantClasses = "bg-white hover:bg-blue-50 border-blue-200 text-blue-700 hover:border-blue-400";
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

      <div className="space-y-3">
        <label className="text-sm font-medium flex items-center gap-2">
          <Plus className="w-4 h-4 text-slate-500" />
          3. Dịch vụ kèm theo
        </label>
        <div className="space-y-3">
          {extraServices.map((service) => (
            <div key={service.id} className="flex items-center justify-between p-3 bg-white border rounded-xl hover:border-blue-200 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  {service.name.toLowerCase().includes("áo") ? <Shirt className="w-5 h-5 text-blue-600" /> : <Waves className="w-5 h-5 text-blue-600" />}
                </div>
                <div>
                  <p className="font-medium text-sm">{service.name}</p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(Number(service.price))}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => updateServiceQuantity(service.id, -1)}
                  className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-slate-50 disabled:opacity-30"
                  disabled={!selectedServices[service.id]}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-4 text-center font-bold">{selectedServices[service.id] || 0}</span>
                <button 
                  onClick={() => updateServiceQuantity(service.id, 1)}
                  className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-slate-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedSlotId && (
        <div className="bg-slate-50 p-4 rounded-lg space-y-2 text-sm border border-slate-200">
          <div className="flex justify-between">
            <span className="text-slate-600">Giá ca đã chọn</span>
            <span className="font-medium">{formatCurrency(basePrice)}</span>
          </div>
          {Object.entries(selectedServices).map(([id, qty]) => {
            const service = extraServices.find(s => s.id === id);
            if (!service) return null;
            return (
              <div key={id} className="flex justify-between text-xs text-slate-500">
                <span>{service.name} x {qty}</span>
                <span>{formatCurrency(Number(service.price) * qty)}</span>
              </div>
            );
          })}
          <div className="flex justify-between text-base font-bold pt-2 border-t mt-2">
            <span>Tổng cộng</span>
            <span className="text-blue-600">{formatCurrency(totalAmount)}</span>
          </div>
        </div>
      )}

      <Button 
        size="lg" 
        className="w-full text-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50" 
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