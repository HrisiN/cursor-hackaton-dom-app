import type { Metadata } from "next";
import { Fraunces, Nunito } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dom — Pronađi dom u Zagrebu",
  description:
    "Dom aggregates Zagreb real estate offers into one place. Search by neighborhood, budget, lifestyle priorities, or just describe what you want.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${nunito.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-nunito bg-dom-bg text-dom-fg">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-dom-border bg-dom-muted/40 py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-dom-muted-fg">
            <p className="font-fraunces font-700">Dom — Zagreb Real Estate</p>
            <p>Data sourced from multiple agencies, updated daily</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
