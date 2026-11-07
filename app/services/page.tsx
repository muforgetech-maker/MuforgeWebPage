import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Services",
  description:
    "Explore MuForge services in custom software, website development, digital marketing, product photography and editing, and SAP training.",
  alternates: { canonical: "/services" },
  openGraph: {
    title: "Services | MuForge",
    description:
      "Explore MuForge services in custom software, website development, digital marketing, product photography and editing, and SAP training.",
    url: "/services",
    siteName: "MuForge",
    locale: "en_IN",
    type: "website",
  },
};

export default function ServicesPage() {
  return (
    <>
      <section className="py-section">
        <div className="section-shell">
          <div className="max-w-measure">
            <span className="eyebrow">Services</span>
            <h1 className="mt-5 text-h1 font-semibold text-text">
              Practical digital services, shaped around your goals.
            </h1>
            <p className="mt-5 text-lg text-text-muted">
              From business software and creative production to career-focused SAP learning,
              MuForge brings the right expertise to your next step.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <article
                key={service.title}
                className="reveal flex h-full flex-col overflow-hidden rounded-card border border-border bg-surface transition duration-200 hover:-translate-y-0.5 hover:border-border-strong"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-surface-2">
                  <Image
                    src={service.image}
                    alt={service.alt}
                    fill
                    sizes="(max-width: 639px) 92vw, (max-width: 1023px) 46vw, 31vw"
                    priority={index < 3}
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h2 className="text-h3 font-semibold text-text">{service.title}</h2>
                  <p className="mt-2 flex-1 text-sm text-text-muted">{service.description}</p>
                  <Link
                    href="/contact"
                    className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ember transition-colors duration-200 hover:text-ember-hover"
                    aria-label={`Enquire about ${service.title}`}
                  >
                    Explore service
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface-2 py-section">
        <div className="section-shell flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div>
            <span className="eyebrow">Have a project in mind?</span>
            <h2 className="mt-5 max-w-measure section-heading">
              Let’s find the right solution for your business.
            </h2>
          </div>
          <Link href="/contact" className="primary-button shrink-0">
            Discuss your project
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
