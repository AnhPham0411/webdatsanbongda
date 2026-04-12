import { db } from "@/lib/db";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Link from "next/link";
import { 
  Mail, 
  MessageSquare, 
  Clock, 
  ChevronRight, 
  SearchX,
  Trash2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DeleteInquiryButton } from "@/components/admin/delete-inquiry-button";

export default async function adminInquiriesPage() {
  const inquiries = await db.inquiry.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Yêu cầu hỗ trợ</h2>
          <p className="text-muted-foreground">
            Quản lý và phản hồi các thắc mắc từ khách hàng qua form liên hệ.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách yêu cầu</CardTitle>
          <CardDescription>
            Tất cả các tin nhắn gửi từ trang Liên hệ.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {inquiries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <SearchX className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="font-semibold text-lg text-slate-900">Chưa có yêu cầu nào</h3>
              <p className="text-slate-500 max-w-xs mx-auto mt-2">
                Khi khách hàng gửi form liên hệ, các yêu cầu sẽ xuất hiện tại đây.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Chủ đề</TableHead>
                  <TableHead>Ngày gửi</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inquiries.map((inquiry: any) => (
                  <TableRow key={inquiry.id} className="group">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900">{inquiry.name}</span>
                        <span className="text-xs text-slate-500">{inquiry.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="block max-w-[200px] truncate">
                        {inquiry.subject || "Không có tiêu đề"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600">
                        {format(inquiry.createdAt, "dd/MM/yyyy HH:mm", { locale: vi })}
                      </span>
                    </TableCell>
                    <TableCell>
                      {inquiry.status === "NEW" ? (
                        <Badge variant="destructive" className="flex w-fit items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> Mới
                        </Badge>
                      ) : inquiry.status === "REPLIED" ? (
                        <Badge className="bg-emerald-500 hover:bg-emerald-600 flex w-fit items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Đã phản hồi
                        </Badge>
                      ) : (
                        <Badge variant="outline">Lưu trữ</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {inquiry.status === "REPLIED" && (
                        <DeleteInquiryButton id={inquiry.id} />
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                        <Link href={`/admin/inquiries/${inquiry.id}`}>
                            <Button variant="ghost" size="sm" className="group-hover:text-blue-600">
                                Chi tiết <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                        </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
