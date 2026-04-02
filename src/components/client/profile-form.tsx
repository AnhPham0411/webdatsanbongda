"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

// 👇 Kiểm tra đường dẫn import action này chính xác với cấu trúc folder của bạn
import { updateProfile } from "@/actions/client/profile"; 

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Schema Validation
const ProfileSchema = z.object({
  name: z.string().min(1, "Tên không được để trống"),
  // 👇 QUAN TRỌNG: Cho phép Optional HOẶC chuỗi rỗng ""
  phone: z.string().optional().or(z.literal("")),
});

interface ProfileFormProps {
  user: {
    name: string | null;
    phone: string | null;
  };
}

const ProfileForm = ({ user }: ProfileFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof ProfileSchema>>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      name: user.name || "",
      // 👇 QUAN TRỌNG: Nếu null thì convert sang "" để input không bị lỗi
      phone: user.phone ?? "",
    },
  });

  const onSubmit = (values: z.infer<typeof ProfileSchema>) => {
    startTransition(() => {
      updateProfile(values)
        .then((data) => {
          if (data.error) {
            toast.error(data.error);
          } 
          if (data.success) {
            toast.success("Cập nhật thành công!");
            router.refresh(); // Làm mới UI
          }
        })
        .catch(() => toast.error("Đã có lỗi xảy ra!"));
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên hiển thị</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Nhập tên..." disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số điện thoại</FormLabel>
                <FormControl>
                  {/* type="tel" giúp bàn phím điện thoại hiện số */}
                  <Input 
                    {...field} 
                    placeholder="0912..." 
                    type="tel" 
                    disabled={isPending} 
                  />
</FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Lưu thay đổi
            </>
          )}
        </Button>
      </form>
    </Form>
  );
};

export default ProfileForm;