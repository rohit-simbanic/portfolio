"use client";
import { useEffect, useRef, useState } from "react";

type AboutProps = {
  data?: {
    location: string;
    bioParagraphs: string[];
    facts: Array<{ emoji: string; label: string; sub: string }>;
    philosophy: { ship: string; code: string; users: string };
  };
};

const DEFAULT_FACTS = [
  { emoji: "🎓", label: "B.S. Computer Science", sub: "UC Berkeley, 2019" },
  { emoji: "☕", label: "Coffee Consumed", sub: "~2,847 cups & counting" },
  { emoji: "🌍", label: "Time Zones Worked In", sub: "PST, EST, CET, IST" },
  { emoji: "📦", label: "npm Packages Published", sub: "7 open-source libs" },
];

const DEFAULT_BIO = [
  "I'm a full-stack developer based in Bengaluru, India with a love for building things that live on the internet. I started my coding journey at 14, hacking together Minecraft mods, and never looked back.",
  "Today, I work across the entire stack—from architecting databases and REST APIs, to building polished React interfaces that feel native. I'm particularly passionate about developer experience, web performance, and accessible design.",
  "When I'm not pushing commits, you'll find me on hiking trails, experimenting with espresso recipes, or contributing to open-source projects."
];

export default function About({ data }: AboutProps) {
  const bioParagraphs = data?.bioParagraphs || DEFAULT_BIO;
  const facts = data?.facts || DEFAULT_FACTS;
  const philosophy = data?.philosophy || { ship: "early & often", code: "readable first", users: "always" };
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="about" ref={ref} className="py-28 bg-cream-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          {/* Left - text */}
          <div className={`space-y-8 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div>
              <p className="font-mono text-sm text-citrus-500 tracking-widest uppercase mb-3">01. About Me</p>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-ink-900 leading-tight">
                Turning ideas into<br />
                <span className="italic text-citrus-500">living</span> products.
              </h2>
            </div>
            <div className="space-y-4 text-ink-600 text-lg leading-relaxed">
              {bioParagraphs.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 font-medium text-citrus-600 hover:gap-4 transition-all duration-300 border-b-2 border-citrus-400 pb-1"
            >
              Let's build something together →
            </a>
          </div>

          {/* Right - facts grid */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 transition-all duration-700 delay-200 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            {facts.map((fact, i) => (
              <div
                key={fact.label}
                className="bg-cream-50 rounded-2xl p-6 border border-cream-200 hover:border-citrus-400/50 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <span className="text-3xl block mb-3">{fact.emoji}</span>
                <p className="font-display font-semibold text-ink-900 text-sm leading-snug">{fact.label}</p>
                <p className="text-xs text-ink-400 mt-1 font-mono">{fact.sub}</p>
              </div>
            ))}

            {/* Wide bottom card */}
            <div className="col-span-1 sm:col-span-2 bg-[#1E1E1E] border border-neutral-800 rounded-2xl p-4 sm:p-6 text-cream-50">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-3 h-3 rounded-full bg-rose-400" />
                <span className="w-3 h-3 rounded-full bg-citrus-400" />
                <span className="w-3 h-3 rounded-full bg-sage-400" />
                <span className="font-mono text-xs text-neutral-500 ml-1">~/alex/philosophy.txt</span>
              </div>
              <p className="font-mono text-xs sm:text-sm text-neutral-200 leading-relaxed whitespace-pre-wrap break-all">
                <span className="text-citrus-400">const</span>{" "}
                <span className="text-sage-400">philosophy</span> = {"{"}
                <br />
                &nbsp;&nbsp;ship: <span className="text-rose-400">"{philosophy.ship}"</span>,
                <br />
                &nbsp;&nbsp;code: <span className="text-rose-400">"{philosophy.code}"</span>,
                <br />
                &nbsp;&nbsp;users: <span className="text-rose-400">"{philosophy.users}"</span>
                <br />
                {"}"};
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
