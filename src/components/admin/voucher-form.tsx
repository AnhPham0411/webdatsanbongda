"use client";

import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { createVoucher, updateVoucher } from "@/actions/admin/voucher";
import { getUsersOnly, getTopSpenders } from "@/actions/admin/users";
import { toast } from "sonner";
import { 
  CalendarIcon, 
  Loader2, 
  Tag, 
  Percent, 
  Banknote, 
  Hash, 
  Clock,
  User as UserIcon 
} from "lucide-react";

export const VoucherForm = ({
  initialData,
  onSuccess,
}: {
  initialData?: any;
  onSuccess: () => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [topSpenders, setTopSpenders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [allUsers, rankedUsers] = await Promise.all([
        getUsersOnly(),
        getTopSpenders()
      ]);
      setUsers(allUsers);
      setTopSpenders(rankedUsers);
    };
    fetchData();
  }, []);

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
      userId: initialData?.userId || "all",
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
        userId: values.userId === "all" ? null : values.userId,
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

          <FormField
            control={form.control}
            name="userId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="flex items-center gap-2 mb-1">
                  <UserIcon className="w-4 h-4 text-purple-600" /> Dành cho khách hàng
                </FormLabel>
                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={isLoading}
                      >
                        {field.value === "all" ? (
                          "Tất cả khách hàng (Công khai)"
                        ) : (
                          users.find((u) => u.id === field.value)?.name || 
                          users.find((u) => u.id === field.value)?.email || 
                          "Chọn khách hàng..."
                        )}
                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <div className="flex flex-col">
                      <div className="flex items-center border-b px-3 py-2">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <input
                          className="flex h-8 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Tìm tên hoặc email..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      
                      <div className="max-h-[300px] overflow-y-auto p-1">
                        {!searchTerm && (
                          <>
                            <Button
                              variant="ghost"
                              className="w-full justify-start font-normal"
                              onClick={() => {
                                field.onChange("all");
                                setIsPopoverOpen(false);
                              }}
                            >
                              <Check className={cn("mr-2 h-4 w-4", field.value === "all" ? "opacity-100" : "opacity-0")} />
                              Tất cả khách hàng (Công khai)
                            </Button>

                            {topSpenders.length > 0 && (
                              <div className="mt-2">
                                <div className="px-2 py-1.5 text-[10px] font-bold uppercase text-amber-600 tracking-wider">Top chi tiêu (VIP)</div>
                                {topSpenders.map((user, index) => (
                                  <Button
                                    key={`top-${user.id}`}
                                    variant="ghost"
                                    className="w-full justify-start font-normal text-emerald-700"
                                    onClick={() => {
                                      field.onChange(user.id);
                                      setIsPopoverOpen(false);
                                    }}
                                  >
                                    <Check className={cn("mr-2 h-4 w-4", field.value === user.id ? "opacity-100" : "opacity-0")} />
                                    ⭐ Top {index + 1}: {user.name}
                                  </Button>
                                ))}
                              </div>
                            )}
                            <div className="h-px bg-slate-100 my-1" />
                          </>
                        )}

                        {searchTerm ? (
                          <div className="space-y-1">
                             <div className="px-2 py-1.5 text-[10px] font-bold uppercase text-slate-400 tracking-wider">Kết quả tìm kiếm</div>
                             {users
                              .filter((u) => 
                                (u.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
                                (u.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
                              )
                              .slice(0, 10) // Giới hạn 10 kết quả cho nhanh
                              .map((user) => (
                                <Button
                                  key={user.id}
                                  variant="ghost"
                                  className="w-full justify-start font-normal"
                                  onClick={() => {
                                    field.onChange(user.id);
                                    setIsPopoverOpen(false);
                                    setSearchTerm("");
                                  }}
                                >
                                  <Check className={cn("mr-2 h-4 w-4", field.value === user.id ? "opacity-100" : "opacity-0")} />
                                  <div className="flex flex-col items-start overflow-hidden">
                                     <span className="truncate w-full">{user.name}</span>
                                     <span className="text-[10px] text-muted-foreground truncate w-full">{user.email}</span>
                                  </div>
                                </Button>
                              ))}
                             {users.filter((u) => (u.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || (u.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())).length === 0 && (
                                <div className="p-4 text-center text-sm text-slate-500">Không tìm thấy khách hàng nào</div>
                             )}
                          </div>
                        ) : (
                          <div className="p-4 text-center text-[10px] text-slate-400 italic">Nhập tên để tìm thêm khách hàng...</div>
                        )}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <FormDescription className="text-xs">
                  Chọn khách hàng cụ thể hoặc dùng tính năng tìm kiếm.
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