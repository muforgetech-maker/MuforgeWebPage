import Image from "next/image";
import Link from "next/link";
import { OrderFlowDemo } from "@/components/order-flow-demo";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  ChartNoAxesCombined,
  ChevronRight,
  CirclePlay,
  FileText,
  Layers3,
  MessageSquareQuote,
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

const projectCards = [
  {
    title: "Manufacturing Operations Dashboard",
    description: "A practical dashboard to track production, inventory, and business performance in one place.",
    accent: "Operations",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Business Website Redesign",
    description: "A cleaner digital presence focused on trust, clarity, and lead generation.",
    accent: "Branding",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Procurement Workflow System",
    description: "Automated purchase requests, approvals, and tracking to reduce operational delay.",
    accent: "Automation",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80",
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

export default function HomePage() {
  return (
    <>
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

      <section className="py-20">
        <div className="section-shell">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_20px_60px_rgba(18,63,70,0.05)]">
              <Image
                src="https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=900&q=80"
                alt="Professional technology consultation"
                width={900}
                height={700}
                className="h-full min-h-[300px] w-full rounded-[22px] object-cover"
              />
            </div>
            <div>
              <span className="eyebrow">About MuForge</span>
              <h2 className="mt-5 section-heading">We help businesses move with clearer systems and better digital direction.</h2>
              <p className="mt-5 section-copy">
                MuForge is a technology and digital solutions company focused on practical business support. We work with companies, founders, and learners who need reliable technology, stronger online presence, and a clearer path forward.
              </p>
              <p className="mt-4 section-copy">
                Whether the need is software, website development, digital marketing, or SAP learning, our approach keeps solutions customized, transparent, and aligned with real goals.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/about" className="primary-button">
                  Learn More
                  <ChevronRight size={16} />
                </Link>
                <a href="https://wa.me/919790261693" target="_blank" rel="noreferrer" className="secondary-button">
                  WhatsApp Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--secondary-bg)] py-20">
        <div className="section-shell">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="eyebrow">Services</span>
              <h2 className="mt-5 section-heading">Built for business growth and digital clarity.</h2>
            </div>
            <Link href="/services" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--button)] transition hover:text-[var(--button-hover)]">
              View all services
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-5">
            {services.map(({ title, description, icon: Icon }) => (
              <div key={title} className="rounded-[26px] border border-[var(--border)] bg-white p-5 transition hover:-translate-y-1 hover:border-[var(--accent)]">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)] text-[var(--button)]">
                  <Icon size={22} />
                </div>
                <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="section-shell">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="eyebrow">Featured projects</span>
              <h2 className="mt-5 section-heading">Representative work that reflects practical business thinking.</h2>
            </div>
            <Link href="/portfolio" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--body)] transition hover:text-[var(--heading)]">
              Explore portfolio
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {projectCards.map((project) => (
              <article key={project.title} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_50px_rgba(18,63,70,0.06)]">
                <div className="relative h-56 overflow-hidden">
                  <Image src={project.image} alt={project.title} width={900} height={700} className="h-full w-full object-cover" />
                  <span className="absolute left-4 top-4 rounded-control bg-ember px-3 py-1 text-2xs font-semibold uppercase text-on-ember">
                    {project.accent}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-slate-950">{project.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{project.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-100 py-20">
        <div className="section-shell">
          <div className="max-w-2xl">
            <span className="eyebrow">Why choose MuForge</span>
            <h2 className="mt-5 section-heading">A reliable partner for digital growth and operational clarity.</h2>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {reasons.map(({ title, description, icon: Icon }) => (
              <div key={title} className="premium-card p-7">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-900">
                  <Icon size={20} />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-950">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="section-shell">
          <div className="max-w-2xl">
            <span className="eyebrow">Process</span>
            <h2 className="mt-5 section-heading">A clear and practical approach from conversation to delivery.</h2>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-4">
            {processSteps.map((step, index) => (
              <div key={step} className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(18,63,70,0.04)]">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-on-ember">
                  0{index + 1}
                </div>
                <p className="text-base leading-7 text-slate-700">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--secondary-bg)] py-20">
        <div className="section-shell grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <span className="eyebrow">SAP Training</span>
            <h2 className="mt-5 section-heading">Practical SAP FI and SAP MM training for students and career-focused learners.</h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-600">
              Learn through hands-on exercises, guided assignments, and a learning approach designed to build confidence in real SAP workflows.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/sap-training" className="primary-button">
                Explore SAP Programs
              </Link>
              <a href="https://wa.me/919790261693" target="_blank" rel="noreferrer" className="secondary-button">
                WhatsApp enrollment
              </a>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-[28px] border border-[var(--border)] bg-white p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)] text-[var(--button)]">
                <Layers3 size={19} />
              </div>
              <h3 className="text-xl font-semibold text-slate-950">SAP FI</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">Finance-related process understanding and practical system tasks.</p>
            </div>
            <div className="rounded-[28px] border border-[var(--border)] bg-white p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)] text-[var(--button)]">
                <ShoppingCart size={19} />
              </div>
              <h3 className="text-xl font-semibold text-slate-950">SAP MM</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">Procurement workflows and business operations learning with practical exercises.</p>
            </div>
            <div className="rounded-[28px] border border-[var(--border)] bg-white p-6 md:col-span-2">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)] text-[var(--button)]">
                <Rocket size={19} />
              </div>
              <h3 className="text-xl font-semibold text-slate-950">Learning outcomes</h3>
              <ul className="mt-3 space-y-3 text-sm leading-7 text-slate-600">
                <li className="flex items-start gap-3"><span className="mt-1 text-[var(--button)]">•</span> Understand core SAP processes and user workflows.</li>
                <li className="flex items-start gap-3"><span className="mt-1 text-[var(--button)]">•</span> Practice guided assignments and real system tasks.</li>
                <li className="flex items-start gap-3"><span className="mt-1 text-[var(--button)]">•</span> Build confidence for academic and career-oriented learning.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="section-shell max-w-4xl">
          <div className="mb-10 max-w-2xl">
            <span className="eyebrow">FAQs</span>
            <h2 className="mt-5 section-heading">Common questions from businesses and learners.</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_rgba(18,63,70,0.04)]">
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-800">
                    <MessageSquareQuote size={15} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{faq.question}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="section-shell">
          <div className="rounded-[30px] border border-slate-200 bg-[var(--section-bg)] px-6 py-10 shadow-[0_30px_80px_rgba(18,63,70,0.1)] sm:px-8 lg:px-12">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <span className="eyebrow">Let’s talk</span>
                <h2 className="mt-5 max-w-xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  Ready to build something useful, polished, and growth-focused?
                </h2>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row lg:justify-end">
                <Link href="/contact" className="primary-button">
                  Start a conversation
                </Link>
                <a href="mailto:muforgetech@gmail.com" className="secondary-button">
                  Email us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
