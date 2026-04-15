"use client";

import { useState } from "react";
import { TicketPercent, Loader2, Send } from "lucide-react";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { sendVoucherToUsers } from "@/actions/admin/voucher";
import { toast } from "sonner";

interface UserVoucherDialogProps {
    userId: string;
    userName: string;
    vouchers: any[];
}

export const UserVoucherDialog = ({ userId, userName, vouchers }: UserVoucherDialogProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedVoucherId, setSelectedVoucherId] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    const onSend = async () => {
        if (!selectedVoucherId) return;

        setIsLoading(true);
        const result = await sendVoucherToUsers(selectedVoucherId, userId);
        setIsLoading(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success(result.success);
            setIsOpen(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-[11px] gap-1 border-amber-200 text-amber-700 hover:bg-amber-50">
                    <TicketPercent className="h-3 w-3" />
                    Tặng Voucher
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Tặng mã giảm giá cho khách hàng</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <p className="text-sm text-slate-500">
                        Chọn một mã giảm giá đang hoạt động để gửi riêng cho <span className="font-bold text-slate-900">{userName}</span>.
                    </p>
                    <Select onValueChange={setSelectedVoucherId} value={selectedVoucherId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Chọn mã giảm giá..." />
                        </SelectTrigger>
                        <SelectContent>
                            {vouchers.filter(v => v.isActive).map((v) => (
                                <SelectItem key={v.id} value={v.id}>
                                    {v.code} - Giảm {v.discountType === "PERCENT" ? `${v.discountValue}%` : `${Number(v.discountValue).toLocaleString()}đ`}
                                </SelectItem>
                            ))}
                            {vouchers.filter(v => v.isActive).length === 0 && (
                                <p className="p-2 text-xs text-center text-slate-400">Không có mã nào đang hoạt động</p>
                            )}
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsOpen(false)} disabled={isLoading}>Hủy</Button>
                    <Button 
                        onClick={onSend} 
                        disabled={isLoading || !selectedVoucherId}
                        className="bg-amber-600 hover:bg-amber-700"
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                        Gửi ngay
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
