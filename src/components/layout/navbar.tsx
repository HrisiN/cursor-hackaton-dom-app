"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-lg">
              D
            </div>
            <span className="text-xl font-bold tracking-tight">Dom</span>
          </Link>

          <nav className="flex items-center gap-1">
            <Link
              href="/search?deal_type=rent"
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                pathname === "/search" ? "bg-emerald-50 text-emerald-700" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              Rent
            </Link>
            <Link
              href="/search?deal_type=sale"
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                pathname === "/search" ? "bg-emerald-50 text-emerald-700" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              Buy
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
