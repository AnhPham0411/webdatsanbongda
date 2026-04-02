import Link from "next/link";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"; // Cần cài @radix-ui/react-icons hoặc dùng lucide-react
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AuthErrorPage() {
  return (
    <Card className="w-[400px] shadow-md bg-white">
      <CardHeader>
        <div className="w-full flex flex-col gap-y-4 items-center justify-center">
            <ExclamationTriangleIcon className="text-destructive w-10 h-10" />
            <h1 className="text-xl font-bold text-destructive">Đã có lỗi xảy ra!</h1>
            <p className="text-gray-500 text-sm">Không thể hoàn tất quá trình xác thực.</p>
        </div>
      </CardHeader>
      <CardFooter>
        <Button variant="link" className="font-normal w-full" size="sm" asChild>
          <Link href="/login">
            Quay lại đăng nhập
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}