import { getSettings } from "@/actions/admin/settings";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function SettingsPage() {
  const settings = await getSettings();

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-[400px] text-slate-500">
        Có lỗi xảy ra khi tải cài đặt. Vui lòng thử lại sau.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-6">
      <SettingsForm initialData={settings} />
    </div>
  );
}