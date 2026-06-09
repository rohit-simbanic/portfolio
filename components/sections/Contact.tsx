"use client";
import { useState } from "react";
import GlobeNetwork from "./GlobeNetwork";

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};
type Status = "idle" | "sending" | "sent" | "error";

export default function Contact() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (status === "error") {
      setStatus("idle");
      setErrorMessage("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(
          data.error ?? "Something went wrong. Please try again.",
        );
      setStatus("sent");
    } catch (err: unknown) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Failed to send. Please try again.",
      );
    }
  };

  const handleReset = () => {
    setStatus("idle");
    setErrorMessage("");
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <section id="contact" className="py-28 bg-cream-100 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-citrus-400/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-sage-500/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left */}
          <GlobeNetwork />
          <div className="space-y-8 relative z-10">
            <div>
              <p className="font-mono text-sm text-citrus-500 tracking-widest uppercase mb-3">
                05. Contact
              </p>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-ink-900 leading-tight">
                Got a project
                <br />
                in <span className="italic text-citrus-500">mind?</span>
              </h2>
            </div>
            <p className="text-ink-600 text-lg leading-relaxed max-w-md">
              Whether you want to build something new, collaborate on an
              open-source idea, or just have a chat — my inbox is always open.
            </p>

            <div className="space-y-4">
              {[
                {
                  label: "Email",
                  value: "rohit.simbanic2023@gmail.com",
                  href: "mailto:rohit.simbanic2023@gmail.com",
                },
                {
                  label: "LinkedIn",
                  value: "linkedin.com/in/rohit-m-552776aa",
                  href: "https://www.linkedin.com/in/rohit-m-552776aa/",
                },
                {
                  label: "GitHub",
                  value: "github.com/rohit-simbanic",
                  href: "https://github.com/rohit-simbanic",
                },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 group"
                >
                  <span className="text-xs font-mono text-ink-600 w-16 flex-shrink-0">
                    {item.label}
                  </span>
                  <span className="text-ink-800 group-hover:text-citrus-500 transition-colors font-medium border-b border-transparent hover:border-citrus-500 pb-px truncate">
                    {item.value}
                  </span>
                </a>
              ))}
            </div>

            <div className="inline-flex items-center gap-2.5 bg-cream-200 border border-cream-200/50 rounded-full px-4 py-2.5 sm:px-5 sm:py-3">
              <span className="w-2.5 h-2.5 rounded-full bg-sage-500 animate-pulse" />
              <span className="text-ink-800 text-xs sm:text-sm font-medium">
                Available for freelance — Q1 2025
              </span>
            </div>
          </div>

          {/* Right — Form */}
          <div className="bg-cream-50 rounded-3xl opacity-90 border border-cream-200 p-5 sm:p-8 relative z-10">
            {status === "sent" ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-sage-500/20 flex items-center justify-center mx-auto text-3xl">
                  ✓
                </div>
                <h3 className="font-display text-2xl font-semibold text-ink-900">
                  Message sent!
                </h3>
                <p className="text-ink-600 leading-relaxed">
                  I'll get back to you within 24 hours.
                  <br />
                  <span className="text-citrus-600 text-sm font-medium">
                    A confirmation email has been sent to you.
                  </span>
                </p>
                <button
                  onClick={handleReset}
                  className="text-sm text-citrus-500 hover:text-citrus-600 border-b border-citrus-500/50 pb-px transition-colors font-medium"
                >
                  Send another →
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-ink-600 mb-2 uppercase tracking-wider">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="Jane Smith"
                      className="w-full bg-cream-100 border border-cream-200 rounded-xl px-4 py-3 text-ink-900 placeholder:text-ink-400 text-sm focus:outline-none focus:border-citrus-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-ink-600 mb-2 uppercase tracking-wider">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="jane@acme.com"
                      className="w-full bg-cream-100 border border-cream-200 rounded-xl px-4 py-3 text-ink-900 placeholder:text-ink-400 text-sm focus:outline-none focus:border-citrus-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-ink-600 mb-2 uppercase tracking-wider">
                    Subject
                  </label>
                  <select
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    required
                    className="w-full bg-cream-100 border border-cream-200 rounded-xl px-4 py-3 text-ink-900 text-sm focus:outline-none focus:border-citrus-500 transition-colors appearance-none"
                  >
                    <option value="">Select a topic…</option>
                    <option value="freelance">Freelance Project</option>
                    <option value="fulltime">Full-time Opportunity</option>
                    <option value="collab">Open Source Collab</option>
                    <option value="other">Just Saying Hi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-ink-600 mb-2 uppercase tracking-wider">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Tell me about your project, timeline, and budget…"
                    className="w-full bg-cream-100 border border-cream-200 rounded-xl px-4 py-3 text-ink-900 placeholder:text-ink-400 text-sm focus:outline-none focus:border-citrus-500 transition-colors resize-none"
                  />
                </div>

                {/* Error */}
                {status === "error" && (
                  <div className="flex items-start gap-3 bg-rose-500/10 border border-rose-500/25 rounded-xl px-4 py-3">
                    <span className="text-rose-500 flex-shrink-0 mt-0.5">
                      ⚠
                    </span>
                    <p className="text-rose-600 dark:text-rose-400 text-sm leading-relaxed">
                      {errorMessage}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full bg-citrus-500 hover:bg-citrus-600 disabled:opacity-60 disabled:cursor-not-allowed text-ink-900 dark:text-white font-semibold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {status === "sending" ? (
                    <>
                      <span className="w-4 h-4 border-2 border-ink-900/30 border-t-ink-900 rounded-full animate-spin" />
                      Sending…
                    </>
                  ) : (
                    "Send Message →"
                  )}
                </button>

                <p className="text-center font-mono text-[10px] text-amber-500">
                  You'll receive a confirmation email · Replies within 24h
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
