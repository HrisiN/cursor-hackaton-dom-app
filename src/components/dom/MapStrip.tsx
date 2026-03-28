"use client";

const PINS = [
  { label: "€550", left: "22%", top: "30%" },
  { label: "€900", left: "55%", top: "25%" },
  { label: "€380", left: "35%", top: "55%" },
  { label: "€1.1k", left: "68%", top: "45%" },
  { label: "€650", left: "45%", top: "70%" },
  { label: "€185k", left: "78%", top: "60%" },
];

export function MapStrip() {
  return (
    <section className="relative mt-6 h-[160px] overflow-hidden rounded-[2.5rem_2rem_2.5rem_2rem] border border-dom-border/60 bg-[#EAE5DA] shadow-moss">
      {/* SVG road grid */}
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        {/* Horizontal roads */}
        <line x1="0" y1="40" x2="100%" y2="40" stroke="#D8D0C4" strokeWidth="1.5" />
        <line x1="0" y1="80" x2="100%" y2="80" stroke="#D8D0C4" strokeWidth="1" />
        <line x1="0" y1="120" x2="100%" y2="120" stroke="#D8D0C4" strokeWidth="1.5" />
        {/* Vertical roads */}
        <line x1="20%" y1="0" x2="20%" y2="100%" stroke="#D8D0C4" strokeWidth="1" />
        <line x1="40%" y1="0" x2="40%" y2="100%" stroke="#D8D0C4" strokeWidth="1.5" />
        <line x1="60%" y1="0" x2="60%" y2="100%" stroke="#D8D0C4" strokeWidth="1" />
        <line x1="80%" y1="0" x2="80%" y2="100%" stroke="#D8D0C4" strokeWidth="1" />
        {/* Building blocks */}
        <rect x="25%" y="10" width="10%" height="22" rx="4" fill="#D8D0C4" opacity="0.5" />
        <rect x="45%" y="85" width="8%" height="28" rx="4" fill="#D8D0C4" opacity="0.4" />
        <rect x="65%" y="15" width="6%" height="18" rx="3" fill="#D8D0C4" opacity="0.45" />
        <rect x="10%" y="90" width="7%" height="20" rx="3" fill="#D8D0C4" opacity="0.35" />
        <rect x="75%" y="95" width="12%" height="24" rx="4" fill="#D8D0C4" opacity="0.4" />
        <rect x="30%" y="50" width="5%" height="15" rx="3" fill="#D8D0C4" opacity="0.3" />
      </svg>

      {/* Price pins */}
      {PINS.map((pin) => (
        <div
          key={pin.label}
          className="absolute transition-all duration-250 hover:scale-105 hover:-translate-y-0.5"
          style={{ left: pin.left, top: pin.top }}
        >
          <div className="relative">
            <span className="inline-block rounded-full bg-dom-primary px-2.5 py-1 font-nunito text-[10px] font-bold text-white shadow-moss">
              {pin.label}
            </span>
            <div className="mx-auto w-0 h-0 border-l-[4px] border-r-[4px] border-t-[5px] border-l-transparent border-r-transparent border-t-dom-primary" />
          </div>
        </div>
      ))}

      {/* Bottom-left label */}
      <div className="absolute bottom-3 left-4">
        <span className="rounded-full border border-dom-border bg-dom-bg/85 px-3 py-1 font-nunito text-[10px] font-500 text-dom-muted-fg">
          Zagreb · karta
        </span>
      </div>
    </section>
  );
}
