import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "MuForge ERP",
    template: "%s · MuForge ERP",
  },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return children;
}
