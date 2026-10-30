import Image from "next/image";
import Link from "next/link";
import { BookOpen, CheckCircle2, GraduationCap, MessageCircle, Users } from "lucide-react";

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

export const metadata = {
  title: "SAP Training",
  description: "MuForge SAP training includes SAP FI and SAP MM programs for students, graduates, and learners seeking practical business system knowledge.",
};

export default function SAPTrainingPage() {
  return (
    <div className="section-shell py-16 sm:py-20">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <span className="eyebrow">SAP Training</span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            SAP FI and SAP MM training for practical business learning.
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            MuForge offers hands-on SAP training for college students, fresh graduates, and individual learners who want practical business-process knowledge.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <a href="https://wa.me/919790261693" target="_blank" rel="noreferrer" className="primary-button">
              WhatsApp enrollment
              <MessageCircle size={16} />
            </a>
            <Link href="/contact" className="secondary-button">
              Enquire now
            </Link>
          </div>
        </div>

        <div className="rounded-[30px] border border-slate-200 bg-white p-4 shadow-[0_25px_70px_rgba(18,63,70,0.08)]">
          <Image
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"
            alt="SAP learning and business systems training"
            width={1200}
            height={900}
            className="h-[420px] w-full rounded-[24px] object-cover"
          />
        </div>
      </div>

      <div className="mt-16 grid gap-6 md:grid-cols-3">
        <div className="premium-card p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-900">
            <BookOpen size={20} />
          </div>
          <h3 className="text-xl font-semibold text-slate-950">Course overview</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">Introductory and practical learning focused on SAP FI and SAP MM fundamentals and workflows.</p>
        </div>
        <div className="premium-card p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-900">
            <GraduationCap size={20} />
          </div>
          <h3 className="text-xl font-semibold text-slate-950">Target audience</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">Designed for college students, fresh graduates, and individual learners seeking practical exposure.</p>
        </div>
        <div className="premium-card p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-900">
            <Users size={20} />
          </div>
          <h3 className="text-xl font-semibold text-slate-950">Training approach</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">Practical exercises, guided task support, discussions, and structured assignments.</p>
        </div>
      </div>

      <div className="mt-16 grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(18,63,70,0.04)] lg:p-8">
          <h2 className="text-2xl font-semibold text-slate-950">Topics covered</h2>
          <ul className="mt-6 space-y-4 text-sm leading-7 text-slate-700">
            {courseTopics.map((topic) => (
              <li key={topic} className="flex items-start gap-3">
                <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--button)] text-[10px] font-semibold text-white">✓</span>
                <span>{topic}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[30px] border border-slate-200 bg-[var(--section-bg)] p-6 shadow-[0_20px_60px_rgba(18,63,70,0.06)] lg:p-8">
          <h2 className="text-2xl font-semibold text-slate-950">Learning outcomes</h2>
          <ul className="mt-6 space-y-4 text-sm leading-7 text-slate-300">
            {outcomes.map((outcome) => (
              <li key={outcome} className="flex items-start gap-3">
                <CheckCircle2 size={18} className="mt-1 shrink-0 text-[var(--button)]" />
                <span>{outcome}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-16 rounded-[30px] border border-slate-200 bg-slate-100 p-6 lg:p-8">
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Training format</p>
            <p className="mt-3 text-base leading-7 text-slate-700">Structured sessions, guided practice, and learner-focused support.</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Course fees</p>
            <p className="mt-3 text-base leading-7 text-slate-700">Flexible and easy to update based on the program format and batch details.</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Duration & batches</p>
            <p className="mt-3 text-base leading-7 text-slate-700">Duration and batch dates can be updated as per the current training plan.</p>
          </div>
        </div>
      </div>

      <div className="mt-16 rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(18,63,70,0.04)] lg:p-8">
        <h2 className="text-2xl font-semibold text-slate-950">Frequently asked questions</h2>
        <div className="mt-6 space-y-5 text-sm leading-7 text-slate-600">
          <div>
            <p className="font-semibold text-slate-900">Who can join the SAP training?</p>
            <p>Students, fresh graduates, and individual learners who want practical understanding of SAP FI and SAP MM can enquire.</p>
          </div>
          <div>
            <p className="font-semibold text-slate-900">Do you guarantee placements?</p>
            <p>We do not promise guaranteed employment or unauthorized certification. The training is designed to support career-oriented learning.</p>
          </div>
          <div>
            <p className="font-semibold text-slate-900">How do I enroll?</p>
            <p>You can contact us via WhatsApp or send an enquiry through the contact page to discuss the intake details.</p>
          </div>
        </div>
      </div>

      <div className="mt-16 rounded-[30px] border border-slate-200 bg-[var(--secondary-bg)] p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="eyebrow">Student inquiry</span>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950">Interested in learning SAP with MuForge?</h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/contact" className="primary-button">
              Send enquiry
            </Link>
            <a href="https://wa.me/919790261693" target="_blank" rel="noreferrer" className="secondary-button">
              WhatsApp now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
