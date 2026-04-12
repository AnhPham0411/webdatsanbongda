/**
 * @file court-form.tsx
 * @description Thành phần Form dùng để tạo mới hoặc cập nhật thông tin sân bóng.
 * Sử dụng React Hook Form kết hợp với Zod để validation dữ liệu.
 * Hỗ trợ tải lên hình ảnh lên server cục bộ hoặc dùng URL từ bên ngoài.
 */
"use client";

import * as z from "zod";
import { useState, useTransition, useRef } from "react"; // Thêm useRef
import { useForm, useFieldArray, SubmitHandler } from "react-hook-form"; // Dùng lại useFieldArray
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Court, CourtImage } from "@prisma/client"; 
import { Trash, Loader2, Plus, X, MapPin, ImagePlus, Upload } from "lucide-react"; // Thêm icon
import { toast } from "sonner";

import { createCourt, updateCourt, deleteCourt } from "@/actions/admin/courts";
// Import Server Action upload local
import { uploadImageLocal } from "@/actions/admin/upload"; 
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

/**
 * Schema định nghĩa cấu trúc dữ liệu và quy tắc validation cho form.
 * Sử dụng thư viện Zod.
 */
const formSchema = z.object({
  name: z.string().min(1, "Tên sân là bắt buộc"),
  courtTypeId: z.string().min(1, "Vui lòng chọn hạng sân"),
  isAvailable: z.boolean(),
  images: z.array(z.object({
    url: z.string().min(1, "Link ảnh không được để trống")
  })),
});

type CourtFormValues = z.infer<typeof formSchema>;

interface CourtFormProps {
  initialData: (Court & { images: CourtImage[] }) | null;
  courtTypes: {
    id: string;
    name: string;
    locationName: string;
    basePrice: number;
    capacity: number;
  }[];
}

/**
 * Component chính cho form quản lý sân bóng.
 */
export const CourtForm = ({ initialData, courtTypes }: CourtFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false); // State loading riêng cho upload
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref để kích hoạt input file ẩn

  const title = initialData ? "Chỉnh sửa sân" : "Tạo sân mới";
  const action = initialData ? "Lưu thay đổi" : "Tạo mới";

  // Khởi tạo form với các giá trị mặc định dựa trên initialData (nếu có)
  const form = useForm<CourtFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      courtTypeId: initialData.courtTypeId,
      isAvailable: !!initialData.isAvailable,
      images: initialData.images.map(img => ({ url: img.url })),
    } : {
      name: "",
      courtTypeId: "",
      isAvailable: true,
      images: [],
    },
  });

  /**
   * Quản lý mảng dynamic (danh sách ảnh).
   * Cho phép thêm/xóa ảnh linh hoạt.
   */
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "images",
  });

  /**
   * Xử lý tải ảnh lên server cục bộ.
   * Chuyển đổi file thành FormData và gửi qua Server Action uploadImageLocal.
   */
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    
    // Duyệt qua từng file được chọn (hỗ trợ chọn nhiều ảnh cùng lúc)
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        // Gọi Server Action để lưu file vào thư mục public/uploads
        const res = await uploadImageLocal(formData);

        if (res.error) {
            toast.error(`Lỗi upload ảnh ${file.name}: ${res.error}`);
        } else if (res.success) {
            // ✅ Upload thành công -> Thêm đường dẫn file vào danh sách ảnh của form
            append({ url: res.success });
            toast.success(`Đã tải lên: ${file.name}`);
        }
    }

    setIsUploading(false);
    // Reset giá trị input file để có thể chọn lại file cùng tên nếu cần
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  /**
   * Xử lý gửi form (Submit).
   * Phân biệt giữa tạo mới và cập nhật sân dựa trên presence của initialData.
   */
  const onSubmit = async (data: CourtFormValues) => {
    startTransition(() => {
      if (initialData) {
        // Cập nhật sân hiện tại
        updateCourt(initialData.id, data).then((res) => {
          if (res.error) toast.error(res.error);
          if (res.success) {
            toast.success(res.success);
            router.refresh();
            router.push(`/admin/courts`);
          }
        });
      } else {
        // Tạo sân mới
        createCourt(data).then((res) => {
          if (res.error) toast.error(res.error);
          if (res.success) {
            toast.success(res.success);
            router.refresh();
            router.push(`/admin/courts`);
          }
        });
      }
    });
  };

  const onDelete = () => {
    if (!initialData) return;
    startTransition(() => {
        deleteCourt(initialData.id).then((res) => {
           if (res.error) toast.error(res.error);
           if (res.success) {
              toast.success("Đã xóa sân");
              router.refresh();
              router.push("/admin/courts");
           }
        });
    });
  };

  const formatVND = (price: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const groupedTypes = courtTypes.reduce((acc, type) => {
    const location = type.locationName || "Khác";
    if (!acc[location]) acc[location] = [];
    acc[location].push(type);
    return acc;
  }, {} as Record<string, typeof courtTypes>);

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
          <p className="text-sm text-muted-foreground">
             {initialData ? "Cập nhật thông tin sân." : "Thêm sân mới vào hệ thống."}
          </p>
        </div>
        {initialData && (
          <Button
            disabled={isPending}
            variant="destructive"
            size="icon"
            onClick={onDelete}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator className="my-4" />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
          
          {/* --- PHẦN HÌNH ẢNH (HYBRID: URL + UPLOAD) --- */}
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <FormLabel className="text-lg font-semibold">Hình ảnh sân bóng</FormLabel>
                {/* Input File Ẩn */}
                <input 
                    type="file" 
                    multiple // Cho phép chọn nhiều ảnh
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    disabled={isPending || isUploading}
                />
             </div>
             
             {/* Danh sách các ô Input URL */}
             <div className="flex flex-col gap-3">
                {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2 items-center">
                        <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
                        <FormField
                            control={form.control}
                            name={`images.${index}.url`}
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormControl>
                                        <div className="relative">
                                            <Input {...field} disabled={isPending} placeholder="https://... hoặc /uploads/..." />
                                            {/* Preview ảnh nhỏ nếu link hợp lệ */}
                                            {field.value && (
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded overflow-hidden border relative">
                                                    <Image 
                                                        src={field.value} 
                                                        alt="Preview" 
                                                        fill
                                                        className="object-cover" 
                                                        unoptimized
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="button" variant="outline" size="icon" onClick={() => remove(index)}>
                            <X className="h-4 w-4 text-red-500" />
                        </Button>
                    </div>
                ))}
             </div>
             
             {/* Các nút bấm hành động */}
             <div className="flex gap-3">
                {/* Nút 1: Thêm dòng nhập link thủ công */}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ url: "" })}
                    disabled={isPending}
                >
                    <Plus className="mr-2 h-4 w-4" /> Nhập link ảnh
                </Button>

                {/* Nút 2: Upload từ máy */}
                <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()} // Kích hoạt input file ẩn
                    disabled={isPending || isUploading}
                    className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
                >
                    {isUploading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Upload className="mr-2 h-4 w-4" />
                    )}
                    {isUploading ? "Đang tải lên..." : "Tải ảnh từ máy"}
                </Button>
             </div>
             
             <FormDescription>
                Bạn có thể nhập link ảnh từ internet hoặc tải ảnh từ máy tính (ảnh sẽ được lưu vào server).
             </FormDescription>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên sân (Số sân)</FormLabel>
                  <FormControl>
                    <Input disabled={isPending} placeholder="VD: Sân 1, Sân 5 người A..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="courtTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hạng sân (Khu vực / Hệ thống)</FormLabel>
                  <Select
                    disabled={isPending}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn hạng sân" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(groupedTypes).map(([locationName, types]) => (
                         <SelectGroup key={locationName}>
                             <SelectLabel className="flex items-center gap-1 text-blue-600 bg-blue-50 py-1.5 pl-2">
                                <MapPin className="h-3.5 w-3.5" />
                                {locationName}
                             </SelectLabel>
                             {types.map((type) => (
                                <SelectItem key={type.id} value={type.id} className="pl-6">
                                    <span className="font-medium">{type.name}</span>
                                    <span className="text-muted-foreground text-xs ml-2">
                                        ({type.capacity} người - {formatVND(type.basePrice)})
                                    </span>
                                </SelectItem>
                             ))}
                             <Separator className="my-1" />
                         </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="isAvailable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-white">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Trạng thái sân</FormLabel>
                    <FormDescription>
                      Bật nếu sân sẵn sàng đón khách.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <Button disabled={isPending} type="submit" className="ml-auto">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};