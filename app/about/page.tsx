import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, CheckCircle2, MessageSquareText, ShieldCheck, Workflow } from "lucide-react";

const principles = [
  {
    title: "Practical problem solving",
    description: "We focus on real business needs instead of generic templates or unsupported features.",
    icon: Workflow,
  },
  {
    title: "Customized solutions",
    description: "Every project is shaped to your workflow, goals, and the way your business actually operates.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Clear communication",
    description: "We value honest conversations, steady progress, and transparency from start to finish.",
    icon: MessageSquareText,
  },
  {
    title: "Reliable delivery",
    description: "Our work is built to be useful, maintainable, and aligned with long-term business value.",
    icon: ShieldCheck,
  },
];

export const metadata = {
  title: "About",
  description: "Learn more about MuForge, our business-first approach, and how we help companies and learners with practical digital solutions.",
};

export default function AboutPage() {
  return (
    <div className="section-shell py-16 sm:py-20">
      <div className="max-w-3xl">
        <span className="eyebrow">About MuForge</span>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
          We build practical technology that supports business growth.
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          MuForge is a technology and digital solutions company focused on helping businesses and learners move forward with confidence.
        </p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white p-3 shadow-[0_25px_70px_rgba(18,63,70,0.06)]">
          <Image
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80"
            alt="Business and technology planning session"
            width={1200}
            height={900}
            className="h-[420px] w-full rounded-[22px] object-cover"
          />
        </div>
        <div className="space-y-5 text-base leading-8 text-slate-600">
          <p>
            MuForge works with businesses that need dependable digital support, from custom software and websites to digital marketing and professional content support.
          </p>
          <p>
            Our mission is simple: turn ideas into useful technology. We focus on practical outcomes, clean execution, and everyday business value rather than unnecessary complexity.
          </p>
          <p>
            We understand that every business has different priorities. That is why our process is centered on listening carefully, understanding your goals, and building the right solution for your situation.
          </p>
        </div>
      </div>

      <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {principles.map(({ title, description, icon: Icon }) => (
          <div key={title} className="premium-card p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-900">
              <Icon size={20} />
            </div>
            <h3 className="mt-5 text-xl font-semibold text-slate-950">{title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-[30px] border border-slate-200 bg-[var(--section-bg)] p-8 shadow-[0_25px_70px_rgba(18,63,70,0.08)]">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <span className="eyebrow">Our approach</span>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950">We work closely with clients to make the right decisions.</h2>
          </div>
          <ul className="space-y-4 text-sm leading-7 text-slate-600">
            <li className="flex items-start gap-3"><CheckCircle2 size={18} className="mt-1 text-[var(--button)]" /> Clear understanding of your current challenge and desired outcome.</li>
            <li className="flex items-start gap-3"><CheckCircle2 size={18} className="mt-1 text-[var(--button)]" /> Solutions shaped around your business goals and timeline.</li>
            <li className="flex items-start gap-3"><CheckCircle2 size={18} className="mt-1 text-[var(--button)]" /> Honest communication, thoughtful execution, and dependable follow-through.</li>
          </ul>
        </div>
      </div>

      <div className="mt-16 flex flex-col gap-5 sm:flex-row">
        <Link href="/services" className="primary-button">
          Explore services
          <ArrowRight size={16} />
        </Link>
        <Link href="/contact" className="secondary-button">
          Discuss your requirements
        </Link>
      </div>
    </div>
  );
}
