"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// 1. Thay Sheet bằng Dialog
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog"; 
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus, Mail, Edit, Trash2, Power } from "lucide-react";
import { toast } from "sonner";
import { VoucherForm } from "./voucher-form";
import { deleteVoucher, toggleVoucherStatus, sendVoucherToUsers } from "@/actions/admin/voucher"; // Nhớ import đúng hàm sendVoucherToUsers

export const VoucherClient = ({ data }: { data: any[] }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);

  // Hàm mở Modal tạo mới
  const onOpenCreate = () => {
    setSelectedVoucher(null);
    setIsOpen(true);
  };

  // Hàm mở Modal sửa
  const onOpenEdit = (voucher: any) => {
    setSelectedVoucher(voucher);
    setIsOpen(true);
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={onOpenCreate} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" /> Tạo mã mới
        </Button>
      </div>

      <div className="border rounded-md bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Mã Code</TableHead>
              <TableHead>Giảm giá</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((v) => (
              <TableRow key={v.id}>
                <TableCell className="font-bold font-mono text-blue-700">{v.code}</TableCell>
                <TableCell>
                  {v.discountType === "PERCENT" ? (
                    <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">
                      {v.discountValue}%
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                      {Number(v.discountValue).toLocaleString()}đ
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge className={v.isActive ? "bg-emerald-500 hover:bg-emerald-600" : "bg-slate-400"}>
                    {v.isActive ? "Đang chạy" : "Đã tắt"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => toast.promise(sendVoucherToUsers(v.id), { loading: "Đang gửi...", success: (r) => r.success || "Xong", error: "Lỗi" })}>
                        <Mail className="mr-2 h-4 w-4" /> Gửi Email
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onOpenEdit(v)}>
                        <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleVoucherStatus(v.id, v.isActive).then(() => router.refresh())}>
                        <Power className="mr-2 h-4 w-4" /> {v.isActive ? "Tắt mã" : "Kích hoạt"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => confirm("Xóa vĩnh viễn mã này?") && deleteVoucher(v.id).then(() => router.refresh())} className="text-red-600 focus:text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" /> Xóa mã
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* --- PHẦN MODAL (DIALOG) --- */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        {/* sm:max-w-[600px] giúp form rộng hơn (600px) so với mặc định */}
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedVoucher ? "Cập nhật mã khuyến mãi" : "Tạo chương trình khuyến mãi mới"}
            </DialogTitle>
            <DialogDescription>
              Điền đầy đủ thông tin bên dưới. Mã code sẽ tự động viết hoa.
            </DialogDescription>
          </DialogHeader>
          
          {/* Form được đặt ở đây */}
          <VoucherForm 
            initialData={selectedVoucher} 
            onSuccess={() => {
              setIsOpen(false);
              router.refresh();
            }} 
          />
          
        </DialogContent>
      </Dialog>
    </>
  );
};