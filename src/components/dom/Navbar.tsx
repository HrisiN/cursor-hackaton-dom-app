"use client";

export function DomNavbar() {
  return (
    <header className="sticky top-4 z-50 mx-4">
      <nav className="mx-auto max-w-5xl flex items-center justify-between rounded-full border border-dom-border/50 bg-white/70 px-4 py-2.5 shadow-moss backdrop-blur-md">
        <a href="/" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-dom-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <span className="font-fraunces font-800 text-xl tracking-tight text-dom-fg">Dom</span>
        </a>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center rounded-full bg-dom-muted px-3.5 py-1.5 text-xs font-nunito font-500 text-dom-muted-fg">
            Zagreb, HR
          </span>
          <a
            href="/search"
            className="rounded-full bg-dom-primary px-5 py-2 text-sm font-nunito font-600 text-dom-primary-fg shadow-moss transition-all duration-300 hover:scale-105 active:scale-95"
          >
            Prijava
          </a>
        </div>
      </nav>
    </header>
  );
}
