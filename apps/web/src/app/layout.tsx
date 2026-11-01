import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Climate Engine – AI Decision Intelligence Platform",
  description: "AI-powered Climate Resilience Decision Intelligence Platform by Team Climate Bandits · PCCOE International Grand Challenge 2026. Fusing environmental data, scenario simulations, and Nugen AI reasoning.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <body className="min-h-full flex flex-col bg-[#090d16] text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
