"use client";

import { useState, useEffect } from "react";
import { Clock, AlertCircle } from "lucide-react";

interface BookingTimerProps {
    createdAt: Date;
    status: string;
    existingBill?: string | null;
}

export const BookingTimer = ({ 
    createdAt, 
    status,
    existingBill 
}: BookingTimerProps) => {
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    useEffect(() => {
        // Nếu đã có Bill hoặc không phải trạng thái PENDING thì không hiện timer
        if (existingBill || status !== "PENDING") return;

        const calculateTime = () => {
            const difference = (new Date(createdAt).getTime() + 10 * 60 * 1000) - Date.now();
            if (difference <= 0) {
                setTimeLeft(0);
            } else {
                setTimeLeft(Math.floor(difference / 1000));
            }
        };

        calculateTime();
        const timer = setInterval(calculateTime, 1000);
        return () => clearInterval(timer);
    }, [createdAt, existingBill, status]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    // Nếu không cần hiện timer
    if (existingBill || status !== "PENDING") return null;

    // Nếu đã hết hạn
    if (timeLeft === 0) {
        return (
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-bold px-2 py-1.5 bg-slate-100 rounded-lg w-full mb-1">
                <AlertCircle className="h-3 w-3" />
                HẾT HẠN
            </div>
        );
    }

    // Server render or loading
    if (timeLeft === null) return null;

    return (
        <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-amber-700 bg-amber-100 rounded-lg py-1.5 w-full mb-1 border border-amber-200 shadow-sm">
            <Clock className="h-3 w-3" />
            CÒN {formatTime(timeLeft)}
        </div>
    );
};
