import { PortfolioGrid } from "@/components/portfolio-grid";

export const metadata = {
  title: "Portfolio",
  description: "Browse MuForge portfolio highlights across software development, website work, business automation, and digital solutions.",
};

export default function PortfolioPage() {
  return (
    <div className="section-shell py-16 sm:py-20">
      <div className="max-w-3xl">
        <span className="eyebrow">Portfolio</span>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
          Demonstration projects and practical digital outcomes.
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          These examples reflect the kinds of business-focused solutions MuForge can help build. Each project is clearly labeled as a demonstration project until actual client work is available.
        </p>
      </div>

      <div className="mt-12">
        <PortfolioGrid />
      </div>
    </div>
  );
}
