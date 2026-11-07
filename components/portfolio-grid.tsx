"use client";

import Image from "next/image";
import { ArrowUpRight, Layers3 } from "lucide-react";
import { useMemo, useState } from "react";

const categories = [
  "All",
  "Software Development",
  "Website Development",
  "Business Automation",
  "Digital Solutions",
] as const;

type Category = (typeof categories)[number];

type Project = {
  title: string;
  category: Exclude<Category, "All">;
  summary: string;
  problem: string;
  solution: string;
  technologies: string[];
  image: string;
  demo?: string;
};

const projects: Project[] = [
  {
    title: "Operations Dashboard",
    category: "Software Development",
    summary: "Business visibility dashboard for a manufacturing workflow.",
    problem: "Manual tracking slowed reporting and decisions.",
    solution: "Built a centralized dashboard with KPI tracking, filters, and role-based insights.",
    technologies: ["Next.js", "TypeScript", "API Integrations"],
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "B2B Website Refresh",
    category: "Website Development",
    summary: "A professional corporate website focused on lead generation.",
    problem: "The website did not clearly explain services or trust-building messages.",
    solution: "Created a cleaner information architecture and stronger conversion journeys.",
    technologies: ["WordPress", "SEO", "UX Copy"],
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80",
    demo: "https://example.com",
  },
  {
    title: "Procurement Workflow Automation",
    category: "Business Automation",
    summary: "Streamlined purchase requests and approval cycles.",
    problem: "Requests were moving across multiple teams without standard tracking.",
    solution: "Automated the request flow, approval logic, and reporting structure.",
    technologies: ["Automation", "Process Mapping", "Dashboards"],
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Digital Brand Launch Kit",
    category: "Digital Solutions",
    summary: "Content system to improve online visibility for a growing brand.",
    problem: "The brand lacked a consistent digital presence and conversion-focused messaging.",
    solution: "Delivered a structured digital marketing and content plan, including campaign creative support.",
    technologies: ["Brand Strategy", "Content Planning", "Social Design"],
    image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=900&q=80",
  },
];

export function PortfolioGrid() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");

  const filteredProjects = useMemo(() => {
    if (activeCategory === "All") return projects;
    return projects.filter((project) => project.category === activeCategory);
  }, [activeCategory]);

  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-3">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActiveCategory(category)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              activeCategory === category
              ? "border-[var(--button)] bg-[var(--button)] text-on-ember"
              : "border-[var(--border)] bg-white text-[var(--body)] hover:border-[var(--accent)] hover:text-[var(--heading)]"
            }`}
            aria-pressed={activeCategory === category}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredProjects.map((project) => (
          <article key={project.title} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_50px_rgba(18,63,70,0.06)]">
            <div className="relative h-56 overflow-hidden">
              <Image src={project.image} alt={project.title} width={900} height={700} className="h-full w-full object-cover transition duration-500 hover:scale-105" />
              <span className="absolute left-4 top-4 rounded-control bg-ember px-3 py-1 text-2xs font-semibold uppercase text-on-ember">
                {project.category}
              </span>
            </div>
            <div className="space-y-5 p-6">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xl font-semibold text-slate-950">{project.title}</h3>
                {project.demo ? (
                  <a href={project.demo} target="_blank" rel="noreferrer" aria-label={`View demo for ${project.title}`} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-[var(--body)] transition hover:border-[var(--accent)] hover:text-[var(--heading)]">
                    <ArrowUpRight size={16} />
                  </a>
                ) : (
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-400">
                    <Layers3 size={16} />
                  </div>
                )}
              </div>
              <p className="text-sm leading-7 text-slate-600">{project.summary}</p>
              <div className="space-y-3 text-sm text-slate-600">
                <p><span className="font-semibold text-slate-900">Problem:</span> {project.problem}</p>
                <p><span className="font-semibold text-slate-900">Solution:</span> {project.solution}</p>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {project.technologies.map((tech) => (
                  <span key={tech} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
