import Link from "next/link";
import { OrderFlowDemo } from "@/components/order-flow-demo";
import { WorkflowMock } from "@/components/workflow-mock";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  ChartNoAxesCombined,
  ChevronDown,
  ChevronRight,
  CirclePlay,
  FileText,
  Layers3,
  Monitor,
  Rocket,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";

// The hero used to carry a statistics-shaped strip reading "Custom /
// Practical / Growth". MuForge has no track record to quote yet, so it now
// lists what the company actually does.
const capabilities = [
  "Custom software",
  "Websites",
  "Digital marketing",
  "Product visuals",
  "SAP training",
];

const services = [
  {
    title: "Custom Software Development",
    description: "Business software, dashboards, and workflow automation built around real operations.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Website Development",
    description: "Corporate websites, ecommerce platforms, and lead-focused digital experiences.",
    icon: Monitor,
  },
  {
    title: "Digital Marketing",
    description: "Brand visibility, content support, and digital campaigns designed for reach and trust.",
    icon: TrendingUp,
  },
  {
    title: "Product Photography & Video Editing",
    description: "Professional product visuals and creative marketing content for businesses.",
    icon: CirclePlay,
  },
  {
    title: "SAP FI & MM Training",
    description: "Career-oriented SAP learning with practical exercises and guided assignments.",
    icon: FileText,
  },
];

// Stock photographs of unrelated offices were standing in for project work.
// The cards now describe the build instead of illustrating it with a photo.
const projectCards = [
  {
    title: "Manufacturing Operations Dashboard",
    description:
      "A practical dashboard to track production, inventory, and business performance in one place.",
    accent: "Operations",
    facts: [
      { label: "Focus", value: "Production visibility" },
      { label: "Built with", value: "Next.js, TypeScript" },
    ],
  },
  {
    title: "Business Website Redesign",
    description: "A cleaner digital presence focused on trust, clarity, and lead generation.",
    accent: "Branding",
    facts: [
      { label: "Focus", value: "Lead generation" },
      { label: "Built with", value: "WordPress, SEO" },
    ],
  },
  {
    title: "Procurement Workflow System",
    description:
      "Automated purchase requests, approvals, and tracking to reduce operational delay.",
    accent: "Automation",
    facts: [
      { label: "Focus", value: "Approval cycle time" },
      { label: "Built with", value: "Process mapping" },
    ],
  },
];

const reasons = [
  {
    title: "Business-first thinking",
    description: "Every solution is shaped around practicality, efficiency, and measurable value.",
    icon: Building2,
  },
  {
    title: "Transparent collaboration",
    description: "Clear communication, realistic expectations, and a process built on trust.",
    icon: Users,
  },
  {
    title: "Results-driven delivery",
    description: "We focus on usable systems that support real business outcomes and smoother operations.",
    icon: ChartNoAxesCombined,
  },
];

const processSteps = [
  "Understand your goals, current challenges, and business needs.",
  "Shape the right solution, timeline, and digital process for your situation.",
  "Build, refine, and test with practical feedback at each stage.",
  "Launch confidently and support what matters most to your growth.",
];

const sapOutcomes = [
  "Understand core SAP processes and user workflows.",
  "Practice guided assignments and real system tasks.",
  "Build confidence for academic and career-oriented learning.",
];

const faqs = [
  {
    question: "What kind of businesses does MuForge work with?",
    answer:
      "MuForge supports manufacturing companies, SMEs, startups, and business owners who need practical digital solutions, websites, and business systems.",
  },
  {
    question: "Do you only build websites?",
    answer:
      "No. We also create custom software, workflow automation, digital marketing support, creative assets, and SAP learning programs.",
  },
  {
    question: "Can I discuss a project even if I am not sure about the scope?",
    answer:
      "Yes. We can begin with a conversation to understand your goals, current challenges, and the best next step for your business.",
  },
  {
    question: "Is SAP training offered for students and beginners?",
    answer:
      "Yes. MuForge SAP training is designed for students, fresh graduates, and individual learners who want practical, career-oriented learning.",
  },
];

// The questions and answers below are the ones rendered on the page, which is
// what Google requires of FAQPage markup.
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <section className="relative isolate overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="hero-texture absolute inset-0" />
          <div className="hero-glow absolute -top-40 right-0 h-[32rem] w-[32rem] rounded-full" />
          <div className="hero-noise absolute inset-0" />
        </div>

        <div className="section-shell grid gap-12 py-section lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <span className="eyebrow mb-5">MuForge Technology</span>
            <h1 className="text-hero font-semibold text-text">
              Technology that moves your business forward.
            </h1>
            <p className="mt-6 max-w-measure text-lg text-text-muted">
              We build practical digital solutions that help businesses operate smarter, work more
              efficiently, and grow with confidence.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/contact" className="primary-button">
                Discuss Your Project
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link href="/services" className="secondary-button">
                Explore Our Services
              </Link>
            </div>
            <ul className="mt-10 flex flex-wrap gap-x-5 gap-y-2 text-sm text-text-muted">
              {capabilities.map((capability) => (
                <li key={capability} className="flex items-center gap-2">
                  <span aria-hidden="true" className="size-1 rounded-full bg-ember" />
                  {capability}
                </li>
              ))}
            </ul>
          </div>

          <OrderFlowDemo />
        </div>
      </section>

      <section className="border-t border-border py-section">
        <div className="section-shell">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="reveal">
              <span className="eyebrow">About MuForge</span>
              <h2 className="mt-5 section-heading">
                We help businesses move with clearer systems and better digital direction.
              </h2>
              <p className="mt-5 section-copy">
                MuForge is a technology and digital solutions company focused on practical
                business support. We work with companies, founders, and learners who need
                reliable technology, stronger online presence, and a clearer path forward.
              </p>
              <p className="mt-4 section-copy">
                Whether the need is software, website development, digital marketing, or SAP
                learning, our approach keeps solutions customized, transparent, and aligned with
                real goals.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/about" className="primary-button">
                  Learn More
                  <ChevronRight size={16} aria-hidden="true" />
                </Link>
                <a
                  href="https://wa.me/919790261693"
                  target="_blank"
                  rel="noreferrer"
                  className="secondary-button"
                >
                  WhatsApp Us
                </a>
              </div>
            </div>

            <div className="reveal lg:order-first">
              <WorkflowMock />
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface-2 py-section">
        <div className="section-shell">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="eyebrow">Services</span>
              <h2 className="mt-5 section-heading">Built for business growth and digital clarity.</h2>
            </div>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 whitespace-nowrap py-1 text-sm font-semibold text-ember transition-colors duration-200 hover:text-ember-hover"
            >
              View all services
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map(({ title, description, icon: Icon }) => (
              <div
                key={title}
                className="reveal rounded-card border border-border bg-surface p-6 transition duration-200 hover:-translate-y-0.5 hover:border-border-strong"
              >
                <div className="mb-5 flex size-10 items-center justify-center rounded-control bg-ember-wash text-ember">
                  <Icon size={20} aria-hidden="true" />
                </div>
                <h3 className="text-h3 font-semibold text-text">{title}</h3>
                <p className="mt-2 text-sm text-text-muted">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border py-section">
        <div className="section-shell">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="eyebrow">Demonstration projects</span>
              <h2 className="mt-5 section-heading">
                Representative work that reflects practical business thinking.
              </h2>
              <p className="mt-4 section-copy">
                MuForge is newly launched, so these are demonstration projects that show the kind
                of work we build, not client engagements.
              </p>
            </div>
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 whitespace-nowrap py-1 text-sm font-semibold text-ember transition-colors duration-200 hover:text-ember-hover"
            >
              Explore portfolio
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {projectCards.map((project) => (
              <article
                key={project.title}
                className="reveal flex flex-col rounded-card border border-border bg-surface p-6 transition duration-200 hover:-translate-y-0.5 hover:border-border-strong"
              >
                <div className="flex items-center gap-2">
                  <span className="rounded-control bg-ember-wash px-2 py-1 text-2xs font-semibold uppercase text-ember">
                    {project.accent}
                  </span>
                  <span className="rounded-control border border-border px-2 py-1 text-2xs font-semibold uppercase text-text-muted">
                    Demonstration
                  </span>
                </div>
                <h3 className="mt-5 text-h3 font-semibold text-text">{project.title}</h3>
                <p className="mt-2 text-sm text-text-muted">{project.description}</p>
                <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4">
                  {project.facts.map((fact) => (
                    <div key={fact.label}>
                      <dt className="text-2xs uppercase text-text-muted">{fact.label}</dt>
                      <dd className="mt-1 text-sm text-text">{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface-2 py-section">
        <div className="section-shell">
          <div className="max-w-measure">
            <span className="eyebrow">Why choose MuForge</span>
            <h2 className="mt-5 section-heading">
              A reliable partner for digital growth and operational clarity.
            </h2>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {reasons.map(({ title, description, icon: Icon }) => (
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
        <div className="section-shell">
          <div className="max-w-measure">
            <span className="eyebrow">Process</span>
            <h2 className="mt-5 section-heading">
              A clear and practical approach from conversation to delivery.
            </h2>
          </div>

          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step, index) => (
              <li key={step} className="reveal rounded-card border border-border bg-surface p-6">
                <span className="font-mono text-sm font-semibold tabular-nums text-ember">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="mt-4 text-sm text-text-muted">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-border bg-surface-2 py-section">
        <div className="section-shell grid items-center gap-12 lg:grid-cols-2">
          <div className="reveal">
            <span className="eyebrow">SAP Training</span>
            <h2 className="mt-5 section-heading">
              Practical SAP FI and SAP MM training for students and career-focused learners.
            </h2>
            <p className="mt-5 section-copy">
              Learn through hands-on exercises, guided assignments, and a learning approach
              designed to build confidence in real SAP workflows.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/sap-training" className="primary-button">
                Explore SAP Programs
              </Link>
              <a
                href="https://wa.me/919790261693"
                target="_blank"
                rel="noreferrer"
                className="secondary-button"
              >
                WhatsApp enrollment
              </a>
            </div>
          </div>

          <div className="reveal grid gap-4 sm:grid-cols-2">
            <div className="rounded-card border border-border bg-surface p-6">
              <div className="mb-4 flex size-10 items-center justify-center rounded-control bg-ember-wash text-ember">
                <Layers3 size={19} aria-hidden="true" />
              </div>
              <h3 className="text-h3 font-semibold text-text">SAP FI</h3>
              <p className="mt-2 text-sm text-text-muted">
                Finance-related process understanding and practical system tasks.
              </p>
            </div>
            <div className="rounded-card border border-border bg-surface p-6">
              <div className="mb-4 flex size-10 items-center justify-center rounded-control bg-ember-wash text-ember">
                <ShoppingCart size={19} aria-hidden="true" />
              </div>
              <h3 className="text-h3 font-semibold text-text">SAP MM</h3>
              <p className="mt-2 text-sm text-text-muted">
                Procurement workflows and business operations learning with practical exercises.
              </p>
            </div>
            <div className="rounded-card border border-border bg-surface p-6 sm:col-span-2">
              <div className="mb-4 flex size-10 items-center justify-center rounded-control bg-ember-wash text-ember">
                <Rocket size={19} aria-hidden="true" />
              </div>
              <h3 className="text-h3 font-semibold text-text">Learning outcomes</h3>
              <ul className="mt-3 space-y-2 text-sm text-text-muted">
                {sapOutcomes.map((outcome) => (
                  <li key={outcome} className="flex items-start gap-3">
                    <span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-ember" />
                    {outcome}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border py-section">
        <div className="section-shell">
          <div className="mb-10 max-w-measure">
            <span className="eyebrow">FAQs</span>
            <h2 className="mt-5 section-heading">Common questions from businesses and learners.</h2>
          </div>
          {/* <details> gives real disclosure semantics and keyboard support
              that the previous always-open divs did not have. */}
          <div className="max-w-3xl divide-y divide-border border-y border-border">
            {faqs.map((faq) => (
              <details key={faq.question} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left text-h3 font-semibold text-text marker:hidden">
                  {faq.question}
                  <ChevronDown
                    size={18}
                    aria-hidden="true"
                    className="shrink-0 text-text-muted transition-transform duration-200 group-open:rotate-180"
                  />
                </summary>
                <p className="max-w-measure pb-5 text-sm text-text-muted">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface-2 py-section">
        <div className="section-shell flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div>
            <span className="eyebrow">Let’s talk</span>
            <h2 className="mt-5 max-w-measure section-heading">
              Ready to build something useful, polished, and growth-focused?
            </h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/contact" className="primary-button">
              Start a conversation
            </Link>
            <a href="mailto:muforgetech@gmail.com" className="secondary-button">
              Email us
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
