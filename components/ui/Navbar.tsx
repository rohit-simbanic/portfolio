"use client";
import { useEffect, useState } from "react";
import { clsx } from "clsx";
import PayMeButton from "./PayMeButton";

const links = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMounted(true);
    const savedTheme = (localStorage.getItem("theme") as "dark" | "light") || "dark";
    setTheme(savedTheme);
    if (savedTheme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  };

  const themeToggleBtn = (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-full hover:bg-cream-200 transition-all duration-300 text-ink-600 hover:text-citrus-500 hover:scale-105 active:scale-95 flex items-center justify-center border border-transparent hover:border-cream-200"
      aria-label="Toggle theme"
    >
      {!mounted ? (
        <div className="w-5 h-5 rounded-full border border-dashed border-ink-600/30" />
      ) : theme === "dark" ? (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );

  return (
    <header
      className={clsx(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-cream-100/90 backdrop-blur-md border-b border-cream-200 py-3"
          : "bg-transparent py-6",
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Logo */}
        <a
          href="/"
          className="font-display text-xl font-bold text-ink-900 tracking-tight"
        >
          <span className="text-citrus-500">R</span>ohit.
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-ink-600 hover:text-citrus-500 transition-colors relative group"
            >
              {link.label}
              <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-citrus-400 transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium bg-ink-900 text-cream-50 px-4 py-2 rounded-full hover:bg-citrus-500 hover:text-ink-900 transition-all duration-300"
          >
            Resume ↗
          </a>
          <PayMeButton />
          {themeToggleBtn}
        </nav>

        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2"
          aria-label="Toggle menu"
        >
          <span
            className={clsx(
              "block w-5 h-px bg-ink-900 transition-all duration-300",
              menuOpen && "rotate-45 translate-y-2",
            )}
          />
          <span
            className={clsx(
              "block w-5 h-px bg-ink-900 transition-all duration-300",
              menuOpen && "opacity-0",
            )}
          />
          <span
            className={clsx(
              "block w-5 h-px bg-ink-900 transition-all duration-300",
              menuOpen && "-rotate-45 -translate-y-2",
            )}
          />
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={clsx(
          "md:hidden overflow-hidden transition-all duration-500",
          menuOpen ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <nav className="px-4 sm:px-6 pt-4 pb-6 flex flex-col gap-4 bg-cream-100/95 backdrop-blur-md border-b border-cream-200">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-base font-medium text-ink-800 hover:text-citrus-500 transition-colors py-1"
            >
              {link.label}
            </a>
          ))}
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium bg-ink-900 text-cream-50 px-4 py-2.5 rounded-full text-center hover:bg-citrus-500 hover:text-ink-900 transition-all"
          >
            Resume ↗
          </a>
          <div className="flex items-center justify-between gap-4">
            <PayMeButton />
            {themeToggleBtn}
          </div>
        </nav>
      </div>
    </header>
  );
}
