"use client";

import { useState, useTransition } from "react";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitInquiry } from "@/actions/client/contact";

export const ContactForm = () => {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Vui lòng điền đầy đủ các thông tin bắt buộc.");
      return;
    }

    startTransition(async () => {
        const res = await submitInquiry(formData);
        
        if (res.error) {
            toast.error(res.error);
        }

        if (res.success) {
            toast.success(res.success);
            setFormData({
                name: "",
                email: "",
                phone: "",
                subject: "",
                message: "",
            });
        }
    });
  };

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Họ và tên <span className="text-red-500">*</span></label>
          <Input 
            id="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nhập họ tên của bạn" 
            className="bg-sky-50/50 border-sky-100 focus:ring-sky-200 focus:border-sky-400" 
            required
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Email <span className="text-red-500">*</span></label>
          <Input 
            id="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="email@example.com" 
            className="bg-sky-50/50 border-sky-100 focus:ring-sky-200 focus:border-sky-400" 
            required
            disabled={isPending}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Số điện thoại</label>
          <Input 
            id="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="0912..." 
            className="bg-sky-50/50 border-sky-100 focus:ring-sky-200 focus:border-sky-400" 
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Chủ đề</label>
          <Input 
            id="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Ví dụ: Hỏi thuê sân dài hạn, tổ chức giải đấu..." 
            className="bg-sky-50/50 border-sky-100 focus:ring-sky-200 focus:border-sky-400" 
            disabled={isPending}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Nội dung yêu cầu <span className="text-red-500">*</span></label>
        <Textarea 
          id="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Chi tiết yêu cầu của bạn..." 
          className="min-h-[150px] bg-sky-50/50 border-sky-100 resize-none focus:ring-sky-200 focus:border-sky-400" 
          required
          disabled={isPending}
        />
      </div>

      <div className="flex justify-end">
        <Button 
          type="submit" 
          size="lg" 
          className="w-full md:w-auto bg-sky-500 hover:bg-sky-600 shadow-lg shadow-sky-200"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang gửi...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" /> Gửi tin nhắn
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
