export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-cream-200 border-t border-cream-200/30 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="font-display text-lg font-bold text-ink-900">
          <span className="text-citrus-500">R</span>ohit.
        </p>
        <p className="text-xs sm:text-sm text-ink-600 font-mono">
          © {year} Rohit Mondal — Built with Next.js & Tailwind
        </p>
        <div className="flex gap-6">
          {[
            { label: "GitHub", href: "https://github.com/rohit-simbanic" },
            { label: "LinkedIn", href: "https://www.linkedin.com/in/rohit-m-552776aa/" }
          ].map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs sm:text-sm text-ink-600 hover:text-citrus-500 transition-colors cursor-none"
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
