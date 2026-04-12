"use client";

import { useState, useTransition } from "react";
import { Send, Loader2, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { replyToInquiry } from "@/actions/client/contact";

interface InquiryReplyFormProps {
  inquiryId: string;
  initialReply?: string | null;
}

export const InquiryReplyForm = ({ inquiryId, initialReply }: InquiryReplyFormProps) => {
  const [reply, setReply] = useState(initialReply || "");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleReply = () => {
    if (!reply.trim()) {
      toast.error("Vui lòng nhập nội dung phản hồi.");
      return;
    }

    startTransition(async () => {
      const res = await replyToInquiry(inquiryId, reply);
      if (res.error) {
        toast.error(res.error);
      }
      if (res.success) {
        toast.success(res.success);
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid w-full gap-1.5">
        <label className="text-sm font-semibold text-slate-900">Nội dung phản hồi</label>
        <p className="text-xs text-slate-500 mb-2 italic">
          Nội dung này sẽ được gửi trực tiếp đến Gmail của khách hàng.
        </p>
        <Textarea
          placeholder="Viết nội dung phản hồi tại đây..."
          className="min-h-[200px] border-blue-100 focus-visible:ring-blue-500 text-base"
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          disabled={isPending}
        />
      </div>
      <div className="flex justify-end gap-3">
        <Button 
            variant="outline" 
            onClick={() => router.back()}
            disabled={isPending}
        >
            <Undo2 className="mr-2 h-4 w-4" /> Quay lại
        </Button>
        <Button 
            onClick={handleReply} 
            disabled={isPending}
            className="bg-blue-600 hover:bg-blue-700"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang gửi...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" /> Gửi phản hồi ngay
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
