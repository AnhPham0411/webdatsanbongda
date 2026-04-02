// src/lib/vietqr.ts

export const generateVietQrUrl = ({
  amount,
  bookingId,
}: {
  amount: number;
  bookingId: string;
}) => {
  const BANK_ID = process.env.NEXT_PUBLIC_BANK_ID;
  const ACCOUNT_NO = process.env.NEXT_PUBLIC_ACCOUNT_NO;
  const ACCOUNT_NAME = process.env.NEXT_PUBLIC_ACCOUNT_NAME;
  const TEMPLATE = process.env.NEXT_PUBLIC_TEMPLATE || "compact2";

  // Nội dung chuyển khoản: VD "THANHTOAN DH12345"
  // Loại bỏ các ký tự đặc biệt để tránh lỗi URL
  const description = `THANHTOAN ${bookingId}`.replace(/[^a-zA-Z0-9 ]/g, "");

  // URL API VietQR
  // Cấu trúc: https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<CONTENT>&accountName=<NAME>
  const url = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-${TEMPLATE}.png?amount=${amount}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(ACCOUNT_NAME || "")}`;

  return url;
};