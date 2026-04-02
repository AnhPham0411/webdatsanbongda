"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createVoucher, updateVoucher } from "@/actions/admin/voucher";
import { toast } from "sonner";
import { 
  CalendarIcon, 
  Loader2, 
  Tag, 
  Percent, 
  Banknote, 
  Hash, 
  Clock 
} from "lucide-react";

export const VoucherForm = ({
  initialData,
  onSuccess,
}: {
  initialData?: any;
  onSuccess: () => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // Helper: Format ngày cho input date
  const formatDate = (date: any) => {
    if (!date) return new Date().toISOString().split("T")[0];
    return new Date(date).toISOString().split("T")[0];
  };

  const form = useForm({
    defaultValues: {
      code: initialData?.code || "",
      discountType: initialData?.discountType || "FIXED",
      discountValue: initialData?.discountValue || 0,
      minOrderValue: initialData?.minOrderValue || 0,
      usageLimit: initialData?.usageLimit || 0, // 0 = Không giới hạn
      startDate: formatDate(initialData?.startDate),
      endDate: formatDate(initialData?.endDate),
    },
  });

  // Theo dõi loại giảm giá để đổi icon/placeholder
  const discountType = form.watch("discountType");

  const onSubmit = async (values: any) => {
    setIsLoading(true);
    try {
      // Chuyển đổi dữ liệu số trước khi gửi
      const payload = {
        ...values,
        discountValue: Number(values.discountValue),
        minOrderValue: Number(values.minOrderValue),
        usageLimit: Number(values.usageLimit) > 0 ? Number(values.usageLimit) : null,
      };

      const res = initialData
        ? await updateVoucher(initialData.id, payload)
        : await createVoucher(payload);

      if (res.success) {
        toast.success(res.success);
        onSuccess();
      } else {
        toast.error(res.error);
      }
    } catch (error) {
      toast.error("Đã có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        
        {/* --- KHU VỰC MÃ CODE --- */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-4">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-blue-600" /> Mã Voucher
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="VD: SUMMER2026"
                    className="font-mono uppercase font-bold tracking-wide placeholder:font-normal"
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Mã phải là duy nhất và viết hoa không dấu.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* --- KHU VỰC GIÁ TRỊ GIẢM --- */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="discountType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loại giảm giá</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="PERCENT">
                      <div className="flex items-center gap-2">
                        <Percent className="w-4 h-4 text-orange-500" /> Theo Phần trăm (%)
                      </div>
                    </SelectItem>
                    <SelectItem value="FIXED">
                      <div className="flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-green-600" /> Số tiền cố định (VND)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="discountValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {discountType === "PERCENT" ? "Số % giảm" : "Số tiền giảm (VND)"}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input {...field} type="number" min="0" disabled={isLoading} className="pl-9" />
                    <div className="absolute left-3 top-2.5 text-slate-400">
                      {discountType === "PERCENT" ? <Percent className="w-4 h-4" /> : <Banknote className="w-4 h-4" />}
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* --- KHU VỰC ĐIỀU KIỆN --- */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="minOrderValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Đơn tối thiểu (VND)</FormLabel>
                <FormControl>
                  <Input {...field} type="number" min="0" disabled={isLoading} placeholder="0 = Áp dụng mọi đơn" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="usageLimit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Giới hạn lượt dùng</FormLabel>
                <FormControl>
                   <div className="relative">
                    <Input {...field} type="number" min="0" disabled={isLoading} className="pl-9" />
                    <Hash className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                   </div>
                </FormControl>
                <FormDescription className="text-xs">Để 0 nếu không giới hạn.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* --- KHU VỰC THỜI GIAN --- */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-emerald-600" /> Ngày bắt đầu
                </FormLabel>
                <FormControl>
                  <Input {...field} type="date" disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                   <Clock className="w-4 h-4 text-red-500" /> Ngày kết thúc
                </FormLabel>
                <FormControl>
                  <Input {...field} type="date" disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button 
          type="submit" 
          disabled={isLoading} 
          className="w-full h-11 text-base font-semibold shadow-md bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xử lý...
            </>
          ) : (
            initialData ? "Lưu thay đổi" : "Tạo mã khuyến mãi"
          )}
        </Button>
      </form>
    </Form>
  );
};