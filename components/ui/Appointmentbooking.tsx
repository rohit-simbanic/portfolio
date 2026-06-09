"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@supabase/supabase-js";

// ─── CONFIG — replace with your details ───────────────────────────────────
const HOST_NAME = "Rohit Mondal";
const HOST_TITLE = "Full-Stack Developer";
const TIMEZONE = "Asia/Kolkata"; // your timezone
const DURATION_MIN = 30; // meeting duration

const TIME_SLOTS = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
];

const MEETING_TYPES = [
  {
    id: "Intro Call",
    label: "Intro Call",
    desc: "Quick 30-min chat about your project",
    icon: "👋",
  },
  {
    id: "Project Discussion",
    label: "Project Discussion",
    desc: "Deep dive into requirements & scope",
    icon: "🛠️",
  },
  {
    id: "Tech Consultation",
    label: "Tech Consultation",
    desc: "Architecture, stack, or code review",
    icon: "💡",
  },
];
// ──────────────────────────────────────────────────────────────────────────

// Supabase client (read-only on client — anon key only)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

type Step = "type" | "date" | "time" | "details" | "confirm";
interface BookingState {
  meetingType: string;
  date: Date | null;
  time: string;
  name: string;
  email: string;
  note: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function formatDate(d: Date): string {
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ── Mini Calendar ──────────────────────────────────────────────────────────
function MiniCalendar({
  selected,
  onSelect,
}: {
  selected: Date | null;
  onSelect: (d: Date) => void;
}) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWk = new Date(viewYear, viewMonth, 1).getDay();
  const cells: (number | null)[] = [
    ...Array(firstDayOfWk).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const prevMonth = () =>
    viewMonth === 0
      ? (setViewMonth(11), setViewYear((y) => y - 1))
      : setViewMonth((m) => m - 1);
  const nextMonth = () =>
    viewMonth === 11
      ? (setViewMonth(0), setViewYear((y) => y + 1))
      : setViewMonth((m) => m + 1);

  const isPast = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    d.setHours(0, 0, 0, 0);
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return d < t;
  };
  const isWeekend = (day: number) =>
    [0, 6].includes(new Date(viewYear, viewMonth, day).getDay());
  const isSelected = (day: number) =>
    selected?.getDate() === day &&
    selected?.getMonth() === viewMonth &&
    selected?.getFullYear() === viewYear;
  const isToday = (day: number) =>
    today.getDate() === day &&
    today.getMonth() === viewMonth &&
    today.getFullYear() === viewYear;

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-400 hover:bg-cream-200 transition-colors text-lg"
        >
          ‹
        </button>
        <span className="font-display font-semibold text-ink-900 text-sm">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button
          onClick={nextMonth}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-400 hover:bg-cream-200 transition-colors text-lg"
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div
            key={d}
            className="text-center font-mono text-[10px] text-ink-400 py-1"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={`e-${idx}`} />;
          const disabled = isPast(day) || isWeekend(day);
          const sel = isSelected(day);
          const tod = isToday(day);
          return (
            <button
              key={day}
              disabled={disabled}
              onClick={() => onSelect(new Date(viewYear, viewMonth, day))}
              className={[
                "h-8 w-full rounded-lg text-xs font-medium transition-all duration-150",
                disabled ? "text-ink-400/30 cursor-not-allowed" : "",
                !disabled && !sel ? "hover:bg-citrus-400/15 text-ink-700" : "",
                sel
                  ? "bg-citrus-400 text-ink-900 shadow-md shadow-citrus-400/30 font-bold"
                  : "",
                tod && !sel ? "ring-1 ring-citrus-400 text-citrus-600" : "",
              ].join(" ")}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Step bar ───────────────────────────────────────────────────────────────
function StepBar({ step }: { step: Step }) {
  const steps: Step[] = ["type", "date", "time", "details", "confirm"];
  const labels = ["Type", "Date", "Time", "Details", "Done"];
  const idx = steps.indexOf(step);
  return (
    <div className="flex items-center gap-1 px-4 sm:px-6 py-3 border-b border-cream-200 flex-shrink-0">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-1 flex-1">
          <div
            className={[
              "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 transition-all duration-300",
              i < idx ? "bg-ink-900 text-cream-50" : "",
              i === idx
                ? "bg-citrus-400 text-ink-900 ring-2 ring-citrus-400/30"
                : "",
              i > idx ? "bg-cream-200 text-ink-400" : "",
            ].join(" ")}
          >
            {i < idx ? "✓" : i + 1}
          </div>
          <span
            className={`text-[9px] font-mono uppercase tracking-wider hidden sm:block ${i === idx ? "text-citrus-600 font-bold" : "text-ink-400"}`}
          >
            {labels[i]}
          </span>
          {i < steps.length - 1 && (
            <div
              className={`flex-1 h-px mx-1 transition-colors duration-300 ${i < idx ? "bg-ink-900" : "bg-cream-200"}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function AppointmentBooking() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>("type");
  const [booking, setBooking] = useState<BookingState>({
    meetingType: "",
    date: null,
    time: "",
    name: "",
    email: "",
    note: "",
  });
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [result, setResult] = useState<{
    calendarUrl: string;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ESC to close
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Fetch booked slots whenever date changes
  useEffect(() => {
    if (!booking.date) return;
    const dateStr = toDateStr(booking.date);
    setLoadingSlots(true);
    setBookedSlots([]);
    fetch(`/api/bookings?date=${dateStr}`)
      .then((r) => r.json())
      .then((d) => setBookedSlots(d.bookedSlots ?? []))
      .catch(() => setBookedSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [booking.date]);

  // Real-time subscription — update booked slots live
  useEffect(() => {
    if (!booking.date) return;
    const dateStr = toDateStr(booking.date);
    const channel = supabase
      .channel(`bookings:${dateStr}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bookings",
          filter: `date=eq.${dateStr}`,
        },
        (payload) => {
          const slot = payload.new?.time_slot as string;
          if (slot) setBookedSlots((prev) => prev.includes(slot) ? prev : [...prev, slot]);
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [booking.date]);

  const reset = () => {
    setStep("type");
    setBooking({
      meetingType: "",
      date: null,
      time: "",
      name: "",
      email: "",
      note: "",
    });
    setBookedSlots([]);
    setSubmitError("");
    setResult(null);
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(reset, 400);
  };

  const canNext = () => {
    if (step === "type") return !!booking.meetingType;
    if (step === "date") return !!booking.date;
    if (step === "time") return !!booking.time;
    if (step === "details")
      return !!booking.name.trim() && /\S+@\S+\.\S+/.test(booking.email);
    return true;
  };

  const next = useCallback(() => {
    const order: Step[] = ["type", "date", "time", "details", "confirm"];
    const i = order.indexOf(step);
    if (i < order.length - 1) setStep(order[i + 1]);
  }, [step]);

  const back = useCallback(() => {
    const order: Step[] = ["type", "date", "time", "details", "confirm"];
    const i = order.indexOf(step);
    if (i > 0) setStep(order[i - 1]);
  }, [step]);

  // Submit booking
  const handleSubmit = async () => {
    if (!booking.date) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meetingType: booking.meetingType,
          date: toDateStr(booking.date),
          time: booking.time,
          name: booking.name,
          email: booking.email,
          note: booking.note,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Booking failed");

      setResult({ calendarUrl: data.calendarUrl });
    } catch (err: unknown) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const selectedType = MEETING_TYPES.find((t) => t.id === booking.meetingType);
  const isBooked = (slot: string) => bookedSlots.includes(slot);

  // ── Modal ──────────────────────────────────────────────────────────────
  const modal = (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className={`fixed inset-0 z-[9998] transition-all duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        style={{
          background: "rgba(26,18,8,0.45)",
          backdropFilter: open ? "blur(6px)" : "none",
        }}
      />

      {/* Panel */}
      <div
        className={`fixed bottom-24 right-4 sm:right-6 z-[9999] w-[calc(100vw-2rem)] sm:w-[420px] max-h-[80vh] flex flex-col rounded-3xl transition-all duration-500 overflow-hidden ${
          open
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
            : "opacity-0 translate-y-8 scale-95 pointer-events-none"
        }`}
        style={{
          background: "var(--modal-bg)",
          boxShadow:
            "0 32px 80px rgba(26,18,8,0.25), 0 0 0 1px rgba(26,18,8,0.06)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 pt-5 pb-4 border-b border-cream-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-citrus-400 flex items-center justify-center font-display font-bold text-sm text-ink-900">
              {HOST_NAME.split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div>
              <p className="font-display font-semibold text-ink-900 text-sm leading-none">
                {HOST_NAME}
              </p>
              <p className="font-mono text-[10px] text-ink-400 mt-0.5">
                {HOST_TITLE}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-7 h-7 rounded-full bg-cream-200 hover:bg-ink-900 hover:text-cream-50 text-ink-600 flex items-center justify-center text-xs transition-all duration-200"
          >
            ✕
          </button>
        </div>

        {/* Step bar */}
        {!result && <StepBar step={step} />}

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 min-h-0">
          {/* ── TYPE ── */}
          {step === "type" && (
            <div className="space-y-3">
              <h3 className="font-display text-lg font-bold text-ink-900 mb-4">
                What kind of meeting?
              </h3>
              {MEETING_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() =>
                    setBooking((b) => ({ ...b, meetingType: type.id }))
                  }
                  className={`w-full text-left rounded-2xl border-2 p-4 transition-all duration-200 ${
                    booking.meetingType === type.id
                      ? "border-citrus-400 bg-citrus-400/8 shadow-md shadow-citrus-400/15"
                      : "border-cream-200 bg-cream-50 hover:border-citrus-400/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{type.icon}</span>
                    <div>
                      <p className="font-semibold text-ink-900 text-sm">
                        {type.label}
                      </p>
                      <p className="text-ink-400 text-xs mt-0.5">
                        {type.desc} · {DURATION_MIN} min
                      </p>
                    </div>
                    {booking.meetingType === type.id && (
                      <div className="ml-auto w-5 h-5 rounded-full bg-citrus-400 flex items-center justify-center text-[10px] font-bold text-ink-900 flex-shrink-0">
                        ✓
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* ── DATE ── */}
          {step === "date" && (
            <div>
              <h3 className="font-display text-lg font-bold text-ink-900 mb-4">
                Pick a date
              </h3>
              <div className="bg-cream-50 rounded-2xl border border-cream-200 p-4">
                <MiniCalendar
                  selected={booking.date}
                  onSelect={(d) =>
                    setBooking((b) => ({ ...b, date: d, time: "" }))
                  }
                />
              </div>
              {booking.date && (
                <p className="text-center font-mono text-xs text-citrus-600 mt-3 font-semibold">
                  ✓ {formatDate(booking.date)}
                </p>
              )}
              <p className="text-center font-mono text-[10px] text-ink-400 mt-2">
                Weekends unavailable · {TIMEZONE}
              </p>
            </div>
          )}

          {/* ── TIME ── */}
          {step === "time" && (
            <div>
              <h3 className="font-display text-lg font-bold text-ink-900 mb-1">
                Choose a time
              </h3>
              {booking.date && (
                <p className="font-mono text-xs text-ink-400 mb-4">
                  {formatDate(booking.date)}
                </p>
              )}

              {loadingSlots ? (
                <div className="flex items-center justify-center py-8 gap-2">
                  <div className="w-4 h-4 border-2 border-citrus-400 border-t-transparent rounded-full animate-spin" />
                  <span className="font-mono text-xs text-ink-400">
                    Checking availability…
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {TIME_SLOTS.map((slot) => {
                    const booked = isBooked(slot);
                    const selected = booking.time === slot;
                    return (
                      <button
                        key={slot}
                        disabled={booked}
                        onClick={() =>
                          setBooking((b) => ({ ...b, time: slot }))
                        }
                        className={[
                          "py-2.5 rounded-xl border text-xs font-mono font-medium transition-all duration-200 relative",
                          booked
                            ? "bg-cream-200/60 border-cream-200 text-ink-400/40 cursor-not-allowed line-through"
                            : "",
                          !booked && !selected
                            ? "bg-cream-50 border-cream-200 text-ink-700 hover:border-citrus-400/60 hover:bg-citrus-400/5"
                            : "",
                          selected
                            ? "bg-citrus-400 border-citrus-400 text-ink-900 shadow-md shadow-citrus-400/25 font-bold"
                            : "",
                        ].join(" ")}
                      >
                        {slot}
                        {booked && (
                          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-ink-400/20 rounded-full flex items-center justify-center text-[8px]">
                            ✕
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Legend */}
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-citrus-400" />
                  <span className="font-mono text-[10px] text-ink-400">
                    Selected
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-cream-200/60 border border-cream-200" />
                  <span className="font-mono text-[10px] text-ink-400">
                    Booked
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-cream-50 border border-cream-200" />
                  <span className="font-mono text-[10px] text-ink-400">
                    Available
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── DETAILS ── */}
          {step === "details" && (
            <div className="space-y-4">
              <h3 className="font-display text-lg font-bold text-ink-900">
                Your details
              </h3>
              {[
                {
                  key: "name",
                  label: "Full Name *",
                  type: "text",
                  placeholder: "Jane Smith",
                },
                {
                  key: "email",
                  label: "Email *",
                  type: "email",
                  placeholder: "jane@company.com",
                },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block font-mono text-[10px] text-ink-400 uppercase tracking-widest mb-1.5">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    value={booking[field.key as "name" | "email"]}
                    onChange={(e) =>
                      setBooking((b) => ({ ...b, [field.key]: e.target.value }))
                    }
                    placeholder={field.placeholder}
                    className="w-full bg-cream-50 border border-cream-200 focus:border-citrus-400 rounded-xl px-4 py-2.5 text-sm text-ink-900 outline-none transition-colors"
                  />
                </div>
              ))}
              <div>
                <label className="block font-mono text-[10px] text-ink-400 uppercase tracking-widest mb-1.5">
                  Note <span className="normal-case">(optional)</span>
                </label>
                <textarea
                  value={booking.note}
                  onChange={(e) =>
                    setBooking((b) => ({ ...b, note: e.target.value }))
                  }
                  rows={3}
                  placeholder="Brief description of what you'd like to discuss…"
                  className="w-full bg-cream-50 border border-cream-200 focus:border-citrus-400 rounded-xl px-4 py-2.5 text-sm text-ink-900 outline-none transition-colors resize-none"
                />
              </div>
            </div>
          )}

          {/* ── CONFIRM ── */}
          {step === "confirm" && !result && (
            <div className="space-y-4">
              <h3 className="font-display text-lg font-bold text-ink-900">
                Confirm booking
              </h3>

              {/* Summary */}
              <div className="bg-cream-50 rounded-2xl border border-cream-200 divide-y divide-cream-200 overflow-hidden">
                {[
                  {
                    label: "Meeting",
                    value: `${selectedType?.icon} ${selectedType?.label}`,
                  },
                  {
                    label: "Date",
                    value: booking.date ? formatDate(booking.date) : "",
                  },
                  {
                    label: "Time",
                    value: `${booking.time} · ${DURATION_MIN} min`,
                  },
                  { label: "Name", value: booking.name },
                  { label: "Email", value: booking.email },
                  ...(booking.note
                    ? [{ label: "Note", value: booking.note }]
                    : []),
                ].map((row) => (
                  <div key={row.label} className="flex gap-3 px-4 py-3">
                    <span className="font-mono text-[10px] text-ink-400 uppercase tracking-wider w-14 flex-shrink-0 pt-0.5">
                      {row.label}
                    </span>
                    <span className="text-ink-800 text-sm font-medium break-all">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 font-medium">
                  ⚠️ {submitError}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center justify-center gap-2.5 w-full bg-ink-900 hover:bg-citrus-500 hover:text-ink-900 disabled:opacity-50 text-cream-50 font-semibold py-3.5 rounded-2xl transition-all duration-300 text-sm shadow-lg"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Confirming…
                  </>
                ) : (
                  <>📅 Confirm & Book</>
                )}
              </button>
              <p className="text-center font-mono text-[10px] text-ink-400">
                Your slot will be locked for others once confirmed
              </p>
            </div>
          )}

          {/* ── SUCCESS ── */}
          {result && (
            <div className="text-center py-4 space-y-5">
              <div className="w-16 h-16 rounded-full bg-sage-400/15 flex items-center justify-center mx-auto text-3xl animate-bounce">
                🎉
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-ink-900">
                  Booking confirmed!
                </h3>
                <p className="text-ink-400 text-sm mt-2 leading-relaxed">
                  Your slot is locked. Add it to your calendar below.
                </p>
              </div>

              {/* Summary pill */}
              <div className="bg-cream-50 rounded-2xl border border-cream-200 p-4 text-left">
                <p className="font-semibold text-ink-900 text-sm">
                  {selectedType?.icon} {selectedType?.label}
                </p>
                <p className="font-mono text-xs text-ink-500 mt-1">
                  {booking.date ? formatDate(booking.date) : ""} ·{" "}
                  {booking.time}
                </p>
              </div>

              {/* Two calendar CTAs */}
              <div className="space-y-2.5">
                {/* Customer's Google Calendar */}
                <a
                  href={result.calendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 w-full bg-citrus-400 hover:bg-citrus-500 text-ink-900 font-semibold py-3 rounded-2xl transition-all duration-200 text-sm shadow-md shadow-citrus-400/25"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19 4h-1V2h-2v2H8V2H6v2H5C3.9 4 3 4.9 3 6v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h5v5H7z" />
                  </svg>
                  Add to My Google Calendar
                </a>

                <p className="font-mono text-[10px] text-ink-400 text-center">
                  A notification has been sent to {HOST_NAME}
                </p>
              </div>

              <button
                onClick={handleClose}
                className="w-full border border-cream-200 text-ink-600 font-medium py-2.5 rounded-2xl hover:bg-cream-200 transition-colors text-sm"
              >
                Close
              </button>
            </div>
          )}
        </div>

        {/* Footer nav */}
        {!result && (
          <div
            className="flex gap-3 px-4 sm:px-6 py-4 border-t border-cream-200 flex-shrink-0"
            style={{ background: "var(--modal-footer-bg)" }}
          >
            {step !== "type" && (
              <button
                onClick={back}
                className="flex-1 border border-cream-200 text-ink-700 font-semibold py-2.5 rounded-xl text-sm hover:bg-cream-200 transition-colors"
              >
                ← Back
              </button>
            )}
            {step !== "confirm" && (
              <button
                onClick={next}
                disabled={!canNext()}
                className="flex-1 bg-ink-900 disabled:opacity-40 disabled:cursor-not-allowed text-cream-50 font-semibold py-2.5 rounded-xl text-sm hover:bg-citrus-500 hover:text-ink-900 transition-all duration-200"
              >
                Continue →
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Floating trigger ── */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Book a meeting"
        className={`fixed bottom-6 right-4 sm:right-6 z-[9999] flex items-center gap-2.5 pl-4 pr-5 py-3 rounded-full font-semibold text-sm shadow-2xl transition-all duration-300 ${
          open
            ? "bg-ink-900 text-cream-50 scale-95"
            : "bg-citrus-400 text-ink-900 hover:bg-citrus-500 hover:scale-105"
        }`}
        style={{
          boxShadow: open
            ? "0 8px 32px rgba(26,18,8,0.35)"
            : "0 8px 32px rgba(244,160,36,0.45)",
        }}
      >
        {!open && (
          <span className="absolute inset-0 rounded-full bg-citrus-400 animate-ping opacity-20" />
        )}
        <span className="text-base leading-none relative z-10">
          {open ? "✕" : "📅"}
        </span>
        <span className="relative z-10">
          {open ? "Close" : "Book a Meeting"}
        </span>
      </button>
    </>
  );

  return mounted ? createPortal(modal, document.body) : null;
}
