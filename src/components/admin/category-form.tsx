"use client";

import * as z from "zod";
import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { 
  Loader2, 
  ArrowLeft, 
  LayoutList, 
  DollarSign, 
  Users, 
  Type,
  CheckSquare, 
  MapPin       
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { createCategory, updateCategory } from "@/actions/admin/categories";

import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox"; 
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; 
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  name: z.string().min(1, "Bắt buộc nhập tên"),
  locationId: z.string().min(1, "Vui lòng chọn vị trí"), 
  description: z.string().optional(),
  basePrice: z.coerce.number().min(0),
  capacity: z.coerce.number().min(1),
  amenities: z.array(z.string()).optional(), 
});

type FormValues = z.infer<typeof formSchema>;

interface CategoryFormProps {
  initialData?: {
    id: string;
    name: string;
    locationId: string; 
    description: string | null;
    basePrice: number;
    capacity: number;
    amenities?: { id: string }[]; 
  } | null;
  amenityOptions: { id: string; name: string }[]; 
  locationOptions: { id: string; name: string }[];
}

export const CategoryForm = ({ 
  initialData, 
  amenityOptions = [], 
  locationOptions = [] 
}: CategoryFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const title = initialData ? "Cập nhật loại phòng" : "Tạo loại phòng mới";
  const description = initialData ? "Chỉnh sửa thông tin chi tiết và giá." : "Thêm hạng phòng mới vào hệ thống.";
  const action = initialData ? "Lưu thay đổi" : "Tạo mới";

  // --- CHUẨN HÓA DỮ LIỆU ĐẦU VÀO ---
  const defaultValues = initialData ? {
    name: initialData.name,
    locationId: initialData.locationId || "", // Đảm bảo không null
    description: initialData.description || "",
    basePrice: Number(initialData.basePrice),
    capacity: initialData.capacity,
    amenities: initialData.amenities?.map((item) => item.id) || [],
  } : {
    name: "",
    locationId: "", 
    description: "",
    basePrice: 0,
    capacity: 2,
    amenities: [],
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues, // Sử dụng biến defaultValues đã chuẩn hóa ở trên
  });

  // Reset form nếu initialData thay đổi (trường hợp load lại trang hoặc chuyển trang nhanh)
  useEffect(() => {
    if (initialData) {
        form.reset(defaultValues);
    }
  }, [initialData]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = (values: FormValues) => {
    startTransition(() => {
      if (initialData) {
        updateCategory(initialData.id, values).then((data) => {
          if (data.error) toast.error(data.error);
          if (data.success) {
            toast.success(data.success);
            router.refresh();
            router.push("/admin/categories");
          }
        });
      } else {
        createCategory(values).then((data) => {
          if (data.error) toast.error(data.error);
          if (data.success) {
            toast.success(data.success);
            router.refresh();
            router.push("/admin/categories");
          }
        });
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
            <div className="flex items-center gap-2">
                <Link href="/admin/categories">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            </div>
            <p className="text-sm text-muted-foreground pl-10">{description}</p>
        </div>
        
        <div className="flex items-center gap-2">
            <Link href="/admin/categories">
                <Button variant="outline" type="button" disabled={isPending}>
                    Hủy bỏ
                </Button>
            </Link>
            <Button disabled={isPending} onClick={form.handleSubmit(onSubmit)}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {action}
            </Button>
        </div>
      </div>
      
      <Separator />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <LayoutList className="h-5 w-5 text-primary" />
                                Thông tin chung
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tên loại phòng</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Type className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input disabled={isPending} placeholder="VD: Deluxe Ocean View..." className="pl-9" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />

                            {/* --- FIELD LOCATION (ĐÃ SỬA) --- */}
                            <FormField
                                control={form.control}
                                name="locationId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Vị trí / Khu vực</FormLabel>
                                        <Select 
                                            disabled={isPending} 
                                            onValueChange={field.onChange} 
                                            value={field.value} // Chỉ dùng value, KHÔNG dùng defaultValue
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                                        <SelectValue placeholder="Chọn vị trí của loại phòng" />
                                                    </div>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {locationOptions.map((location) => (
                                                    <SelectItem key={location.id} value={location.id}>
                                                        {location.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mô tả chi tiết</FormLabel>
                                    <FormControl>
                                        <Textarea disabled={isPending} className="min-h-[120px] resize-y" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* --- FIELD AMENITIES (ĐÃ SỬA) --- */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <CheckSquare className="h-5 w-5 text-primary" />
                                Tiện nghi phòng
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <FormField
                                control={form.control}
                                name="amenities"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="grid grid-cols-2 gap-4">
                                            {amenityOptions.map((item) => (
                                                <FormItem
                                                    key={item.id}
                                                    className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm hover:bg-accent/50 transition cursor-pointer"
                                                >
                                                    <FormControl>
                                                        <Checkbox
                                                            // Logic an toàn: (field.value || [])
                                                            checked={(field.value || []).includes(item.id)}
                                                            onCheckedChange={(checked) => {
                                                                return checked
                                                                    ? field.onChange([...(field.value || []), item.id])
                                                                    : field.onChange(
                                                                        (field.value || []).filter(
                                                                            (value) => value !== item.id
                                                                        )
                                                                    )
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="font-normal cursor-pointer w-full select-none">
                                                        {item.name}
                                                    </FormLabel>
                                                </FormItem>
                                            ))}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Thiết lập</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormField
                                control={form.control}
                                name="basePrice"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Giá cơ bản (1 đêm)</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input type="number" disabled={isPending} className="pl-9 pr-12" {...field} />
                                            <div className="absolute right-3 top-2.5 text-sm font-medium text-muted-foreground pointer-events-none">
                                                VNĐ
                                            </div>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="capacity"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sức chứa tối đa</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Users className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input type="number" disabled={isPending} className="pl-9" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="md:hidden">
                <Button disabled={isPending} className="w-full" type="submit">
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {action}
                </Button>
            </div>
        </form>
      </Form>
    </div>
  );
};