"use client";
import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { createPortal } from "react-dom";

const UPI_ID = "9883995131-3@ybl";
const PAYEE_NAME = "Rohit Mondal";
// ─────────────────────────────────────────────────────────────

const PRESETS = [49, 99, 199, 499, 999];

const UPI_APPS = [
  {
    id: "gpay",
    label: "GPay",
    color: "bg-white border border-gray-200",
    scheme: (id: string, name: string, amt: string, note: string) =>
      `tez://upi/pay?pa=${id}&pn=${name}&tn=${note}${amt}&cu=INR`,
  },
  {
    id: "phonepe",
    label: "PhonePe",
    color: "bg-[#5f259f]",
    scheme: (id: string, name: string, amt: string, note: string) =>
      `phonepe://pay?pa=${id}&pn=${name}&tn=${note}${amt}&cu=INR`,
  },
  {
    id: "paytm",
    label: "Paytm",
    color: "bg-[#00baf2]",
    scheme: (id: string, name: string, amt: string, note: string) =>
      `paytmmp://pay?pa=${id}&pn=${name}&tn=${note}${amt}&cu=INR`,
  },
  {
    id: "bhim",
    label: "BHIM",
    color: "bg-[#00b050]",
    scheme: (id: string, name: string, amt: string, note: string) =>
      `upi://pay?pa=${id}&pn=${name}&tn=${note}${amt}&cu=INR`,
  },
];

export default function PayMeButton() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [preset, setPreset] = useState<number | null>(null);
  const [toast, setToast] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Generate QR
  useEffect(() => {
    if (!open || !qrRef.current) return;
    const loadQR = async () => {
      const QRCode = (await import("qrcode")).default;
      const upiUrl = buildUPIUrl("bhim");
      const canvas = qrRef.current?.querySelector(
        "canvas",
      ) as HTMLCanvasElement;
      if (canvas) QRCode.toCanvas(canvas, upiUrl, { width: 148, margin: 1 });
    };
    const timer = setTimeout(loadQR, 200);
    return () => clearTimeout(timer);
  }, [open, amount, note]);

  const buildUPIUrl = (appId: string) => {
    const id = encodeURIComponent(UPI_ID);
    const name = encodeURIComponent(PAYEE_NAME);
    const n = encodeURIComponent(note || "Payment");
    const amt = amount && parseFloat(amount) > 0 ? `&am=${amount}` : "";
    const app = UPI_APPS.find((a) => a.id === appId);
    return app
      ? app.scheme(id, name, amt, n)
      : `upi://pay?pa=${id}&pn=${name}&tn=${n}${amt}&cu=INR`;
  };

  const handleAppPay = (appId: string) => {
    if (!amount || parseFloat(amount) <= 0) {
      showToast("Please enter an amount ₹");
      return;
    }
    window.location.href = buildUPIUrl(appId);
    showToast(`Opening ${appId.charAt(0).toUpperCase() + appId.slice(1)}…`);
  };

  const handlePreset = (val: number) => {
    setPreset(val);
    setAmount(String(val));
  };

  const copyUPI = () => {
    navigator.clipboard.writeText(UPI_ID);
    showToast("UPI ID copied ✓");
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  };

  return (
    <>
      {/* ── PAY ME BUTTON ── */}
      <button
        onClick={() => setOpen(true)}
        className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm text-ink-900 overflow-hidden group"
        style={{
          background: "linear-gradient(135deg, #F4A024, #E8890A)",
          boxShadow: "0 4px 20px rgba(244,160,36,0.45)",
        }}
      >
        {/* Shine sweep */}
        <span className="absolute top-0 left-[-60%] w-[35%] h-full bg-white/25 skew-x-[-20deg] group-hover:left-[140%] transition-all duration-500 pointer-events-none" />

        {/* Pulse dot */}
        <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-white/80">
          <span className="absolute inset-[-3px] rounded-full border-2 border-white/60 animate-ping" />
        </span>

        <span className="text-base leading-none">₹</span>
        <span>Pay Me</span>
      </button>

      {/* ── MODAL OVERLAY (portal → always on body, never clipped by navbar) ── */}
      {mounted &&
        createPortal(
          <>
            <div
              onClick={(e) => {
                if (e.target === e.currentTarget) setOpen(false);
              }}
              className={clsx(
                "fixed inset-0 z-[9999] flex items-center justify-center px-4 transition-all duration-300",
                open
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 pointer-events-none",
              )}
              style={{
                background: "rgba(26,18,8,0.65)",
                backdropFilter: open ? "blur(8px)" : "none",
                WebkitBackdropFilter: open ? "blur(8px)" : "none",
              }}
            >
              <div
                className={clsx(
                  "w-full max-w-md bg-cream-100 rounded-3xl overflow-hidden transition-all duration-[350ms]",
                  open ? "translate-y-0 scale-100" : "translate-y-10 scale-95",
                )}
                style={{ boxShadow: "0 40px 80px rgba(26,18,8,0.4)" }}
              >
                {/* Header */}
          <div className="bg-ink-900 px-6 pt-6 pb-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-cream-50">
                  Support {PAYEE_NAME.split(" ")[0]} ₹
                </h2>
                <p className="font-mono text-xs text-ink-400 mt-1">Instant UPI · Zero fees · Secure</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full bg-ink-800 hover:bg-citrus-400 hover:text-ink-900 text-cream-50 flex items-center justify-center text-sm transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-4 py-5 sm:px-6 sm:py-5 space-y-4 max-h-[75vh] overflow-y-auto">

            {/* UPI ID */}
            <div className="bg-ink-900 rounded-2xl px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-citrus-400 flex items-center justify-center font-display font-bold text-sm text-ink-900 flex-shrink-0">
                  {PAYEE_NAME.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p className="font-mono text-[10px] text-ink-400 uppercase tracking-wider">UPI ID</p>
                  <p className="text-cream-50 font-semibold text-sm mt-0.5">{UPI_ID}</p>
                </div>
              </div>
              <button
                onClick={copyUPI}
                className="font-mono text-[11px] bg-ink-800 hover:bg-citrus-400 hover:text-ink-900 text-citrus-400 px-3 py-1.5 rounded-lg transition-colors"
              >
                Copy
              </button>
            </div>

            {/* Amount presets */}
            <div>
              <p className="font-mono text-[11px] text-ink-400 uppercase tracking-widest mb-2">Choose amount</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {PRESETS.map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePreset(p)}
                    className={clsx(
                      "px-3.5 py-1.5 rounded-xl text-sm font-semibold border-2 transition-all",
                      preset === p
                        ? "bg-citrus-400 border-citrus-400 text-ink-900"
                        : "bg-cream-50 border-cream-200 text-ink-600 hover:border-citrus-400"
                    )}
                  >
                    ₹{p}
                  </button>
                ))}
              </div>
              {/* Custom amount */}
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xl font-bold text-ink-900">₹</span>
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); setPreset(null); }}
                  placeholder="Enter custom amount"
                  className="w-full bg-cream-50 border-2 border-cream-200 focus:border-citrus-400 rounded-xl pl-8 pr-4 py-3 text-lg font-bold text-ink-900 outline-none transition-colors"
                />
              </div>
            </div>

            {/* Note */}
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note (optional)"
              className="w-full bg-cream-50 border border-cream-200 focus:border-citrus-400 rounded-xl px-4 py-2.5 text-sm text-ink-900 outline-none transition-colors"
            />

            {/* UPI Apps */}
            <div>
              <p className="font-mono text-[11px] text-ink-400 uppercase tracking-widest mb-3 text-center">Open in your UPI app</p>
              <div className="grid grid-cols-4 gap-1.5">
                {UPI_APPS.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => handleAppPay(app.id)}
                    className="flex flex-col items-center gap-1.5 bg-cream-50 border border-cream-200 rounded-2xl py-3 px-1 hover:-translate-y-1 hover:shadow-md transition-all duration-200"
                  >
                    <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold", app.color)}>
                      {app.id === "gpay" && <span className="text-blue-600">G</span>}
                      {app.id === "phonepe" && <span className="text-white">P</span>}
                      {app.id === "paytm" && <span className="text-white text-sm">Pa</span>}
                      {app.id === "bhim" && <span className="text-white">B</span>}
                    </div>
                    <span className="text-[11px] font-semibold text-ink-600">{app.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-cream-200" />
              <span className="font-mono text-[11px] text-ink-400">or scan QR</span>
              <div className="flex-1 h-px bg-cream-200" />
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center">
              <div ref={qrRef} className="bg-white rounded-2xl p-3 border border-cream-200">
                <canvas width={148} height={148} />
              </div>
              <p className="font-mono text-[11px] text-ink-400 mt-2">Scan with any UPI app</p>
            </div>

            {/* Security */}
            <div className="flex items-center gap-2 bg-green-50 rounded-xl px-4 py-2.5">
              <span className="text-sm">🔒</span>
              <span className="font-mono text-[11px] text-green-700">
                100% secure · Powered by NPCI UPI · No card details needed
              </span>
            </div>
          </div>
              </div>
            </div>

            {/* ── TOAST ── */}
            <div
              className={clsx(
                "fixed bottom-6 left-1/2 -translate-x-1/2 bg-ink-900 text-cream-50 text-sm font-medium px-5 py-3 rounded-full shadow-xl z-[99999] transition-all duration-300 whitespace-nowrap",
                toastVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0",
              )}
            >
              {toast}
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
