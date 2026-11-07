"use client";

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
};

// Demonstration work, not client engagements: no photographs standing in for
// screens, and no live links until there is something real to link to.
const projects: Project[] = [
  {
    title: "Operations Dashboard",
    category: "Software Development",
    summary: "Business visibility dashboard for a manufacturing workflow.",
    problem: "Manual tracking slowed reporting and decisions.",
    solution:
      "Built a centralized dashboard with KPI tracking, filters, and role-based insights.",
    technologies: ["Next.js", "TypeScript", "API Integrations"],
  },
  {
    title: "B2B Website Refresh",
    category: "Website Development",
    summary: "A professional corporate website focused on lead generation.",
    problem: "The website did not clearly explain services or trust-building messages.",
    solution: "Created a cleaner information architecture and stronger conversion journeys.",
    technologies: ["WordPress", "SEO", "UX Copy"],
  },
  {
    title: "Procurement Workflow Automation",
    category: "Business Automation",
    summary: "Streamlined purchase requests and approval cycles.",
    problem: "Requests were moving across multiple teams without standard tracking.",
    solution: "Automated the request flow, approval logic, and reporting structure.",
    technologies: ["Automation", "Process Mapping", "Dashboards"],
  },
  {
    title: "Digital Brand Launch Kit",
    category: "Digital Solutions",
    summary: "Content system to improve online visibility for a growing brand.",
    problem: "The brand lacked a consistent digital presence and conversion-focused messaging.",
    solution:
      "Delivered a structured digital marketing and content plan, including campaign creative support.",
    technologies: ["Brand Strategy", "Content Planning", "Social Design"],
  },
];

export function PortfolioGrid() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");

  const filteredProjects = useMemo(
    () =>
      activeCategory === "All"
        ? projects
        : projects.filter((project) => project.category === activeCategory),
    [activeCategory],
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter projects by category">
        {categories.map((category) => {
          const active = activeCategory === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              aria-pressed={active}
              className={`rounded-control border px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                active
                  ? "border-ember bg-ember text-on-ember"
                  : "border-border text-text-muted hover:border-border-strong hover:text-text"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {filteredProjects.map((project) => (
          <article
            key={project.title}
            className="flex flex-col rounded-card border border-border bg-surface p-6 transition duration-200 hover:-translate-y-0.5 hover:border-border-strong"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-control bg-ember-wash px-2 py-1 text-2xs font-semibold uppercase text-ember">
                {project.category}
              </span>
              <span className="rounded-control border border-border px-2 py-1 text-2xs font-semibold uppercase text-text-muted">
                Demonstration
              </span>
            </div>

            <h2 className="mt-5 text-h3 font-semibold text-text">{project.title}</h2>
            <p className="mt-2 text-sm text-text-muted">{project.summary}</p>

            <dl className="mt-5 space-y-3 border-t border-border pt-4 text-sm">
              <div>
                <dt className="text-2xs font-semibold uppercase text-text-muted">Problem</dt>
                <dd className="mt-1 text-text-muted">{project.problem}</dd>
              </div>
              <div>
                <dt className="text-2xs font-semibold uppercase text-text-muted">Solution</dt>
                <dd className="mt-1 text-text-muted">{project.solution}</dd>
              </div>
            </dl>

            <ul className="mt-5 flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <li
                  key={tech}
                  className="rounded-control border border-border px-2 py-1 font-mono text-xs text-text-muted"
                >
                  {tech}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
