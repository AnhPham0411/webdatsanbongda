"use client";

import { useState, useTransition } from "react";
import { UserRole } from "@prisma/client";
import { toast } from "sonner";
import { Loader2, Shield, ShieldCheck, User as UserIcon } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateUserRole } from "@/actions/admin/users";
import { Badge } from "@/components/ui/badge";

interface UserRoleSelectProps {
  userId: string;
  defaultValue: UserRole;
  isCurrentUser: boolean;
}

export const UserRoleSelect = ({ 
  userId, 
  defaultValue, 
  isCurrentUser 
}: UserRoleSelectProps) => {
  const [isPending, startTransition] = useTransition();
  const [role, setRole] = useState(defaultValue);

  const onChange = (newRole: UserRole) => {
    setRole(newRole); // Optimistic update UI
    startTransition(async () => {
      const result = await updateUserRole(userId, newRole);
      if (result.error) {
        toast.error(result.error);
        setRole(defaultValue); // Revert nếu lỗi
      } else {
        toast.success(result.success);
      }
    });
  };

  // Helper chọn icon/màu theo role
  const getRoleIcon = (r: UserRole) => {
    switch (r) {
      case "ADMIN": return <ShieldCheck className="h-4 w-4 mr-2 text-red-600" />;
      case "STAFF": return <Shield className="h-4 w-4 mr-2 text-blue-600" />;
      default: return <UserIcon className="h-4 w-4 mr-2 text-slate-500" />;
    }
  };

  // Nếu là chính mình -> Chỉ hiện Badge tĩnh (Không cho sửa)
  if (isCurrentUser) {
    return (
      <Badge variant="outline" className="h-9 px-3 border-dashed border-red-300 bg-red-50 text-red-700 cursor-not-allowed">
         <ShieldCheck className="h-3 w-3 mr-2" />
         ADMIN (Bạn)
      </Badge>
    );
  }

  return (
    <Select
      disabled={isPending}
      onValueChange={onChange}
      value={role}
    >
      <SelectTrigger className="w-[140px] h-9 bg-white">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ADMIN">
            <div className="flex items-center font-medium text-red-600">
                <ShieldCheck className="h-4 w-4 mr-2" /> ADMIN
            </div>
        </SelectItem>
        <SelectItem value="STAFF">
            <div className="flex items-center font-medium text-blue-600">
                <Shield className="h-4 w-4 mr-2" /> STAFF
            </div>
        </SelectItem>
        <SelectItem value="USER">
            <div className="flex items-center text-slate-600">
                <UserIcon className="h-4 w-4 mr-2" /> USER
            </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};