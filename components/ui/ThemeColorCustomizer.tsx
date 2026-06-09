"use client";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, X } from "lucide-react";
import { clsx } from "clsx";

const presets = [
  {
    name: "Citrus",
    key: "citrus",
    colorHex: "#E8890A",
    colors: {
      "400": "244, 160, 36",
      "500": "232, 137, 10",
      "600": "196, 114, 8",
    },
  },
  {
    name: "Sage",
    key: "sage",
    colorHex: "#5A9470",
    colors: {
      "400": "123, 174, 140",
      "500": "90, 148, 112",
      "600": "61, 115, 84",
    },
  },
  {
    name: "Rose",
    key: "rose",
    colorHex: "#D4644A",
    colors: {
      "400": "232, 131, 106",
      "500": "212, 100, 74",
      "600": "181, 74, 48",
    },
  },
  {
    name: "Sky",
    key: "sky",
    colorHex: "#4A90C4",
    colors: {
      "400": "107, 174, 214",
      "500": "74, 144, 196",
      "600": "46, 111, 168",
    },
  },
  {
    name: "Amethyst",
    key: "amethyst",
    colorHex: "#8B5CF6",
    colors: {
      "400": "167, 139, 250",
      "500": "139, 92, 246",
      "600": "109, 40, 217",
    },
  },
];

export default function ThemeColorCustomizer() {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("citrus");
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const savedKey = localStorage.getItem("accent-theme-key") || "citrus";
    setSelected(savedKey);

    // Close on click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const applyPreset = (preset: typeof presets[0]) => {
    setSelected(preset.key);
    localStorage.setItem("accent-theme-key", preset.key);
    localStorage.setItem("accent-theme", JSON.stringify(preset.colors));

    document.documentElement.style.setProperty("--citrus-400", preset.colors["400"]);
    document.documentElement.style.setProperty("--citrus-500", preset.colors["500"]);
    document.documentElement.style.setProperty("--citrus-600", preset.colors["600"]);
  };

  if (!mounted) return null;

  return (
    <div
      ref={containerRef}
      className="fixed left-4 top-1/2 -translate-y-1/2 z-[9999] flex items-center gap-3"
    >
      {/* Main Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-cream-100/90 backdrop-blur-md border border-cream-200 shadow-lg flex items-center justify-center text-ink-600 hover:text-citrus-500 hover:border-citrus-400 hover:scale-105 active:scale-95 transition-all duration-300 relative group cursor-none"
        aria-label="Customize accent color"
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          {isOpen ? <X className="w-5 h-5" /> : <Palette className="w-5 h-5" />}
        </motion.div>
        
        {/* Tooltip on Hover */}
        {!isOpen && (
          <span className="absolute left-14 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-cream-100/95 border border-cream-200 text-ink-900 font-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded-md shadow-md pointer-events-none whitespace-nowrap">
            Theme Colors
          </span>
        )}
      </button>

      {/* Expanded Swatch Bar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex items-center gap-2 bg-cream-100/90 backdrop-blur-md border border-cream-200 p-2.5 rounded-full shadow-xl"
          >
            {presets.map((preset) => {
              const isSelected = selected === preset.key;
              return (
                <button
                  key={preset.key}
                  onClick={() => applyPreset(preset)}
                  className="relative w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-90 cursor-none group"
                  style={{ backgroundColor: preset.colorHex }}
                  aria-label={`Select ${preset.name} theme`}
                >
                  {/* Selected Indicator Ring */}
                  {isSelected && (
                    <motion.span
                      layoutId="activeAccentOutline"
                      className="absolute -inset-1 rounded-full border-2 border-citrus-500"
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    />
                  )}
                  {/* Small inner dot for clean contrast */}
                  <span
                    className={clsx(
                      "w-2.5 h-2.5 rounded-full bg-white transition-opacity duration-200",
                      isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-40"
                    )}
                  />

                  {/* Tooltip for Swatch */}
                  <span className="absolute bottom-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-cream-100/95 border border-cream-200 text-ink-900 font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded shadow-sm pointer-events-none whitespace-nowrap">
                    {preset.name}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
