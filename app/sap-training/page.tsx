import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  GraduationCap,
  MessageCircle,
  Users,
} from "lucide-react";
import { OrderFlowDemo } from "@/components/order-flow-demo";

const courseTopics = [
  "Introduction to SAP business processes",
  "SAP FI core concepts and workflow understanding",
  "SAP MM fundamentals and procurement flow",
  "Practical system exercises and guided tasks",
  "Assignment-based learning support",
  "Career-oriented learning for learners and students",
];

const outcomes = [
  "Understand business processes in SAP FI and SAP MM.",
  "Practice real workflow scenarios with guided exercises.",
  "Build confidence in handling SAP-related tasks.",
  "Learn with a structure designed for student and beginner support.",
];

const pillars = [
  {
    title: "Course overview",
    description:
      "Introductory and practical learning focused on SAP FI and SAP MM fundamentals and workflows.",
    icon: BookOpen,
  },
  {
    title: "Target audience",
    description:
      "Designed for college students, fresh graduates, and individual learners seeking practical exposure.",
    icon: GraduationCap,
  },
  {
    title: "Training approach",
    description:
      "Practical exercises, guided task support, discussions, and structured assignments.",
    icon: Users,
  },
];

// Fees and batch details are marked as unconfirmed rather than described as
// "flexible and easy to update", which read as unfinished copy.
const logistics = [
  {
    label: "Training format",
    value: "Structured sessions, guided practice, and learner-focused support.",
    pending: false,
  },
  { label: "Course fees", value: "Shared on enquiry.", pending: true },
  { label: "Duration & batches", value: "Shared on enquiry.", pending: true },
];

const faqs = [
  {
    question: "Who can join the SAP training?",
    answer:
      "Students, fresh graduates, and individual learners who want practical understanding of SAP FI and SAP MM can enquire.",
  },
  {
    question: "Do you guarantee placements?",
    answer:
      "We do not promise guaranteed employment or unauthorized certification. The training is designed to support career-oriented learning.",
  },
  {
    question: "How do I enroll?",
    answer:
      "You can contact us via WhatsApp or send an enquiry through the contact page to discuss the intake details.",
  },
];

export const metadata = {
  title: "SAP Training",
  description:
    "MuForge SAP training includes SAP FI and SAP MM programs for students, graduates, and learners seeking practical business system knowledge.",
};

export default function SAPTrainingPage() {
  return (
    <>
      <section className="py-section">
        <div className="section-shell grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="eyebrow">SAP Training</span>
            <h1 className="mt-5 text-h1 font-semibold text-text">
              SAP FI and SAP MM training for practical business learning.
            </h1>
            <p className="mt-5 text-lg text-text-muted">
              MuForge offers hands-on SAP training for college students, fresh graduates, and
              individual learners who want practical business-process knowledge.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="https://wa.me/919790261693"
                target="_blank"
                rel="noreferrer"
                className="primary-button"
              >
                WhatsApp enrollment
                <MessageCircle size={16} aria-hidden="true" />
              </a>
              <Link href="/contact" className="secondary-button">
                Enquire now
              </Link>
            </div>
          </div>

          {/* The order-to-billing flow this programme teaches. */}
          <OrderFlowDemo />
        </div>
      </section>

      <section className="border-t border-border bg-surface-2 py-section">
        <div className="section-shell grid gap-4 md:grid-cols-3">
          {pillars.map(({ title, description, icon: Icon }) => (
            <div key={title} className="reveal premium-card">
              <div className="flex size-10 items-center justify-center rounded-control bg-ember-wash text-ember">
                <Icon size={20} aria-hidden="true" />
              </div>
              <h2 className="mt-5 text-h3 font-semibold text-text">{title}</h2>
              <p className="mt-2 text-sm text-text-muted">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border py-section">
        <div className="section-shell grid gap-4 lg:grid-cols-2">
          <div className="reveal rounded-card border border-border bg-surface p-6 lg:p-8">
            <h2 className="text-h2 font-semibold text-text">Topics covered</h2>
            <ul className="mt-6 space-y-3 text-sm text-text-muted">
              {courseTopics.map((topic) => (
                <li key={topic} className="flex items-start gap-3">
                  <CheckCircle2
                    size={18}
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-ember"
                  />
                  {topic}
                </li>
              ))}
            </ul>
          </div>

          <div className="reveal rounded-card border border-border bg-surface p-6 lg:p-8">
            <h2 className="text-h2 font-semibold text-text">Learning outcomes</h2>
            <ul className="mt-6 space-y-3 text-sm text-text-muted">
              {outcomes.map((outcome) => (
                <li key={outcome} className="flex items-start gap-3">
                  <CheckCircle2
                    size={18}
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-ember"
                  />
                  {outcome}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface-2 py-section">
        <div className="section-shell">
          <h2 className="section-heading">Programme details</h2>
          <dl className="mt-8 grid gap-4 md:grid-cols-3">
            {logistics.map((item) => (
              <div key={item.label} className="rounded-card border border-border bg-surface p-6">
                <dt className="text-2xs font-semibold uppercase text-text-muted">{item.label}</dt>
                <dd className="mt-3 text-sm text-text-muted">
                  {item.value}
                  {item.pending && (
                    <span className="mt-3 block rounded-control border border-dashed border-border-strong px-3 py-2 text-2xs uppercase text-text-muted">
                      To be confirmed
                    </span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="border-t border-border py-section">
        <div className="section-shell">
          <h2 className="section-heading">Frequently asked questions</h2>
          <div className="mt-8 max-w-3xl divide-y divide-border border-y border-border">
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
            <span className="eyebrow">Student inquiry</span>
            <h2 className="mt-5 max-w-measure section-heading">
              Interested in learning SAP with MuForge?
            </h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/contact" className="primary-button">
              Send enquiry
            </Link>
            <a
              href="https://wa.me/919790261693"
              target="_blank"
              rel="noreferrer"
              className="secondary-button"
            >
              WhatsApp now
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
