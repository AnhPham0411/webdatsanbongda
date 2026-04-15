"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Bell, CheckCircle2, Info, AlertTriangle, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getMyNotifications, markAsRead } from "@/actions/client/notifications";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import Link from "next/link";

export const NotificationNav = () => {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (session?.user?.id) {
      const data = await getMyNotifications(session.user.id);
      setNotifications(data);
      setUnreadCount(data.filter((n: any) => !n.isRead).length);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Re-fetch every 30 seconds for real-time feel
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [session]);

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
    fetchNotifications();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "SUCCESS": return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "WARNING": return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "INQUIRY": return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
      case "VOUCHER": return <Info className="h-4 w-4 text-pink-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  if (!session) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors">
          <Bell className={cn("h-5 w-5", unreadCount > 0 ? "animate-swing" : "")} />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 h-4 min-w-4 px-1 flex items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent align="end" className="w-80 p-0 shadow-xl border-slate-100 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-white flex justify-between items-center">
            <h4 className="font-bold text-slate-900">Thông báo</h4>
            {unreadCount > 0 && (
                <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-bold">
                    {unreadCount} mới
                </span>
            )}
        </div>
        
        <div className="max-h-[400px] overflow-y-auto min-h-[100px] bg-slate-50/30">
            {notifications.length === 0 ? (
                <div className="py-10 text-center text-slate-500 text-sm flex flex-col items-center">
                    <Bell className="h-8 w-8 text-slate-200 mb-2" />
                    Chưa có thông báo nào
                </div>
            ) : (
                <div className="p-1 space-y-1">
                    {notifications.map((n: any) => (
                        <div 
                            key={n.id}
                            className={cn(
                                "flex items-start gap-3 p-3 rounded-lg transition-all relative group border border-transparent",
                                n.isRead ? "bg-transparent opacity-70" : "bg-white shadow-sm border-slate-100"
                            )}
                            onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                        >
                            <div className="mt-1 flex-shrink-0">
                                {getIcon(n.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={cn("text-xs font-bold truncate mb-0.5", n.isRead ? "text-slate-500" : "text-slate-900")}>
                                    {n.title}
                                </p>
                                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                                    {n.message}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-1">
                                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: vi })}
                                </p>
                            </div>
                            
                            {n.link && (
                                <Link 
                                    href={n.link} 
                                    className="absolute inset-0 z-0"
                                    onClick={(e) => {
                                        if (!n.isRead) handleMarkAsRead(n.id);
                                    }}
                                />
                            )}

                            {!n.isRead && (
                                <span className="absolute top-4 right-3 h-1.5 w-1.5 rounded-full bg-blue-500" />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>

        <div className="p-2 border-t border-slate-100 bg-white text-center">
            <button className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-wider">
               Xem tất cả thông báo
            </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
