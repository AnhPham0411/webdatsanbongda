import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string | boolean;
  type: "booking" | "payment" | "court";
}

export const StatusBadge = ({ status, type }: StatusBadgeProps) => {
  const getStyle = (s: string) => {
    switch (s) {
      case "CONFIRMED":
      case "CHECKED_IN":
      case "PAID":
      case "ACTIVE":
      case "TRUE": 
        return "bg-green-500 hover:bg-green-600";
      
      case "PENDING":
      case "UNPAID":
        return "bg-yellow-500 hover:bg-yellow-600";
        
      case "CHECKED_OUT":
        return "bg-blue-500 hover:bg-blue-600";
        
      case "CANCELLED":
      case "REFUNDED":
      case "FALSE": 
        return "bg-red-500 hover:bg-red-600";
        
      default:
        return "bg-slate-500";
    }
  };

  const getLabel = (s: string) => {
    if (type === "court") {
      return s === "TRUE" || s === "true" ? "Sẵn sàng" : "Đang bận/Bảo trì";
    }

    const map: Record<string, string> = {
      PENDING: "Chờ xác nhận",
      CONFIRMED: "Đã xác nhận",
      CHECKED_IN: "Đã nhận sân",
      CHECKED_OUT: "Đã trả sân",
      CANCELLED: "Đã hủy",
      UNPAID: "Chưa thanh toán",
      PAID: "Đã thanh toán",
      REFUNDED: "Đã hoàn tiền"
    };
    return map[s] || s;
  };

  const statusString = String(status).toUpperCase();

  return (
    <Badge className={`${getStyle(statusString)} text-white shadow-none`}>
      {getLabel(statusString)}
    </Badge>
  );
};