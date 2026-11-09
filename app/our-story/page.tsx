import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  FileText,
  Layers3,
  MessageCircle,
  ShoppingCart,
  TrendingUp,
  Users,
  Workflow,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "How MuForge began: founder U. Tharun's path from a B.Com student to SAP Global Certification and a registered business, plus a plain-language introduction to SAP for beginners.",
  alternates: { canonical: "/our-story" },
  openGraph: {
    title: "Our Story | MuForge",
    description:
      "How MuForge began: founder U. Tharun's path from a B.Com student to SAP Global Certification and a registered business, plus a plain-language introduction to SAP for beginners.",
    url: "/our-story",
    siteName: "MuForge",
    locale: "en_IN",
    type: "profile",
  },
};

const sections = [
  { href: "#founder", label: "About the founder" },
  { href: "#why-sap", label: "Why SAP" },
  { href: "#what-is-sap", label: "What is SAP" },
  { href: "#benefits", label: "Benefits of learning SAP" },
  { href: "#why-muforge", label: "Why MuForge" },
];

// A real sequence, which is what earns the numbering.
const journey = [
  {
    title: "B.Com Computer Applications",
    description:
      "I was exploring different career opportunities during college, but I wasn't fully sure which path to choose for my future.",
  },
  {
    title: "Introduced to SAP",
    description:
      "When our college explained SAP and its importance in the corporate world, I became interested. I joined the course and gradually understood how SAP helps businesses manage their daily operations.",
  },
  {
    title: "SAP Global Certification",
    description:
      "I worked hard, prepared for the examination, and successfully completed my SAP Global Certification. That gave me a clearer career direction.",
  },
  {
    title: "First freelance projects",
    description:
      "I started with small freelance projects and worked with different people. I faced challenges along the way, including difficulties with professional commitments and proper business registration.",
  },
  {
    title: "MuForge, registered",
    description:
      "Rather than stop there, I established MuForge as a registered business, with the responsibility and clear vision that the early work taught me it needed.",
  },
];

// The example from the founder's own description of SAP.
const connectedFlow = [
  { step: "Purchase materials", detail: "Requisition and order" },
  { step: "Manage stock", detail: "Goods receipt and inventory" },
  { step: "Process payments", detail: "Invoice verification" },
  { step: "Maintain records", detail: "Financial accounting" },
];

const benefits = [
  {
    title: "Industry-relevant skills",
    description: "Understand how companies manage their real-time business operations.",
    icon: Workflow,
  },
  {
    title: "Career opportunities",
    description:
      "Explore roles in SAP consulting, finance, procurement, inventory and business operations.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Practical knowledge",
    description: "Learn business processes through real-time SAP system practice.",
    icon: Layers3,
  },
  {
    title: "Global opportunities",
    description: "SAP skills are used by companies across different countries and industries.",
    icon: Building2,
  },
  {
    title: "Business understanding",
    description: "Develop knowledge of how different departments work together.",
    icon: Users,
  },
  {
    title: "Professional growth",
    description: "Build specialised skills that can support long-term career development.",
    icon: TrendingUp,
  },
];

const modules = [
  {
    code: "SAP FICO",
    name: "Finance and Controlling",
    icon: FileText,
    topics: [
      "Financial accounting",
      "General ledger",
      "Accounts payable",
      "Accounts receivable",
      "Asset accounting",
      "Cost controlling",
    ],
  },
  {
    code: "SAP MM",
    name: "Materials Management",
    icon: ShoppingCart,
    topics: [
      "Material management",
      "Purchasing",
      "Purchase requisitions and orders",
      "Goods receipt",
      "Inventory management",
      "Invoice verification",
    ],
  },
];

const approach = [
  "Easy-to-understand explanations.",
  "Practical SAP system training.",
  "Real-time business process examples.",
  "Industry-oriented learning.",
  "Trainer guidance and practice sessions.",
  "SAP Global Certification guidance.",
];

const founderSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "U. Tharun",
  jobTitle: "Founder",
  url: "https://muforge.in/our-story",
  worksFor: {
    "@type": "Organization",
    name: "MuForge",
    url: "https://muforge.in",
  },
};

export default function OurStoryPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(founderSchema) }}
      />

      <section className="relative isolate overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="hero-texture absolute inset-0" />
          <div className="hero-glow absolute -top-40 right-0 h-[32rem] w-[32rem] rounded-full" />
          <div className="hero-noise absolute inset-0" />
        </div>

        <div className="section-shell grid items-center gap-12 py-section lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <span className="eyebrow">Our story</span>
            <h1 className="mt-5 text-hero font-semibold text-text">From student to founder.</h1>
            <p className="mt-6 max-w-measure text-lg text-text-muted">
              I was once sitting where you are: in college, interested in business, and unsure
              which direction to take. SAP gave me that direction, and MuForge exists to help
              other learners find theirs.
            </p>
            <p className="mt-4 max-w-measure text-base text-text-muted">
              — U. Tharun, Founder
            </p>
          </div>

          {/* Monogram tile until a photograph of the founder is available.
              It is designed to stand on its own, not as a visible placeholder. */}
          <figure className="rounded-card border border-border bg-surface">
            <div className="flex items-center gap-5 p-6">
              <span
                aria-hidden="true"
                className="flex size-20 shrink-0 items-center justify-center rounded-card border border-border bg-surface-2 font-display text-3xl font-semibold tracking-tight text-text"
              >
                UT
              </span>
              <figcaption>
                <p className="text-h3 font-semibold text-text">U. Tharun</p>
                <p className="mt-1 text-sm text-text-muted">Founder, MuForge</p>
                <p className="mt-3 inline-flex rounded-control bg-ember-wash px-2 py-1 text-2xs font-semibold uppercase text-ember">
                  SAP FICO Global Certified
                </p>
              </figcaption>
            </div>
            <dl className="grid grid-cols-2 gap-4 border-t border-border px-6 py-4">
              <div>
                <dt className="text-2xs uppercase text-text-muted">Background</dt>
                <dd className="mt-1 text-sm text-text">B.Com Computer Applications</dd>
              </div>
              <div>
                <dt className="text-2xs uppercase text-text-muted">Based in</dt>
                <dd className="mt-1 text-sm text-text">Coimbatore, Tamil Nadu</dd>
              </div>
            </dl>
          </figure>
        </div>
      </section>

      <section className="border-y border-border bg-surface-2">
        <nav className="section-shell py-5" aria-label="On this page">
          <ul className="flex flex-wrap items-center gap-x-2 gap-y-2">
            <li className="mr-1 text-2xs font-semibold uppercase text-text-muted">On this page</li>
            {sections.map((section) => (
              <li key={section.href}>
                <a
                  href={section.href}
                  className="inline-block rounded-control border border-border px-3 py-1.5 text-sm text-text-muted transition-colors duration-200 hover:border-border-strong hover:text-text"
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </section>

      <section id="founder" className="scroll-mt-24 py-section">
        <div className="section-shell">
          <div className="max-w-measure">
            <span className="eyebrow">About the founder</span>
            <h2 className="mt-5 section-heading">
              My name is U. Tharun, and MuForge started with a question about my own future.
            </h2>
            <p className="mt-5 section-copy">
              I completed my B.Com in Computer Applications. During my college days I was
              exploring different career opportunities, but I wasn&rsquo;t fully sure which path
              to choose. What follows is how that changed.
            </p>
          </div>

          <ol className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {journey.map((stage, index) => (
              <li
                key={stage.title}
                className="reveal rounded-card border border-border bg-surface p-6"
              >
                <span className="font-mono text-sm font-semibold tabular-nums text-ember">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 text-h3 font-semibold text-text">{stage.title}</h3>
                <p className="mt-2 text-sm text-text-muted">{stage.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="why-sap" className="scroll-mt-24 border-t border-border bg-surface-2 py-section">
        <div className="section-shell grid items-start gap-12 lg:grid-cols-2">
          <div>
            <span className="eyebrow">Why SAP</span>
            <h2 className="mt-5 section-heading">
              It connects business knowledge with technology.
            </h2>
          </div>
          <div className="space-y-4 text-base text-text-muted">
            <p>
              I chose SAP because it gives you a way to understand how real companies manage
              their finance, purchasing, inventory, sales and other operations.
            </p>
            <p>
              Coming from a commerce background, I found that especially interesting: it
              combines business processes with practical software knowledge.
            </p>
            <p className="border-l-2 border-ember pl-5 text-text">
              Learning SAP is not just about getting a certificate. It is about understanding how
              businesses actually work, and developing skills you can apply in a corporate
              environment.
            </p>
          </div>
        </div>
      </section>

      <section id="what-is-sap" className="scroll-mt-24 border-t border-border py-section">
        <div className="section-shell">
          <div className="max-w-measure">
            <span className="eyebrow">What is SAP</span>
            <h2 className="mt-5 section-heading">A plain explanation, if you are new to it.</h2>
            <p className="mt-5 section-copy">
              SAP stands for{" "}
              <strong className="font-semibold text-text">
                Systems, Applications and Products in Data Processing
              </strong>
              . It is one of the world&rsquo;s leading enterprise software systems, and companies
              use it to connect different business operations in one place.
            </p>
            <p className="mt-4 section-copy">
              Take a single purchase. The materials are ordered, the stock is received, the
              supplier is paid, and the accounts are updated. Those are four different teams. SAP
              connects them so the information moves with the work.
            </p>
          </div>

          <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {connectedFlow.map((stage, index) => (
              <li
                key={stage.step}
                className="reveal relative rounded-card border border-border bg-surface p-5"
              >
                <span className="font-mono text-xs tabular-nums text-text-muted">
                  Step {index + 1}
                </span>
                <p className="mt-3 text-sm font-semibold text-text">{stage.step}</p>
                <p className="mt-1 text-sm text-text-muted">{stage.detail}</p>
              </li>
            ))}
          </ol>
          <p className="mt-5 text-sm text-text-muted">
            One connected system, instead of four separate records that have to be reconciled
            later. In simple words, SAP helps businesses work faster and in a more organised way.
          </p>
        </div>
      </section>

      <section id="benefits" className="scroll-mt-24 border-t border-border bg-surface-2 py-section">
        <div className="section-shell">
          <div className="max-w-measure">
            <span className="eyebrow">Benefits of learning SAP</span>
            <h2 className="mt-5 section-heading">
              What it can open up for students and professionals.
            </h2>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map(({ title, description, icon: Icon }) => (
              <div key={title} className="reveal premium-card">
                <div className="flex size-10 items-center justify-center rounded-control bg-ember-wash text-ember">
                  <Icon size={20} aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-h3 font-semibold text-text">{title}</h3>
                <p className="mt-2 text-sm text-text-muted">{description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <h3 className="text-h3 font-semibold text-text">
              SAP has modules for different business functions. We teach two.
            </h3>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {modules.map(({ code, name, icon: Icon, topics }) => (
                <div key={code} className="reveal rounded-card border border-border bg-surface p-6">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-control bg-ember-wash text-ember">
                      <Icon size={20} aria-hidden="true" />
                    </span>
                    <div>
                      <p className="font-mono text-sm font-semibold text-text">{code}</p>
                      <p className="text-sm text-text-muted">{name}</p>
                    </div>
                  </div>
                  <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                    {topics.map((topic) => (
                      <li key={topic} className="flex items-start gap-2 text-sm text-text-muted">
                        <CheckCircle2
                          size={16}
                          aria-hidden="true"
                          className="mt-0.5 shrink-0 text-ember"
                        />
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="why-muforge" className="scroll-mt-24 border-t border-border py-section">
        <div className="section-shell">
          <div className="grid items-start gap-12 lg:grid-cols-2">
            <div>
              <span className="eyebrow">Why MuForge</span>
              <h2 className="mt-5 section-heading">
                I wanted to build something of my own, properly.
              </h2>
              <blockquote className="mt-8 border-l-2 border-ember pl-5">
                <p className="font-display text-h3 font-semibold text-text">
                  I always believed that having a regular job was not the only way to build a
                  future.
                </p>
              </blockquote>
              <div className="mt-6 space-y-4 text-base text-text-muted">
                <p>
                  My journey started with small freelance projects. I worked with different
                  people and tried to complete projects for clients. That early stage came with
                  challenges, including difficulties with professional commitments and proper
                  business registration.
                </p>
                <p>
                  It taught me the importance of building something professionally, with proper
                  registration, responsibility and a clear vision. Today MuForge is growing, with
                  a vision to provide technology solutions, practical learning and
                  industry-oriented training.
                </p>
              </div>
            </div>

            <div className="rounded-card border border-border bg-surface p-6 lg:p-8">
              <h3 className="text-h3 font-semibold text-text">
                How we teach SAP FICO and SAP MM
              </h3>
              <p className="mt-3 text-sm text-text-muted">
                We believe learning should be simple, practical and connected to what the
                industry actually asks for.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-text-muted">
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
              <p className="mt-6 border-t border-border pt-5 text-sm text-text-muted">
                The goal is simple: help learners understand SAP, gain practical knowledge, and
                feel more confident about their career.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface-2 py-section">
        <div className="section-shell flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div>
            <p className="font-mono text-2xs uppercase tracking-[0.2em] text-ember">
              Ideas | Code | Impact
            </p>
            <h2 className="mt-5 max-w-measure section-heading">
              If SAP sounds like your direction too, let&rsquo;s talk.
            </h2>
            <p className="mt-4 section-copy">
              Course topics, batch details and fees are on the SAP training page.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/sap-training" className="primary-button whitespace-nowrap">
              View SAP training
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <a
              href="https://wa.me/919790261693"
              target="_blank"
              rel="noreferrer"
              className="secondary-button whitespace-nowrap"
            >
              <MessageCircle size={16} aria-hidden="true" />
              WhatsApp us
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
