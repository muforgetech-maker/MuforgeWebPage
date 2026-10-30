import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="section-shell flex min-h-[60vh] items-center justify-center py-16 sm:py-20">
      <div className="max-w-xl rounded-[30px] border border-slate-200 bg-white p-8 text-center shadow-[0_25px_80px_rgba(18,63,70,0.06)] sm:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-900">
          <SearchX size={28} />
        </div>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-950">Page not found</h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          The page you are looking for may have moved or no longer exists. Let’s get you back to the MuForge website.
        </p>
        <Link href="/" className="primary-button mt-8 mx-auto">
          <ArrowLeft size={16} />
          Back to home
        </Link>
      </div>
    </div>
  );
}
