import { Badge } from "@/components/ui/badge";

interface BookingStatusBadgeProps {
  status: string;
}

export const BookingStatusBadge = ({ status }: BookingStatusBadgeProps) => {
  let label = status;
  let variant: "default" | "secondary" | "destructive" | "outline" = "default";
  let className = "";

  switch (status) {
    case "PENDING":
      label = "Chờ xác nhận";
      variant = "secondary";
      className = "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      break;
    case "CONFIRMED":
      label = "Đã xác nhận";
      variant = "default";
      className = "bg-green-100 text-green-800 hover:bg-green-200";
      break;
    case "CHECKED_IN":
      label = "Đang ở";
      variant = "default";
      className = "bg-blue-100 text-blue-800 hover:bg-blue-200";
      break;
    case "CHECKED_OUT":
      label = "Đã trả phòng";
      variant = "outline";
      className = "text-gray-600 border-gray-400";
      break;
    case "CANCELLED":
      label = "Đã hủy";
      variant = "destructive";
      break;
    default:
      label = status;
  }

  return (
    <Badge variant={variant} className={`whitespace-nowrap ${className}`}>
      {label}
    </Badge>
  );
};