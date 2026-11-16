import Link from "next/link";
import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/erp/ui";

export default function ErpNotFound() {
  return (
    <div className="erp-card">
      <EmptyState
        icon={<SearchX size={20} aria-hidden="true" />}
        title="Record not found"
        description="It may have been deleted, or the link is wrong."
        action={
          <Link href="/admin" className="erp-button-secondary">
            Back to dashboard
          </Link>
        }
      />
    </div>
  );
}
