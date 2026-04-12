"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2, Save } from "lucide-react";

// Định nghĩa interface cục bộ để giải quyết vấn đề Prisma Client chưa được generate xong
export interface SystemSettings {
  id: string;
  siteName: string;
  siteLogo: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  openingTime: string;
  closingTime: string;
  minBookingDuration: number;
  maxAdvanceDays: number;
  cancelBeforeHours: number;
  allowGuestBooking: boolean;
  maintenanceMode: boolean;
  updatedAt: Date;
}


import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { updateSettings } from "@/actions/admin/settings";

const formSchema = z.object({
  siteName: z.string().min(2, "Tên trang web phải có ít nhất 2 ký tự"),
  siteLogo: z.string().optional(),
  contactEmail: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  openingTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Định dạng HH:mm"),
  closingTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Định dạng HH:mm"),
  minBookingDuration: z.number().min(30, "Tối thiểu 30 phút"),
  maxAdvanceDays: z.number().min(1).max(365),
  cancelBeforeHours: z.number().min(0),
  allowGuestBooking: z.boolean(),
  maintenanceMode: z.boolean(),
});

type SettingsFormValues = z.infer<typeof formSchema>;

interface SettingsFormProps {
  initialData: SystemSettings;
}

export const SettingsForm = ({ initialData }: SettingsFormProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      siteName: initialData.siteName || "",
      siteLogo: initialData.siteLogo || "",
      contactEmail: initialData.contactEmail || "",
      contactPhone: initialData.contactPhone || "",
      address: initialData.address || "",
      openingTime: initialData.openingTime || "06:00",
      closingTime: initialData.closingTime || "23:00",
      minBookingDuration: initialData.minBookingDuration || 60,
      maxAdvanceDays: initialData.maxAdvanceDays || 30,
      cancelBeforeHours: initialData.cancelBeforeHours || 24,
      allowGuestBooking: initialData.allowGuestBooking,
      maintenanceMode: initialData.maintenanceMode,
    },
  });

  const onSubmit = async (values: SettingsFormValues) => {
    try {
      setLoading(true);
      const res = await updateSettings(values);
      if (res.success) {
        toast.success("Cập nhật cài đặt thành công");
        router.refresh();
      } else {
        toast.error(res.error || "Có lỗi xảy ra");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-0.5">
                <h1 className="text-3xl font-bold tracking-tight">Cài đặt hệ thống</h1>
                <p className="text-slate-500">Quản lý cấu hình và các quy định của sân bóng.</p>
            </div>
            <Button type="submit" disabled={loading} className="gap-2 px-8 h-12 rounded-xl shadow-lg shadow-primary/20">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Lưu thay đổi
            </Button>
        </div>

        <Tabs defaultValue="general" className="w-full">
            <TabsList className="mb-8 bg-slate-100/50 p-1 rounded-xl h-auto flex flex-wrap justify-start">
                <TabsTrigger value="general" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Chung</TabsTrigger>
                <TabsTrigger value="booking" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Quy định đặt sân</TabsTrigger>
                <TabsTrigger value="contact" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Liên hệ</TabsTrigger>
                <TabsTrigger value="system" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Hệ thống</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <Card className="border-slate-100 shadow-sm overflow-hidden rounded-2xl">
                    <CardHeader className="bg-slate-50/50 border-b border-separate">
                        <CardTitle>Thông tin chung</CardTitle>
                        <CardDescription>Cấu hình tên thương hiệu và logo của trang web.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <FormField
                            control={form.control}
                            name="siteName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tên trang web</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ví dụ: Sport Arena" {...field} className="h-11 rounded-lg" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="siteLogo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>URL Logo</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://..." {...field} className="h-11 rounded-lg" />
                                    </FormControl>
                                    <FormDescription>Đường dẫn hình ảnh logo cho trang web.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="booking" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <Card className="border-slate-100 shadow-sm overflow-hidden rounded-2xl">
                    <CardHeader className="bg-slate-50/50 border-b border-separate">
                        <CardTitle>Quy định đặt sân</CardTitle>
                        <CardDescription>Cấu hình thời gian và chính sách đặt sân bóng.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8 pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="openingTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Giờ mở cửa</FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field} className="h-11 rounded-lg" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="closingTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Giờ đóng cửa</FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field} className="h-11 rounded-lg" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
                            <FormField
                                control={form.control}
                                name="minBookingDuration"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Thời lượng đặt tối thiểu (phút)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} className="h-11 rounded-lg" />
                                        </FormControl>
                                        <FormDescription>Khung giờ tối thiểu khách phải đặt (ví dụ: 60 phút).</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="maxAdvanceDays"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Đặt trước tối đa (ngày)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} className="h-11 rounded-lg" />
                                        </FormControl>
                                        <FormDescription>Số ngày tối đa khách có thể đặt trước.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="cancelBeforeHours"
                            render={({ field }) => (
                                <FormItem className="border-t pt-6">
                                    <FormLabel>Hủy trước (giờ)</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} className="h-11 rounded-lg" />
                                    </FormControl>
                                    <FormDescription>Thời gian tối thiểu để khách có thể tự hủy đơn mà không mất cọc.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="contact" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <Card className="border-slate-100 shadow-sm overflow-hidden rounded-2xl">
                    <CardHeader className="bg-slate-50/50 border-b border-separate">
                        <CardTitle>Thông tin liên hệ</CardTitle>
                        <CardDescription>Thông tin hiển thị ở chân trang và trang liên hệ.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <FormField
                            control={form.control}
                            name="contactEmail"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email liên hệ</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="admin@sportarena.com" {...field} className="h-11 rounded-lg" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="contactPhone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Số điện thoại</FormLabel>
                                    <FormControl>
                                        <Input placeholder="0123 456 789" {...field} className="h-11 rounded-lg" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Địa chỉ trụ sở</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Số 123, Đường A, TP. Hà Nội" {...field} className="h-11 rounded-lg" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="system" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <Card className="border-slate-100 shadow-sm overflow-hidden rounded-2xl">
                    <CardHeader className="bg-slate-50/50 border-b border-separate">
                        <CardTitle>Cài đặt nâng cao</CardTitle>
                        <CardDescription>Các cấu hình kỹ thuật của hệ thống.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <FormField
                            control={form.control}
                            name="allowGuestBooking"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-2xl border border-slate-100 p-6 hover:bg-slate-50/30 transition-colors">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel className="font-semibold text-slate-900">Cho phép đặt sân không cần đăng nhập</FormLabel>
                                        <FormDescription>Khách vãng lai có thể đặt sân chỉ với email và số điện thoại.</FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="maintenanceMode"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-2xl border border-orange-100 p-6 bg-orange-50/30 hover:bg-orange-50/50 transition-colors">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel className="text-orange-900 font-bold">Chế độ bảo trì</FormLabel>
                                        <FormDescription className="text-orange-700">Tạm dừng nhận đơn đặt sân trên toàn hệ thống để nâng cấp hoặc sửa chữa.</FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
};
