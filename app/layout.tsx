import type { Metadata } from "next";
import "./globals.css";
import CustomCursor from "@/components/ui/CustomCursor";
import Navbar from "@/components/ui/Navbar";
import AppointmentBooking from "@/components/ui/Appointmentbooking";
import ThemeColorCustomizer from "@/components/ui/ThemeColorCustomizer";

export const metadata: Metadata = {
  title: "Rohit Mondal — Full-Stack Developer",
  description:
    "Building thoughtful digital experiences with code and creativity.",
  openGraph: {
    title: "Rohit Mondal — Full-Stack Developer",
    description:
      "Building thoughtful digital experiences with code and creativity.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') || 'dark';
                if (theme === 'light') {
                  document.documentElement.classList.add('light');
                } else {
                  document.documentElement.classList.remove('light');
                }
                try {
                  const accent = localStorage.getItem('accent-theme');
                  if (accent) {
                    const colors = JSON.parse(accent);
                    document.documentElement.style.setProperty('--citrus-400', colors['400']);
                    document.documentElement.style.setProperty('--citrus-500', colors['500']);
                    document.documentElement.style.setProperty('--citrus-600', colors['600']);
                  }
                } catch (e) {}
              })()
            `,
          }}
        />
      </head>
      <body className="bg-cream-100 text-ink-900 font-body antialiased">
        <CustomCursor />
        <Navbar />
        {children}
        <AppointmentBooking />
        <ThemeColorCustomizer />
      </body>
    </html>
  );
}
