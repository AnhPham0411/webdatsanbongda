"use client";

import * as z from "zod";
import { useState, useTransition, useRef } from "react"; // Thêm useRef
import { useForm, useFieldArray } from "react-hook-form"; // Dùng lại useFieldArray
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Room, RoomImage } from "@prisma/client"; 
import { Trash, Loader2, Plus, X, MapPin, ImagePlus, Upload } from "lucide-react"; // Thêm icon
import { toast } from "sonner";

import { createRoom, updateRoom, deleteRoom } from "@/actions/admin/rooms";
// Import Server Action upload local
import { uploadImageLocal } from "@/actions/admin/upload"; 

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

const formSchema = z.object({
  name: z.string().min(1, "Tên phòng là bắt buộc"),
  roomTypeId: z.string().min(1, "Vui lòng chọn loại phòng"),
  isAvailable: z.boolean().default(true),
  images: z.object({ url: z.string().min(1, "Link ảnh không được để trống") }).array(),
});

type RoomFormValues = z.infer<typeof formSchema>;

interface RoomFormProps {
  initialData: (Room & { images: RoomImage[] }) | null;
  roomTypes: {
    id: string;
    name: string;
    hotelName: string;
    basePrice: number;
    capacity: number;
  }[];
}

export const RoomForm = ({ initialData, roomTypes }: RoomFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false); // State loading riêng cho upload
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref để kích hoạt input file ẩn

  const title = initialData ? "Chỉnh sửa phòng" : "Tạo phòng mới";
  const action = initialData ? "Lưu thay đổi" : "Tạo mới";

  const form = useForm<RoomFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      ...initialData,
      images: initialData.images || [], 
    } : {
      name: "",
      roomTypeId: "",
      isAvailable: true,
      images: [],
    },
  });

  // Quản lý mảng images
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "images",
  });

  // --- XỬ LÝ UPLOAD LOCAL ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    
    // Duyệt qua từng file được chọn (hỗ trợ chọn nhiều ảnh 1 lúc)
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        // Gọi Server Action
        const res = await uploadImageLocal(formData);

        if (res.error) {
            toast.error(`Lỗi upload ảnh ${file.name}: ${res.error}`);
        } else if (res.success) {
            // ✅ Upload thành công -> Thêm URL vào danh sách form
            append({ url: res.success });
            toast.success(`Đã tải lên: ${file.name}`);
        }
    }

    setIsUploading(false);
    // Reset input để chọn lại được file cũ nếu muốn
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const onSubmit = (data: RoomFormValues) => {
    startTransition(() => {
      if (initialData) {
        updateRoom(initialData.id, data).then((res) => {
          if (res.error) toast.error(res.error);
          if (res.success) {
            toast.success(res.success);
            router.refresh();
            router.push(`/admin/rooms`);
          }
        });
      } else {
        createRoom(data).then((res) => {
          if (res.error) toast.error(res.error);
          if (res.success) {
            toast.success(res.success);
            router.refresh();
            router.push(`/admin/rooms`);
          }
        });
      }
    });
  };

  const onDelete = () => {
    if (!initialData) return;
    startTransition(() => {
        deleteRoom(initialData.id).then((res) => {
           if (res.error) toast.error(res.error);
           if (res.success) {
              toast.success("Đã xóa phòng");
              router.refresh();
              router.push("/admin/rooms");
           }
        });
    });
  };

  const formatVND = (price: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const groupedTypes = roomTypes.reduce((acc, type) => {
    const hotel = type.hotelName || "Khác";
    if (!acc[hotel]) acc[hotel] = [];
    acc[hotel].push(type);
    return acc;
  }, {} as Record<string, typeof roomTypes>);

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
          <p className="text-sm text-muted-foreground">
             {initialData ? "Cập nhật thông tin phòng." : "Thêm phòng mới vào hệ thống."}
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
                <FormLabel className="text-lg font-semibold">Hình ảnh phòng</FormLabel>
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
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded overflow-hidden border">
                                                    <img src={field.value} alt="Preview" className="w-full h-full object-cover" 
                                                        onError={(e) => e.currentTarget.style.display = 'none'} 
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
                  <FormLabel>Tên phòng (Số phòng)</FormLabel>
                  <FormControl>
                    <Input disabled={isPending} placeholder="VD: P-101, Villa A2..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="roomTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loại phòng (Thuộc chi nhánh)</FormLabel>
                  <Select
                    disabled={isPending}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại phòng" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(groupedTypes).map(([hotelName, types]) => (
                         <SelectGroup key={hotelName}>
                             <SelectLabel className="flex items-center gap-1 text-blue-600 bg-blue-50 py-1.5 pl-2">
                                <MapPin className="h-3.5 w-3.5" />
                                {hotelName}
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
                    <FormLabel className="text-base">Trạng thái phòng</FormLabel>
                    <FormDescription>
                      Bật nếu phòng sẵn sàng đón khách.
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