"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useSearchParams } from "next/navigation";

import { LoginSchema } from "@/schemas"; 
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { login } from "@/actions/auth"; 
import { Loader2, Lock, Mail } from "lucide-react"; 
import { toast } from "sonner"; 

export const LoginForm = () => {
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error") === "OAuthAccountNotLinked"
    ? "Email này đã được sử dụng bởi phương thức đăng nhập khác!"
    : "";

  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    startTransition(() => {
      login(values)
        .then((data) => {
          if (data?.error) {
            form.reset({ ...values, password: "" }); 
            toast.error(data.error); 
          }
          
          if (data?.success) {
            form.reset();
            toast.success("Xác thực thành công! Đang chuyển hướng..."); 

            // Sử dụng window.location.href để ép trình duyệt nhận Cookie mới
            // Ngăn chặn lỗi Middleware đá Staff về trang chủ (/)
            if (data?.role === "ADMIN" || data?.role === "STAFF") {
                window.location.href = "/admin";
            } else {
                window.location.href = "/";
            }
          }
        })
        .catch(() => toast.error("Đã có lỗi hệ thống xảy ra!"));
    });
  };

  return (
    <div className="w-full max-w-[400px] shadow-2xl p-8 bg-white rounded-2xl border border-slate-100">
        <div className="flex flex-col space-y-2 text-center mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Hotel Portal
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              Vui lòng đăng nhập để tiếp tục quản trị
            </p>
        </div>
        
        {urlError && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-md text-sm flex items-center">
             {urlError}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold">Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                        <Input
                          {...field}
                          disabled={isPending}
                          placeholder="admin@hotel.com"
                          type="email"
                          className="pl-10 h-11 border-slate-200 focus:border-sky-500 focus:ring-sky-500 transition-all"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold">Mật khẩu</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                        <Input
                          {...field}
                          disabled={isPending}
                          placeholder="••••••••"
                          type="password"
                          className="pl-10 h-11 border-slate-200 focus:border-sky-500 focus:ring-sky-500 transition-all"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Button 
              disabled={isPending} 
              type="submit" 
              className="w-full h-12 text-base font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg shadow-slate-200 transition-all active:scale-[0.98]"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Đăng nhập hệ thống"
              )}
            </Button>
          </form>
        </Form>
    </div>
  );
};