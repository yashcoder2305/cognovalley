import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bin Buzz | AI Facility Hygiene & Cleanliness Intelligence",
  description: "Cogno Valley Track E: Real-time waste detection, Cleanliness Index analytics, and automated housekeeping dispatch system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-tactical-950 text-slate-100 antialiased min-h-screen selection:bg-buzz-emerald/30 selection:text-buzz-emerald">
        {children}
      </body>
    </html>
  );
}

