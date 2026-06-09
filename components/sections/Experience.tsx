"use client";
import { useEffect, useRef, useState } from "react";
import RippleBackground from "./RippleBackground";
import { Terminal } from "lucide-react";
import CodeViewerModal from "@/components/ui/CodeViewerModal";

type ExperienceNode = {
  role: string;
  company: string;
  period: string;
  type: string;
  description: string;
  highlights: string[];
  color: string;
  dot: string;
  tag: string;
  tagBg: string;
  project1Url?: string;
  project2Url?: string;
  project3Url?: string;
  project4Url?: string;
  project5Url?: string;
};

type ExperienceProps = {
  data?: ExperienceNode[];
};

const DEFAULT_EXPERIENCES: ExperienceNode[] = [
  {
    role: "Senior Full-Stack Engineer",
    company: "Stripe",
    period: "2022 — Present",
    type: "Full-time",
    description:
      "Leading frontend architecture for Stripe's merchant dashboard. Built real-time fraud detection UI processing 5M+ transactions/day. Mentored 4 junior engineers.",
    highlights: ["React", "TypeScript", "Go", "gRPC"],
    color: "bg-citrus-400",
    dot: "#E8890A",
    tag: "#C47208",
    tagBg: "#FEF3DC",
    project1Url: "https://github.com/octocat/Spoon-Knife",
    project2Url: "",
    project3Url: "",
    project4Url: "",
    project5Url: "",
  },
  {
    role: "Full-Stack Developer",
    company: "Linear",
    period: "2020 — 2022",
    type: "Full-time",
    description:
      "Contributed core features to Linear's project management tool. Owned the notification system and integrations layer (GitHub, Slack, Figma).",
    highlights: ["React", "GraphQL", "Electron", "PostgreSQL"],
    color: "bg-sage-500",
    dot: "#5A9470",
    tag: "#3D7354",
    tagBg: "#EAF3E8",
    project1Url: "",
    project2Url: "",
    project3Url: "",
    project4Url: "",
    project5Url: "",
  },
  {
    role: "Frontend Engineer",
    company: "Vercel",
    period: "2019 — 2020",
    type: "Full-time",
    description:
      "Worked on the Vercel dashboard and CLI tooling. Improved deploy pipeline UI, reducing perceived latency by 40% through optimistic updates and skeleton screens.",
    highlights: ["Next.js", "Node.js", "TypeScript"],
    color: "bg-sky-500",
    dot: "#4A90C4",
    tag: "#2E6FA8",
    tagBg: "#E6F1FB",
    project1Url: "",
    project2Url: "",
    project3Url: "",
    project4Url: "",
    project5Url: "",
  },
  {
    role: "Software Engineering Intern",
    company: "Figma",
    period: "Summer 2018",
    type: "Internship",
    description:
      "Shipped a prototype for collaborative cursor presence in Figma's canvas. Presented to the full engineering team at demo day.",
    highlights: ["TypeScript", "WebSockets", "Canvas API"],
    color: "bg-rose-400",
    dot: "#D4644A",
    tag: "#B54A30",
    tagBg: "#FAECE7",
    project1Url: "",
    project2Url: "",
    project3Url: "",
    project4Url: "",
    project5Url: "",
  },
];

// ── Hex → rgba helper ─────────────────────────────────────────────────────
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ── Main section ──────────────────────────────────────────────────────────
export default function Experience({ data }: ExperienceProps) {
  const experiences = data || DEFAULT_EXPERIENCES;
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [activeCodeViewer, setActiveCodeViewer] = useState<{ url: string; name: string } | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.08 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="experience"
      className="relative py-28 overflow-hidden bg-cream-100"
    >
      {/* ── Ripple background ── */}
      <RippleBackground />

      {/* Very subtle inner vignette so edges don't feel harsh */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background:
            "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(250,246,237,0.55) 100%)",
        }}
      />

      {/* ── Foreground ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="font-mono text-sm text-citrus-500 tracking-widest uppercase mb-3">
            04. Experience
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-ink-900">
            Where I've worked
          </h2>
        </div>

        {/* Timeline */}
        <div ref={ref} className="relative max-w-3xl mx-auto">
          {/* Line */}
          <div className="absolute left-4 md:left-6 top-0 bottom-0 w-px bg-cream-200" />

          <div className="space-y-4">
            {experiences.map((exp, i) => (
              <div
                key={exp.company}
                className={`relative pl-10 md:pl-16 transition-all duration-700 ${
                  visible
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-8"
                }`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                {/* Dot */}
                <div
                  className="absolute left-[6px] md:left-[14px] top-6 w-5 h-5 rounded-full ring-4 ring-cream-100"
                  style={{
                    background: exp.dot,
                    boxShadow: `0 0 0 4px #FAF6ED, 0 0 12px ${exp.dot}60`,
                  }}
                />

                {/* Card */}
                <div
                  className="rounded-2xl border p-4 sm:p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                  style={{
                    background: "var(--card-bg-glass)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    borderColor: "rgba(var(--cream-200), 0.4)",
                    boxShadow:
                      "0 2px 16px rgba(26,18,8,0.06), 0 1px 0 rgba(255,255,255,0.1) inset",
                  }}
                >
                  {/* Top row */}
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="font-display text-xl font-semibold text-ink-900">
                        {exp.role}
                      </h3>
                      <p
                        className="font-medium mt-0.5 text-sm"
                        style={{ color: exp.dot }}
                      >
                        {exp.company}
                      </p>
                    </div>
                    <div className="text-left sm:text-right flex-shrink-0">
                      <p className="font-mono text-sm text-ink-400">
                        {exp.period}
                      </p>
                      <span
                        className="text-xs px-2.5 py-0.5 rounded-full border font-medium mt-1 inline-block"
                        style={{
                          background: exp.tagBg,
                          borderColor: `${exp.dot}30`,
                          color: exp.tag,
                        }}
                      >
                        {exp.type}
                      </span>
                    </div>
                  </div>

                  <div
                    className="text-ink-600 text-sm leading-relaxed mb-4 prose-experience"
                    dangerouslySetInnerHTML={{ __html: exp.description }}
                  />

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {exp.highlights.map((tag) => (
                      <span
                        key={tag}
                        className="font-mono text-xs px-2.5 py-1 rounded-md border"
                        style={{
                          background: exp.tagBg,
                          borderColor: `${exp.dot}25`,
                          color: exp.tag,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Project buttons */}
                  {(exp.project1Url || exp.project2Url || exp.project3Url || exp.project4Url || exp.project5Url) && (
                    <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-cream-200/40 dark:border-neutral-800/40">
                      {[
                        exp.project1Url,
                        exp.project2Url,
                        exp.project3Url,
                        exp.project4Url,
                        exp.project5Url,
                      ].map((url, index) => {
                        if (!url) return null;
                        const projectNum = index + 1;
                        return (
                          <button
                            key={index}
                            onClick={() =>
                              setActiveCodeViewer({
                                url,
                                name: `${exp.company} - Project ${projectNum}`,
                              })
                            }
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-citrus-500/20 bg-citrus-500/5 hover:bg-citrus-500/10 text-citrus-600 dark:text-citrus-400 text-xs font-mono font-medium transition-all cursor-none"
                          >
                            <Terminal className="w-3.5 h-3.5" />
                            Project {projectNum} Code
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {activeCodeViewer && (
        <CodeViewerModal
          githubUrl={activeCodeViewer.url}
          projectName={activeCodeViewer.name}
          onClose={() => setActiveCodeViewer(null)}
        />
      )}
    </section>
  );
}
