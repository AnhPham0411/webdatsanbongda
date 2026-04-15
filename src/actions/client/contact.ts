"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const submitInquiry = async (values: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}) => {
  try {
    const inquiry = await db.inquiry.create({
      data: values,
    });

    // Simulated email simulation
    console.log(`[SIMULATED EMAIL] New Inquiry from ${values.name} (${values.email})`);
    console.log(`To: admin@sportarena.com, staff@sportarena.com`);
    console.log(`Subject: ${values.subject || "No Subject"}`);
    console.log(`Message: ${values.message}`);

    return { success: "Yêu cầu của bạn đã được gửi thành công!" };
  } catch (error) {
    console.error("[SUBMIT_INQUIRY_ERROR]", error);
    return { error: "Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại sau." };
  }
};

export const replyToInquiry = async (
  inquiryId: string,
  reply: string
) => {
  try {
    const inquiry = await db.inquiry.update({
      where: { id: inquiryId },
      data: {
        adminReply: reply,
        status: "REPLIED",
        repliedAt: new Date(),
      },
    });

    // Simulated email simulation back to user
    console.log(`[SIMULATED EMAIL] Reply sent to ${inquiry.email}`);
    console.log(`Subject: Phản hồi yêu cầu: ${inquiry.subject || "Từ Sport Arena"}`);
    console.log(`Content: ${reply}`);

    revalidatePath("/admin/inquiries");
    revalidatePath(`/admin/inquiries/${inquiryId}`);

    return { success: "Đã gửi phản hồi thành công cho khách hàng!" };
  } catch (error) {
    console.error("[REPLY_INQUIRY_ERROR]", error);
    return { error: "Có lỗi xảy ra khi gửi phản hồi." };
  }
};

export const deleteInquiry = async (id: string) => {
  try {
    await db.inquiry.delete({
      where: { id }
    });
    revalidatePath("/admin/inquiries");
    return { success: "Đã xóa yêu cầu thành công." };
  } catch (error) {
    return { error: "Không thể xóa yêu cầu này." };
  }
}
