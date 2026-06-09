"use client";
import { useState } from "react";
import { clsx } from "clsx";
import CodeViewerModal from "@/components/ui/CodeViewerModal";

type Project = {
  title: string;
  description: string;
  tags: string[];
  category: string;
  link: string;
  secondaryLink?: string;
  liveLink?: string;
  featured?: boolean;
  year: string;
  image: string;
  accent: string;
};

type ProjectsProps = {
  data?: Project[];
};

const DEFAULT_PROJECTS: Project[] = [
  {
    title: "Versa — Design System",
    description:
      "A comprehensive React component library with 80+ components, full a11y support, dark mode, and a Storybook playground. Used by 3 startups in production.",
    tags: ["React", "TypeScript", "Storybook", "Radix UI"],
    category: "Open Source",
    accent: "bg-citrus-400",
    link: "https://github.com/octocat/Spoon-Knife",
    featured: true,
    year: "2024",
    image:
      "https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=800&q=80",
  },
  {
    title: "Fieldr — SaaS Platform",
    description:
      "Field service management platform with real-time scheduling, route optimization, invoicing, and mobile-first technician app.",
    tags: ["Next.js", "PostgreSQL", "Mapbox", "Stripe"],
    category: "SaaS",
    accent: "bg-emerald-500",
    link: "https://github.com",
    featured: true,
    year: "2024",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
  },
  {
    title: "Pulse — Analytics Dashboard",
    description:
      "Real-time analytics dashboard with customizable widgets, AI-powered insights, and team collaboration. Processes 10M+ events/day.",
    tags: ["React", "D3.js", "Redis", "WebSockets"],
    category: "Data",
    accent: "bg-sky-500",
    link: "https://github.com",
    featured: true,
    year: "2023",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
  },
  {
    title: "Snippr — Code Sharing",
    description:
      "Beautiful code snippet sharing tool with syntax highlighting, version history, and team workspaces.",
    tags: ["Next.js", "Prisma", "Vercel"],
    category: "Tool",
    accent: "bg-rose-400",
    link: "https://github.com",
    year: "2023",
    image:
      "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&q=80",
  },
  {
    title: "Budgetr — Finance Tracker",
    description:
      "Personal finance app with bank sync, smart categorization, and goal tracking. 2k+ active users.",
    tags: ["React Native", "Plaid API", "Node.js"],
    category: "Mobile",
    accent: "bg-violet-500",
    link: "https://github.com",
    year: "2022",
    image:
      "https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=800&q=80",
  },
  {
    title: "Writr — Blog CMS",
    description:
      "Headless CMS tailored for developer blogs, with MDX support, SEO toolkit, and one-click Vercel deploy.",
    tags: ["Next.js", "MDX", "Tailwind", "Vercel"],
    category: "Open Source",
    accent: "bg-amber-400",
    link: "https://github.com",
    year: "2022",
    image:
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80",
  },
  {
    title: "Vaultkey",
    description:
      "Self-hosted password manager with end-to-end encryption, browser extensions, and team sharing capabilities.",
    tags: ["Rust", "React", "SQLite", "Docker"],
    category: "Open Source",
    accent: "bg-emerald-500",
    link: "https://github.com",
    year: "2023",
    image:
      "https://images.unsplash.com/photo-1633265486064-086b219458ec?w=800&q=80",
  },
  {
    title: "Pixelsnap",
    description:
      "Lightweight screenshot annotation tool for macOS with instant cloud uploads and shareable links.",
    tags: ["Swift", "CloudKit", "AppKit"],
    category: "Tool",
    accent: "bg-rose-500",
    link: "https://github.com",
    year: "2023",
    image:
      "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80",
  },
  {
    title: "Formlayer",
    description:
      "API-first form backend with spam filtering, webhooks, file uploads, and a dashboard for submissions.",
    tags: ["Node.js", "PostgreSQL", "Redis", "Stripe"],
    category: "SaaS",
    accent: "bg-violet-500",
    link: "https://github.com",
    year: "2022",
    image:
      "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&q=80",
  },
  {
    title: "Driftwood",
    description:
      "Minimalist habit tracker with streak visualizations, daily reminders, and offline-first sync.",
    tags: ["Flutter", "Dart", "Hive", "Firebase"],
    category: "Mobile",
    accent: "bg-sky-500",
    link: "https://github.com",
    year: "2024",
    image:
      "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&q=80",
  },
  {
    title: "Stackblueprint",
    description:
      "Interactive CLI for scaffolding full-stack projects with pre-configured auth, database, and CI/CD.",
    tags: ["TypeScript", "Inquirer", "Prisma", "GitHub Actions"],
    category: "Tool",
    accent: "bg-orange-500",
    link: "https://github.com",
    year: "2023",
    image:
      "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&q=80",
  },
  {
    title: "Chartpilot",
    description:
      "Dashboard builder that turns SQL queries into embeddable, auto-refreshing charts and reports.",
    tags: ["Python", "FastAPI", "D3.js", "DuckDB"],
    category: "Open Source",
    accent: "bg-teal-500",
    link: "https://github.com",
    year: "2024",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
  },
];

const categories = ["All", "Open Source", "SaaS", "Data", "Tool", "Mobile"];

export default function Projects({ data }: ProjectsProps) {
  const projects = data || DEFAULT_PROJECTS;
  const INITIAL_REST_COUNT = 3;
  const BATCH_SIZE = 3;

  const [showCount, setShowCount] = useState(INITIAL_REST_COUNT);
  const [active, setActive] = useState("All");
  const [hovered, setHovered] = useState<string | null>(null);
  const [activeCodeViewer, setActiveCodeViewer] = useState<{
    url: string;
    secondaryUrl?: string;
    liveUrl?: string;
    name: string;
  } | null>(null);

  const handleProjectLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, project: Project) => {
    if (project.link && project.link.includes("github.com")) {
      e.preventDefault();
      setActiveCodeViewer({
        url: project.link,
        secondaryUrl: project.secondaryLink,
        liveUrl: project.liveLink,
        name: project.title,
      });
    }
  };

  const filtered =
    active === "All" ? projects : projects.filter((p) => p.category === active);

  const featured = filtered.filter((p) => p.featured);
  const rest = filtered.filter((p) => !p.featured);

  const visibleRest = rest.slice(0, showCount);
  const hiddenCount = rest.length - showCount;
  const hasMore = hiddenCount > 0;

  const handleShowMore = () => {
    setShowCount((c) => c + BATCH_SIZE);
  };

  const handleCollapse = () => {
    setShowCount(INITIAL_REST_COUNT);
  };

  return (
    <section id="projects" className="py-28 bg-cream-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* ── HEADER ── */}
        <div className="relative mb-16">
          <span
            className="absolute -top-6 -left-2 font-display font-black text-[5rem] sm:text-[6rem] md:text-[8rem] leading-none text-ink-900/[0.04] select-none pointer-events-none"
            aria-hidden
          >
            03
          </span>
          <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="font-mono text-xs text-citrus-500 tracking-[0.25em] uppercase mb-3">
                03 / Projects
              </p>
              <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-black text-ink-900 leading-[1.05] tracking-tight">
                Things I've
                <br />
                <span className="italic font-light">built.</span>
              </h2>
            </div>
            <div className="flex flex-col items-start md:items-end gap-3">
              <p className="font-mono text-xs text-ink-400 md:text-right leading-relaxed">
                {projects.length} projects · {categories.length - 1} categories
              </p>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 text-sm font-semibold text-ink-800 hover:text-citrus-600 transition-colors"
              >
                <span className="border-b border-ink-300 group-hover:border-citrus-400 pb-px transition-colors">
                  All on GitHub
                </span>
                <span className="text-base group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform inline-block">
                  ↗
                </span>
              </a>
            </div>
          </div>
          <div className="mt-8 h-px bg-gradient-to-r from-ink-900/20 via-ink-900/5 to-transparent" />
        </div>

        {/* ── FILTER TABS ── */}
        <div className="flex flex-wrap gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={clsx(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                active === cat
                  ? "bg-ink-900 text-cream-50 shadow-md shadow-ink-900/20"
                  : "bg-cream-50 border border-cream-200 text-ink-600 hover:border-ink-300 hover:bg-cream-100",
              )}
            >
              {cat}
              {cat !== "All" && (
                <span
                  className={clsx(
                    "ml-2 text-[10px] font-mono",
                    active === cat ? "opacity-70" : "opacity-40",
                  )}
                >
                  {projects.filter((p) => p.category === cat).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── FEATURED CARDS (with full image header) ── */}
        {featured.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-5">
            {featured.map((project, i) => {
              const isHov = hovered === project.title;
              return (
                <a
                  key={project.title}
                  href={project.link}
                  onClick={(e) => handleProjectLinkClick(e, project)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => setHovered(project.title)}
                  onMouseLeave={() => setHovered(null)}
                  className={clsx(
                    "group relative flex flex-col bg-cream-50 rounded-3xl overflow-hidden border border-cream-200",
                    "transition-all duration-500 ease-out",
                    isHov
                      ? "shadow-2xl shadow-ink-900/15 -translate-y-2"
                      : "shadow-sm",
                  )}
                >
                  {/* IMAGE */}
                  <div className="relative h-52 overflow-hidden bg-ink-200">
                    <img
                      src={project.image}
                      alt={project.title}
                      className={clsx(
                        "w-full h-full object-cover transition-all duration-700 ease-out",
                        isHov
                          ? "scale-110 brightness-75"
                          : "scale-100 brightness-90",
                      )}
                    />

                    {/* Dark gradient so title is always readable */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(26,18,8,0.90) 0%, rgba(26,18,8,0.35) 50%, rgba(26,18,8,0.05) 100%)",
                      }}
                    />

                    {/* Featured pill — top left */}
                    <span
                      className={clsx(
                        "absolute top-4 left-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-ink-900",
                        project.accent,
                      )}
                    >
                      ★ Featured
                    </span>

                    {/* Year — top right */}
                    <span className="absolute top-4 right-4 font-mono text-[11px] text-white/60 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-lg">
                      {project.year}
                    </span>

                    {/* Title overlay — bottom */}
                    <div className="absolute bottom-0 left-0 right-0 px-5 pb-4 pt-8">
                      <p className="font-mono text-[10px] text-white/40 tracking-widest uppercase mb-1">
                        {String(i + 1).padStart(2, "0")} · {project.category}
                      </p>
                      <h3 className="font-display text-xl font-bold text-white leading-snug">
                        {project.title}
                      </h3>
                    </div>
                  </div>

                  {/* CARD BODY */}
                  <div className="flex flex-col flex-1 p-5">
                    <p className="text-ink-500 text-sm leading-relaxed mb-4 flex-1">
                      {project.description}
                    </p>

                    {/* Tags + Arrow */}
                    <div className="flex items-end justify-between gap-3">
                      <div className="flex flex-wrap gap-1.5">
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="font-mono text-[10px] bg-cream-100 text-ink-600 px-2 py-0.5 rounded-md border border-cream-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div
                        className={clsx(
                          "w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                          isHov
                            ? `${project.accent} text-ink-900 scale-110`
                            : "bg-cream-100 text-ink-400 border border-cream-200",
                        )}
                      >
                        ↗
                      </div>
                    </div>
                  </div>

                  {/* Bottom accent line */}
                  <div
                    className={clsx(
                      "h-0.5 transition-all duration-500",
                      project.accent,
                      isHov ? "opacity-100" : "opacity-0",
                    )}
                  />
                </a>
              );
            })}
          </div>
        )}

        {/* ── LIST ROWS with thumbnails ── */}
        {visibleRest.length > 0 && (
          <div className="space-y-3">
            {visibleRest.map((project, i) => {
              const isHov = hovered === project.title;
              return (
                <a
                  key={project.title}
                  href={project.link}
                  onClick={(e) => handleProjectLinkClick(e, project)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => setHovered(project.title)}
                  onMouseLeave={() => setHovered(null)}
                  className={clsx(
                    "group relative flex flex-col min-[400px]:flex-row items-stretch min-[400px]:items-center gap-0 bg-cream-50 rounded-2xl border border-cream-200 overflow-hidden",
                    "transition-all duration-300",
                    isHov
                      ? "shadow-xl shadow-ink-900/8 -translate-y-0.5 border-ink-900/8"
                      : "",
                  )}
                >
                  {/* Left accent bar on hover */}
                  <div
                    className={clsx(
                      "absolute left-0 top-0 bottom-0 w-1 z-10 transition-all duration-300",
                      project.accent,
                      isHov ? "opacity-100" : "opacity-0",
                    )}
                  />

                  {/* THUMBNAIL */}
                  <div className="relative w-full min-[400px]:w-32 sm:w-40 h-32 min-[400px]:h-24 flex-shrink-0 overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.title}
                      className={clsx(
                        "w-full h-full object-cover transition-all duration-500",
                        isHov
                          ? "scale-110 brightness-80"
                          : "scale-100 brightness-95",
                      )}
                    />
                    {/* Right-side fade into white card background */}
                    <div
                      className="absolute inset-0 hidden min-[400px]:block"
                      style={{
                        background:
                          "linear-gradient(to right, transparent 50%, rgb(var(--cream-50)) 100%)",
                      }}
                    />
                    {/* Category accent dot */}
                    <div
                      className={clsx(
                        "absolute top-2 left-3 w-2 h-2 rounded-full ring-2 ring-white/80",
                        project.accent,
                      )}
                    />
                  </div>

                  {/* Index */}
                  <span className="font-mono text-xs text-ink-300 w-8 flex-shrink-0 hidden md:block pl-2">
                    {String(featured.length + i + 1).padStart(2, "0")}
                  </span>

                  {/* Title + desc */}
                  <div className="flex-1 min-w-0 py-3 px-4 min-[400px]:py-4 min-[400px]:px-3">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display font-bold text-ink-900 text-base leading-tight truncate">
                        {project.title}
                      </h3>
                      <span
                        className={clsx(
                          "hidden sm:block font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold text-ink-900",
                          project.accent,
                          "opacity-90",
                        )}
                      >
                        {project.category}
                      </span>
                    </div>
                    <p className="text-ink-400 text-xs leading-relaxed line-clamp-1">
                      {project.description}
                    </p>
                  </div>

                  {/* Tags (desktop) */}
                  <div className="hidden lg:flex flex-wrap gap-1.5 flex-shrink-0 max-w-[220px] px-4">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="font-mono text-[10px] bg-cream-100 text-ink-500 px-2 py-0.5 rounded-md border border-cream-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Year + arrow */}
                  <div className="flex items-center gap-3 pr-4 pb-4 min-[400px]:pr-6 min-[400px]:pb-0 justify-end min-[400px]:justify-start flex-shrink-0">
                    <span className="font-mono text-xs text-ink-300 hidden md:block">
                      {project.year}
                    </span>
                    <span
                      className={clsx(
                        "text-sm transition-all duration-200",
                        isHov
                          ? "translate-x-0.5 -translate-y-0.5 text-ink-700"
                          : "text-ink-300",
                      )}
                    >
                      ↗
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        )}
        {(hasMore || showCount > INITIAL_REST_COUNT) && (
          <div className="flex flex-col items-center gap-3 mt-12">
            {hasMore && (
              <button
                onClick={handleShowMore}
                className="group relative inline-flex items-center gap-3 bg-cream-50 border-2 border-cream-200 hover:border-ink-900 text-ink-700 hover:text-ink-900 font-semibold text-sm px-7 py-3.5 rounded-full transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden"
              >
                {/* hover fill */}
                <span className="absolute inset-0 bg-ink-900 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />

                <span className="relative group-hover:text-cream-50 flex items-center gap-3 transition-colors">
                  Show {Math.min(hiddenCount, BATCH_SIZE)} more
                  <span className="flex flex-col gap-0.5">
                    <span className="block w-4 h-px bg-current" />
                    <span className="block w-4 h-px bg-current" />
                  </span>
                </span>

                {hiddenCount > BATCH_SIZE && (
                  <span className="relative bg-citrus-400 text-ink-900 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full">
                    +{hiddenCount}
                  </span>
                )}
              </button>
            )}

            {showCount > INITIAL_REST_COUNT && (
              <button
                onClick={handleCollapse}
                className="font-mono text-xs text-ink-400 hover:text-ink-700 transition-colors flex items-center gap-1.5"
              >
                ↑ Show less
              </button>
            )}

            {/* progress bar */}
            <div className="flex items-center gap-2 mt-1">
              <div className="h-1 w-24 bg-cream-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-citrus-400 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min((showCount / rest.length) * 100, 100)}%`,
                  }}
                />
              </div>
              <span className="font-mono text-[10px] text-ink-400">
                {Math.min(showCount, rest.length)} / {rest.length}
              </span>
            </div>
          </div>
        )}
        {filtered.length === 0 && (
          <div className="py-24 text-center">
            <p className="font-mono text-sm text-ink-400">
              No projects in this category.
            </p>
          </div>
        )}

        {/* FOOTER RULE */}
        <div className="mt-14 flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-ink-900/10 to-transparent" />
          <span className="font-mono text-[10px] text-ink-300 tracking-widest uppercase">
            {filtered.length} project{filtered.length !== 1 ? "s" : ""}
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-ink-900/10 to-transparent" />
        </div>
      </div>

      {activeCodeViewer && (
        <CodeViewerModal
          githubUrl={activeCodeViewer.url}
          secondaryGithubUrl={activeCodeViewer.secondaryUrl}
          liveLink={activeCodeViewer.liveUrl}
          projectName={activeCodeViewer.name}
          onClose={() => setActiveCodeViewer(null)}
        />
      )}
    </section>
  );
}
