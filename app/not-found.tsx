export default function NotFound() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-ink-900 relative overflow-hidden">
      {/* background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-citrus-400/10 blur-[150px] rounded-full" />

      <div className="relative text-center space-y-6 px-6">
        <h1 className="font-display text-[120px] font-bold text-citrus-400">
          404
        </h1>

        <h2 className="text-3xl font-semibold text-cream-50">Lost in space</h2>

        <p className="text-ink-400 max-w-md mx-auto">
          The page you're trying to reach doesn’t exist. Maybe it drifted into
          another galaxy.
        </p>

        <a
          href="/"
          className="inline-flex items-center gap-2 bg-citrus-400 text-ink-900 px-6 py-3 rounded-xl font-semibold hover:bg-citrus-500 transition"
        >
          ← Back to home
        </a>
      </div>
    </section>
  );
}
