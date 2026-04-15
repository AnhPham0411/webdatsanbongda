"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { uploadPaymentReceipt } from "@/actions/client/booking-receipt";
import { toast } from "sonner";
import { Image as ImageIcon, Loader2, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import Image from "next/image";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger 
} from "@/components/ui/dialog";

interface PaymentReceiptUploadProps {
    bookingId: string;
    existingBill?: string | null;
}

export const PaymentReceiptUpload = ({ 
    bookingId, 
    existingBill,
}: PaymentReceiptUploadProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        const formData = new FormData();
        formData.append("file", file);

        const result = await uploadPaymentReceipt(bookingId, formData);
        setIsLoading(false);

        if (result.error) {
            toast.error(result.error);
        } else if (result.success) {
            toast.success(result.success);
        }
    };

    return (
        <div className="w-full">
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleUpload}
            />

            {existingBill ? (
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-full h-8 text-[11px] text-emerald-700 font-bold hover:bg-emerald-100 gap-1 bg-emerald-100/50 border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3" />
                            ĐÃ GỬI BILL
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Minh chứng thanh toán</DialogTitle>
                        </DialogHeader>
                        <div className="relative aspect-[3/4] w-full mt-2 rounded-lg overflow-hidden border bg-slate-50">
                            <Image src={existingBill} alt="Payment Bill" fill className="object-contain" />
                        </div>
                        <div className="mt-4 flex flex-col gap-2">
                            <p className="text-xs text-gray-500 text-center italic">Bạn muốn thay đổi ảnh này?</p>
                            <Button 
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isLoading}
                                variant="default"
                                className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                            >
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                                Gửi lại bill khác
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            ) : (
                <Button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    variant="default" 
                    size="sm" 
                    className="w-full h-8 text-[10px] uppercase font-bold tracking-wider bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-sm"
                >
                    {isLoading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                        <ImageIcon className="h-3 w-3" />
                    )}
                    Gửi bill
                </Button>
            )}
        </div>
    );
};
