/**
 * @file page.tsx (Admin Courts)
 * @description Trang danh sách sân bóng dành cho quản trị viên.
 * Cho phép tìm kiếm, lọc và thực hiện các thao tác quản lý nhanh.
 */
import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Search, Activity, Users, X, MapPin, Building2 } from "lucide-react";
import { StatusBadge } from "@/components/admin/status-badge";
import { CourtActions } from "@/components/admin/court-actions";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CourtsPageProps {
  searchParams: Promise<{ query?: string }>;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

export default async function CourtsPage({ searchParams }: CourtsPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams?.query || "";

  /**
   * Truy vấn danh sách sân bóng từ Database (Prisma).
   * Bao gồm logic tìm kiếm theo tên sân, loại sân hoặc tên khu vực.
   */
  const courts = await db.court.findMany({
    where: {
      OR: [
        { name: { contains: query } },
        { courtType: { name: { contains: query } } },
        { courtType: { location: { name: { contains: query } } } },
      ],
    },
    include: { 
      courtType: {
        include: {
            location: true 
        }
      },
      images: true, 
    },
    orderBy: { createdAt: "desc" },
  });

  const totalCourts = courts.length;
  const activeCourts = courts.filter((c: any) => c.isAvailable).length;

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex overflow-y-auto">
      
      {/* 1. HEADER SECTION */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quản lý Sân bóng</h2>
          <p className="text-muted-foreground">
            Danh sách sân bóng trên toàn hệ thống <span className="font-semibold text-foreground">Sport Arena</span>.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/admin/courts/new">
            <Button size="sm" className="h-9">
              <Plus className="mr-2 h-4 w-4" /> Thêm sân mới
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Thanh công cụ (Toolbar): Tìm kiếm và bộ lọc nhanh */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-1 rounded-lg">
        <div className="flex w-full sm:w-auto items-center space-x-2">
          <form className="relative w-full sm:w-[350px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              name="query"
              placeholder="Tìm theo tên sân, hạng sân hoặc khu vực..."
              className="pl-8 h-9"
              defaultValue={query}
            />
          </form>
          {query && (
            <Link href="/admin/courts">
              <Button variant="ghost" size="sm" className="h-9 px-2 lg:px-3">
                Reset <X className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-100 px-3 py-1.5 rounded-md">
            <Building2 className="h-4 w-4" />
            <span>Tổng: <strong>{totalCourts}</strong> sân</span>
            <span className="mx-1">|</span>
            <span className="text-green-600">Sẵn sàng: <strong>{activeCourts}</strong></span>
        </div>
      </div>

      {/* 3. Bảng dữ liệu (Data Table): Hiển thị danh sách sân bóng */}
      <div className="rounded-md border bg-white shadow-sm overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[100px]">Mã sân</TableHead>
              <TableHead className="min-w-[150px]">Tên sân</TableHead>
              <TableHead className="min-w-[150px]">Khu vực / Cụm</TableHead>
              <TableHead className="min-w-[150px]">Hạng sân</TableHead>
              <TableHead>Sức chứa</TableHead>
              <TableHead className="text-right">Giá / ca</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-[400px] text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                      <Activity className="h-10 w-10 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold">Không tìm thấy sân nào</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                      {query 
                        ? `Không có kết quả nào cho "${query}".`
                        : "Hệ thống chưa có dữ liệu sân bóng."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              courts.map((court) => (
                <TableRow key={court.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell>
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                        <Activity className="h-5 w-5 text-blue-500" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                        <span className="font-medium text-slate-900">{court.name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                            ID: {court.id.slice(-4).toUpperCase()}
                        </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-blue-700 font-medium">
                        <MapPin className="h-3.5 w-3.5" />
                        {court.courtType.location?.name || "Chưa cập nhật"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal bg-slate-50 text-slate-600">
                      {court.courtType.name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-slate-600 text-sm">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      <span>{court.courtType.capacity} người</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold text-slate-900">
                    {formatPrice(Number(court.courtType.basePrice))}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={court.isAvailable} type="court" />
                  </TableCell>
                  <TableCell className="text-right">
                    <CourtActions id={court.id} isAvailable={court.isAvailable} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}