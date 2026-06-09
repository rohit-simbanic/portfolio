"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAdmin } from "@/lib/actions";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setError("");
    setLoading(true);

    try {
      const result = await loginAdmin(password);
      if (result.success) {
        router.push("/admin");
        router.refresh();
      } else {
        setError(result.error || "Login failed");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-cream-100 flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-cream-50 border border-cream-200 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Glow decorative shape */}
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-citrus-400/10 blur-2xl pointer-events-none" />

        <div className="mb-8 text-center">
          <span className="font-mono text-xs text-citrus-500 tracking-widest uppercase block mb-2">
            Control Panel
          </span>
          <h1 className="font-display text-3xl font-bold text-ink-900">
            Admin Authentication
          </h1>
          <p className="text-sm text-ink-400 mt-2">
            Enter the password to modify website contents
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-ink-600 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              className="w-full bg-cream-50 border border-cream-200 focus:border-citrus-400 text-ink-900 rounded-2xl px-4 py-3 text-sm outline-none transition-colors disabled:opacity-50"
            />
          </div>

          {error && (
            <p className="text-rose-500 font-mono text-xs bg-rose-50 border border-rose-100 rounded-xl px-4 py-2.5">
              ⚠️ {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 bg-ink-900 hover:bg-citrus-500 text-cream-50 hover:text-ink-900 disabled:opacity-50 font-semibold py-3.5 rounded-2xl transition-all duration-300 text-sm shadow-md"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-ink-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-xs text-ink-400 hover:text-citrus-500 transition-colors font-mono"
          >
            ← Back to Homepage
          </a>
        </div>
      </div>
    </main>
  );
}
