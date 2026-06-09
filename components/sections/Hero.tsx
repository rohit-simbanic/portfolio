"use client";
import { useEffect, useRef } from "react";

type HeroProps = {
  data?: {
    name: string;
    lastName: string;
    roles: string[];
    bio: string;
    badgeText: string;
  };
};

const DEFAULT_ROLES = [
  "Full-Stack Developer",
  "UI/UX Enthusiast",
  "Open Source Contributor",
  "Problem Solver",
];

export default function Hero({ data }: HeroProps) {
  const name = data?.name || "Rohit";
  const lastName = data?.lastName || "Mondal.";
  const roles = data?.roles || DEFAULT_ROLES;
  const bio = data?.bio || "I craft pixel-perfect interfaces and bulletproof backends. Passionate about turning complex problems into elegant, user-first experiences.";
  const badgeText = data?.badgeText || "Available for hire";

  const roleRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!roles || roles.length === 0) return;
    let i = 0;
    let charIndex = 0;
    let deleting = false;
    let timeout: NodeJS.Timeout;

    const type = () => {
      const current = roles[i];
      if (!roleRef.current || !current) return;

      if (!deleting) {
        roleRef.current.textContent = current.slice(0, charIndex + 1);
        charIndex++;
        if (charIndex === current.length) {
          deleting = true;
          timeout = setTimeout(type, 1800);
          return;
        }
      } else {
        roleRef.current.textContent = current.slice(0, charIndex - 1);
        charIndex--;
        if (charIndex === 0) {
          deleting = false;
          i = (i + 1) % roles.length;
        }
      }
      timeout = setTimeout(type, deleting ? 40 : 80);
    };

    timeout = setTimeout(type, 500);
    return () => clearTimeout(timeout);
  }, [roles]);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-cream-100">
      {/* Decorative shapes */}
      <div className="absolute top-24 right-12 w-64 h-64 rounded-full bg-citrus-400/20 blur-3xl animate-float" />
      <div
        className="absolute bottom-24 left-12 w-48 h-48 rounded-full bg-sage-400/20 blur-3xl animate-float"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full bg-rose-400/15 blur-2xl animate-float"
        style={{ animationDelay: "4s" }}
      />

      {/* Grid pattern */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(var(--ink-900), 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--ink-900), 0.035) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-16 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-cream-50 border border-cream-200 rounded-full px-4 py-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-sage-500 animate-pulse" />
              <span className="text-sm font-medium text-ink-600">
                {badgeText}
              </span>
            </div>

            {/* Heading */}
            <div>
              <p className="text-ink-400 font-body text-lg mb-2 tracking-wide">
                Hello, I'm
              </p>
              <h1 className="font-display text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-none tracking-tight text-ink-900">
                {name}
                <br />
                <span className="text-citrus-500">{lastName}</span>
              </h1>
            </div>

            {/* Typewriter */}
            <div className="flex items-center gap-3 h-8">
              <span className="w-1 h-6 bg-citrus-400 rounded-full animate-pulse" />
              <span ref={roleRef} className="font-mono text-base sm:text-lg text-ink-600" />
            </div>

            {/* Bio */}
            <p className="text-ink-600 text-base sm:text-lg leading-relaxed max-w-md">
              {bio}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <a
                href="#projects"
                className="group inline-flex items-center gap-2 bg-ink-900 text-cream-50 px-6 py-3.5 rounded-full font-medium hover:bg-citrus-500 hover:text-ink-900 transition-all duration-300 shadow-lg hover:shadow-citrus-400/30 hover:shadow-xl"
              >
                View My Work
                <span className="group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </a>
              <a
                href="#contact"
                className="inline-flex items-center gap-2 border border-ink-900 text-ink-900 px-6 py-3.5 rounded-full font-medium hover:bg-ink-900 hover:text-cream-50 transition-all duration-300"
              >
                Let's Talk
              </a>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-4 sm:gap-6 pt-2">
              {[
                { label: "GitHub", href: "https://github.com/rohit-simbanic" },
                { label: "LinkedIn", href: "https://www.linkedin.com/in/rohit-m-552776aa/" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs sm:text-sm text-ink-400 hover:text-citrus-500 font-medium transition-colors border-b border-transparent hover:border-citrus-400 pb-px cursor-none"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Right - Visual card */}
          <div className="relative hidden lg:flex justify-center items-center">
            {/* Main card */}
            <div className="relative w-80 h-96 rounded-3xl bg-ink-900 overflow-hidden shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
              {/* Card decoration */}
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-citrus-400/30" />
              <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-sage-400/20" />
              <div className="absolute inset-0 flex flex-col justify-end p-8">
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-citrus-400 flex items-center justify-center text-2xl font-display font-bold text-ink-900">
                    RM
                  </div>
                  <div>
                    <p className="text-cream-50 font-display text-2xl font-semibold">
                      Rohit Mondal
                    </p>
                    <p className="text-ink-400 text-sm mt-1">
                      Full-Stack Developer
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {["React", "Next.js", "Node", "TypeScript"].map((tag) => (
                      <span
                        key={tag}
                        className="text-xs font-mono bg-ink-800 text-citrus-400 px-2.5 py-1 rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating stat cards */}
            <div className="absolute -left-8 top-16 bg-cream-50 rounded-2xl shadow-xl p-4 animate-float">
              <p className="text-2xl font-display font-bold text-ink-900">3+</p>
              <p className="text-xs text-ink-400">Years Exp.</p>
            </div>
            <div
              className="absolute -right-4 bottom-24 bg-citrus-400 rounded-2xl shadow-xl p-4 animate-float"
              style={{ animationDelay: "1.5s" }}
            >
              <p className="text-2xl font-display font-bold text-ink-900">
                10+
              </p>
              <p className="text-xs text-ink-800 font-medium">Projects</p>
            </div>
            <div
              className="absolute right-8 top-8 bg-cream-50 rounded-2xl shadow-xl p-4 animate-float"
              style={{ animationDelay: "3s" }}
            >
              <p className="text-2xl font-display font-bold text-ink-900">
                5
              </p>
              <p className="text-xs text-ink-400">Clients</p>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
          <span className="text-xs font-mono text-ink-400 tracking-widest uppercase">
            Scroll
          </span>
          <div className="w-px h-12 bg-gradient-to-b from-ink-400 to-transparent" />
        </div>
      </div>
    </section>
  );
}
