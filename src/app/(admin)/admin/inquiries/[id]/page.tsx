import { db } from "@/lib/db";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { notFound } from "next/navigation";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MessageSquare,
  CheckCircle2,
  Clock,
  Send
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { InquiryReplyForm } from "@/components/admin/inquiry-reply-form";

interface InquiryDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function InquiryDetailPage(props: InquiryDetailPageProps) {
  const { id } = await props.params;
  
  const inquiry = await db.inquiry.findUnique({
    where: { id },
  });

  if (!inquiry) return notFound();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Chi tiết yêu cầu</h2>
          <p className="text-muted-foreground">Phản hồi và hỗ trợ thắc mắc của khách hàng.</p>
        </div>
        <div>
            {inquiry.status === "REPLIED" ? (
                <Badge className="bg-emerald-500 py-1.5 px-3 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> Đã phản hồi
                </Badge>
            ) : (
                <Badge variant="destructive" className="py-1.5 px-3 flex items-center gap-1.5">
                    <Clock className="h-4 w-4" /> Đang chờ xử lý
                </Badge>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* THÔNG TIN KHÁCH HÀNG */}
        <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-sm border-slate-200">
                <CardHeader>
                    <CardTitle className="text-lg">Thông tin khách hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                        <User className="h-5 w-5 text-slate-400 mt-0.5" />
                        <div>
                            <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Họ và tên</p>
                            <p className="font-semibold text-slate-900">{inquiry.name}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Mail className="h-5 w-5 text-slate-400 mt-0.5" />
                        <div>
                            <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Email</p>
                            <p className="text-blue-600 font-medium">{inquiry.email}</p>
                        </div>
                    </div>
                    {inquiry.phone && (
                        <div className="flex items-start gap-3">
                            <Phone className="h-5 w-5 text-slate-400 mt-0.5" />
                            <div>
                                <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Số điện thoại</p>
                                <p className="font-medium text-slate-900">{inquiry.phone}</p>
                            </div>
                        </div>
                    )}
                    <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                        <div>
                            <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">Thời gian gửi</p>
                            <p className="text-slate-700">
                                {format(inquiry.createdAt, "dd/MM/yyyy HH:mm", { locale: vi })}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* NỘI DUNG YÊU CẦU & FORM PHẢN HỒI */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50 border-b">
                <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="h-5 w-5 text-slate-500" />
                    <CardTitle className="text-lg">Thắc mắc của khách hàng</CardTitle>
                </div>
                <CardDescription className="text-slate-900 font-bold text-lg mt-2">
                    {inquiry.subject || "Yêu cầu hỗ trợ mới"}
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="bg-blue-50/30 border border-blue-100 rounded-xl p-5 relative">
                <div className="absolute top-4 right-4 text-blue-200">
                    <MessageSquare className="h-10 w-10 rotate-12" />
                </div>
                <p className="text-slate-800 leading-relaxed whitespace-pre-wrap relative z-10">
                    {inquiry.message}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md border-blue-100 overflow-hidden">
            <CardHeader className="bg-blue-600 text-white">
                <CardTitle className="text-lg flex items-center gap-2 text-white">
                    <Send className="h-5 w-5 text-white" /> {inquiry.status === "REPLIED" ? "Cập nhật phản hồi" : "Phản hồi yêu cầu"}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <InquiryReplyForm 
                inquiryId={inquiry.id} 
                initialReply={inquiry.adminReply} 
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
