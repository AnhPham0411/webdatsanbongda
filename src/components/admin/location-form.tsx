"use client";

import * as z from "zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2, Save, ArrowLeft, MapPin, ImageIcon, FileText } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { createLocation, updateLocation } from "@/actions/admin/locations";

import { Button } from "@/components/ui/button";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  name: z.string().min(1, "Tên không được để trống"),
  address: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface LocationFormProps {
  initialData?: {
    id: string;
    name: string;
    address: string | null;
    description: string | null;
    imageUrl: string | null;
  } | null;
}

export const LocationForm = ({ initialData }: LocationFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const title = initialData ? "Cập nhật chi nhánh" : "Thêm chi nhánh mới";
  const description = initialData ? "Chỉnh sửa thông tin khách sạn/chi nhánh." : "Tạo mới một địa điểm kinh doanh.";
  const action = initialData ? "Lưu thay đổi" : "Tạo mới";

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      address: "",
      description: "",
      imageUrl: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(() => {
      if (initialData) {
        updateLocation(initialData.id, values).then((data) => {
          if (data.error) toast.error(data.error);
          if (data.success) {
            toast.success(data.success);
            router.refresh();
            router.push("/admin/locations");
          }
        });
      } else {
        createLocation(values).then((data) => {
          if (data.error) toast.error(data.error);
          if (data.success) {
            toast.success(data.success);
            router.refresh();
            router.push("/admin/locations");
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
                <Link href="/admin/locations">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            </div>
            <p className="text-sm text-muted-foreground pl-10">{description}</p>
        </div>
        <Button disabled={isPending} onClick={form.handleSubmit(onSubmit)}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {action}
        </Button>
      </div>
      
      <Separator />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        Thông tin địa điểm
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tên Chi nhánh / Khách sạn</FormLabel>
                            <FormControl>
                                <Input disabled={isPending} placeholder="VD: Ha Long Pearl Hotel" {...field} />
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
                            <FormLabel>Địa chỉ</FormLabel>
                            <FormControl>
                                <Input disabled={isPending} placeholder="VD: 123 Đường Hạ Long..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="imageUrl"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex items-center gap-1">
                                <ImageIcon className="h-4 w-4" /> Link Ảnh đại diện
                            </FormLabel>
                            <FormControl>
                                <Input disabled={isPending} placeholder="https://..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex items-center gap-1">
                                <FileText className="h-4 w-4" /> Giới thiệu
                            </FormLabel>
                            <FormControl>
                                <Textarea 
                                    disabled={isPending} 
                                    placeholder="Mô tả về chi nhánh này..." 
                                    className="min-h-[100px]"
                                    {...field} 
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </CardContent>
            </Card>
        </form>
      </Form>
    </div>
  );
};