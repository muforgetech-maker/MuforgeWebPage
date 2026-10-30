import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const services = [
  {
    title: "Custom Software Development",
    description:
      "Purpose-built dashboards, business applications, and workflow tools designed around the way your team works.",
    image: "/assets/services/software-dashboard.jpg",
    alt: "Software developers collaborating at a laptop displaying code",
  },
  {
    title: "Website Development",
    description:
      "Elegant, responsive websites and e-commerce experiences that make it easy for customers to explore and connect.",
    image: "/assets/services/website-development.jpg",
    alt: "Web developer working on a laptop at a clean workspace",
  },
  {
    title: "Digital Marketing",
    description:
      "Digital campaigns, social media content, and performance insights to build visibility and support steady growth.",
    image: "/assets/services/digital-marketing.jpg",
    alt: "Digital campaign performance analytics dashboard",
  },
  {
    title: "Product Photography & Video Editing",
    description:
      "Professional product photography and thoughtful video editing for polished campaigns and online stores.",
    image: "/assets/services/product-photography.jpg",
    alt: "Minimalist watches arranged for a product photography session",
  },
  {
    title: "SAP FICO Training",
    description:
      "Practical learning in SAP Finance and Controlling concepts, finance processes, and business-system workflows.",
    image: "/assets/services/sap-fico-training.jpg",
    alt: "Learners working together on a laptop during practical training",
  },
  {
    title: "SAP MM Training",
    description:
      "Guided learning in purchasing, procurement, inventory, and material management with practical process exercises.",
    image: "/assets/services/sap-mm-training.jpg",
    alt: "Organized warehouse inventory representing materials management",
  },
];

export const metadata = {
  title: "Services",
  description:
    "Explore MuForge services in custom software, website development, digital marketing, product photography and editing, and SAP training.",
};

export default function ServicesPage() {
  return (
    <div className="section-shell py-16 sm:py-20">
      <div className="max-w-3xl">
        <span className="eyebrow">Services</span>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
          Practical digital services, shaped around your goals.
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          From business software and creative production to career-focused SAP
          learning, MuForge brings the right expertise to your next step.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {services.map((service, index) => (
          <article
            key={service.title}
            className="flex h-full flex-col overflow-hidden rounded-[28px] border border-[var(--border)] bg-white shadow-[0_20px_50px_rgba(18,63,70,0.06)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(18,63,70,0.1)]"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-[var(--secondary-bg)]">
              <Image
                src={service.image}
                alt={service.alt}
                fill
                sizes="(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 33vw"
                loading={index < 2 ? "eager" : "lazy"}
                className="object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col p-6">
              <h2 className="text-2xl font-semibold text-slate-950">
                {service.title}
              </h2>
              <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">
                {service.description}
              </p>
              <Link
                href="/contact"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--button)] transition hover:text-[var(--button-hover)]"
                aria-label={`Enquire about ${service.title}`}
              >
                Explore service
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-16 rounded-[30px] border border-[var(--border)] bg-[var(--secondary-bg)] p-8 sm:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="eyebrow">Have a project in mind?</span>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Let’s find the right solution for your business.
            </h2>
          </div>
          <Link href="/contact" className="primary-button shrink-0">
            Discuss your project
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
