"use client";
import { useEffect, useRef, useState } from "react";

type SkillsProps = {
  data?: {
    skillGroups: Array<{
      category: string;
      color: string;
      textColor: string;
      bgColor: string;
      skills: Array<{ name: string; level: number }>;
    }>;
    techPills: string[];
  };
};

const DEFAULT_GROUPS = [
  {
    category: "Frontend",
    color: "bg-citrus-400",
    textColor: "text-citrus-600",
    bgColor: "bg-citrus-400/10",
    skills: [
      { name: "React / Next.js", level: 95 },
      { name: "TypeScript", level: 90 },
      { name: "Tailwind CSS", level: 92 },
      { name: "Framer Motion", level: 80 },
    ],
  },
  {
    category: "Backend",
    color: "bg-sage-500",
    textColor: "text-sage-600",
    bgColor: "bg-sage-400/10",
    skills: [
      { name: "Node.js / Express", level: 88 },
      { name: "MongoDB", level: 82 },
      { name: "REST API", level: 78 },
      { name: "Redis/Dragonfly", level: 72 },
    ],
  },
  {
    category: "Tools & Cloud",
    color: "bg-sky-500",
    textColor: "text-sky-600",
    bgColor: "bg-sky-400/10",
    skills: [
      { name: "AWS / Vercel", level: 85 },
      { name: "Docker", level: 80 },
      { name: "Git / CI/CD", level: 90 },
      { name: "Figma", level: 75 },
    ],
  },
];

const DEFAULT_PILLS = [
  "React", "Next.js", "TypeScript", "Node.js", "PostgreSQL",
  "Redis", "GraphQL", "Docker", "AWS", "Tailwind", "Prisma",
  "Jest", "Cypress", "Figma", "Git", "Linux",
];

function SkillBar({ name, level, color, delay }: { name: string; level: number; color: string; delay: number }) {
  const [animated, setAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setTimeout(() => setAnimated(true), delay); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-ink-800">{name}</span>
        <span className="font-mono text-ink-400">{level}%</span>
      </div>
      <div className="h-1.5 bg-cream-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: animated ? `${level}%` : "0%" }}
        />
      </div>
    </div>
  );
}

export default function Skills({ data }: SkillsProps) {
  const skillGroups = data?.skillGroups || DEFAULT_GROUPS;
  const techPills = data?.techPills || DEFAULT_PILLS;
  return (
    <section id="skills" className="py-28 bg-cream-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="font-mono text-sm text-citrus-500 tracking-widest uppercase mb-3">02. Skills</p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-ink-900">My tech toolbox</h2>
          <p className="text-ink-400 mt-4 max-w-lg mx-auto">
            A curated set of tools and technologies I've honed over 5+ years of building for the web.
          </p>
        </div>

        {/* Skill groups */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {skillGroups.map((group) => (
            <div key={group.category} className={`${group.bgColor} rounded-3xl p-5 sm:p-6 border border-cream-200`}>
              <div className="flex items-center gap-2 mb-6">
                <span className={`w-2.5 h-2.5 rounded-full ${group.color}`} />
                <h3 className={`font-display font-semibold text-lg ${group.textColor}`}>
                  {group.category}
                </h3>
              </div>
              <div className="space-y-5">
                {group.skills.map((skill, i) => (
                  <SkillBar
                    key={skill.name}
                    name={skill.name}
                    level={skill.level}
                    color={group.color}
                    delay={i * 150}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Marquee tech pills */}
        <div className="overflow-hidden">
          <p className="text-center text-sm text-ink-400 font-mono mb-6 tracking-widest uppercase">
            Also worked with
          </p>
          <div className="flex gap-3 animate-marquee whitespace-nowrap">
            {[...techPills, ...techPills].map((tech, i) => (
              <span
                key={i}
                className="inline-flex items-center bg-cream-50 border border-cream-200 text-ink-800 font-mono text-sm px-4 py-2 rounded-full shadow-sm flex-shrink-0"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
