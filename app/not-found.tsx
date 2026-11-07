import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <section className="section-shell flex min-h-[60vh] items-center justify-center py-section">
      <div className="max-w-xl rounded-card border border-border bg-surface p-8 text-center sm:p-12">
        <div className="mx-auto flex size-12 items-center justify-center rounded-control bg-ember-wash text-ember">
          <SearchX size={24} aria-hidden="true" />
        </div>
        <h1 className="mt-6 text-h1 font-semibold text-text">Page not found</h1>
        <p className="mt-4 text-base text-text-muted">
          The page you are looking for may have moved or no longer exists. Let’s get you back to
          the MuForge website.
        </p>
        <Link href="/" className="primary-button mx-auto mt-8">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to home
        </Link>
      </div>
    </section>
  );
}
