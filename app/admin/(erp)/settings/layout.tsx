import { PageHeader } from "@/components/erp/ui";
import { SettingsTabs } from "./settings-tabs";

export default function SettingsLayout({ children }: LayoutProps<"/admin/settings">) {
  return (
    <div className="max-w-4xl">
      <PageHeader title="Settings" description="Your company profile, invoice defaults, people and data." />
      <SettingsTabs />
      {children}
    </div>
  );
}
