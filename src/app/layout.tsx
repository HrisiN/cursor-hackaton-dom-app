import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "Dom — Find Your Home in Zagreb",
  description:
    "Dom aggregates Zagreb real estate offers into one place. Search by neighborhood, budget, lifestyle priorities, or just describe what you want.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t bg-muted/40 py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
            <p>Dom — Zagreb Real Estate Aggregator</p>
            <p>Data sourced from multiple agencies, updated daily</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
