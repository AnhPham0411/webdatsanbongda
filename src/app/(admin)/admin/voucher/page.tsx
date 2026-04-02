import { getVouchers } from "@/actions/admin/voucher";
import { VoucherClient } from "../../../../components/admin/voucher-client";

export default async function AdminVouchersPage() {
  const vouchers = await getVouchers();
  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Quản lý Voucher</h2>
        <p className="text-muted-foreground">Thêm, sửa, xóa và gửi mail khuyến mãi.</p>
      </div>
      <VoucherClient data={vouchers} />
    </div>
  );
}