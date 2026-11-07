import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  MessageSquareText,
  ShieldCheck,
  Workflow,
} from "lucide-react";

const approach = [
  "Clear understanding of your current challenge and desired outcome.",
  "Solutions shaped around your business goals and timeline.",
  "Honest communication, thoughtful execution, and dependable follow-through.",
];

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
    <>
      <section className="py-section">
        <div className="section-shell">
          <div className="max-w-measure">
            <span className="eyebrow">About MuForge</span>
            <h1 className="mt-5 text-h1 font-semibold text-text">
              We build practical technology that supports business growth.
            </h1>
            <p className="mt-5 text-lg text-text-muted">
              MuForge is a technology and digital solutions company focused on helping businesses
              and learners move forward with confidence.
            </p>
          </div>

          <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:items-start">
            <div className="space-y-4 text-base text-text-muted">
              <p>
                MuForge works with businesses that need dependable digital support, from custom
                software and websites to digital marketing and professional content support.
              </p>
              <p>
                Our mission is simple: turn ideas into useful technology. We focus on practical
                outcomes, clean execution, and everyday business value rather than unnecessary
                complexity.
              </p>
              <p>
                We understand that every business has different priorities. That is why our
                process is centered on listening carefully, understanding your goals, and building
                the right solution for your situation.
              </p>
            </div>

            <div className="rounded-card border border-border bg-surface p-6 lg:p-8">
              <span className="eyebrow">Our approach</span>
              <h2 className="mt-5 text-h3 font-semibold text-text">
                We work closely with clients to make the right decisions.
              </h2>
              <ul className="mt-6 space-y-4 text-sm text-text-muted">
                {approach.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2
                      size={18}
                      aria-hidden="true"
                      className="mt-0.5 shrink-0 text-ember"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface-2 py-section">
        <div className="section-shell">
          <h2 className="section-heading">How we work</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {principles.map(({ title, description, icon: Icon }) => (
              <div key={title} className="reveal premium-card">
                <div className="flex size-10 items-center justify-center rounded-control bg-ember-wash text-ember">
                  <Icon size={20} aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-h3 font-semibold text-text">{title}</h3>
                <p className="mt-2 text-sm text-text-muted">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border py-section">
        <div className="section-shell flex flex-col gap-3 sm:flex-row">
          <Link href="/services" className="primary-button">
            Explore services
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link href="/contact" className="secondary-button">
            Discuss your requirements
          </Link>
        </div>
      </section>
    </>
  );
}
