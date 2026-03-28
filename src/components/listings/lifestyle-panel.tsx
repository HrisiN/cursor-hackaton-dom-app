"use client";

import { Slider } from "@/components/ui/slider";
import type { LifestylePriorities } from "@/lib/scoring";

interface LifestylePanelProps {
  priorities: LifestylePriorities;
  onChange: (priorities: LifestylePriorities) => void;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

const FACTORS: { key: keyof LifestylePriorities; label: string; icon: string }[] = [
  { key: "transit", label: "Public transport", icon: "🚋" },
  { key: "kindergarten", label: "Kindergartens & schools", icon: "🏫" },
  { key: "hospital", label: "Hospital nearby", icon: "🏥" },
  { key: "park", label: "Parks & green space", icon: "🌳" },
  { key: "price", label: "Best price per m²", icon: "💰" },
];

export function LifestylePanel({ priorities, onChange, enabled, onToggle }: LifestylePanelProps) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm">Lifestyle Match</h3>
          <p className="text-xs text-muted-foreground">What matters most to you?</p>
        </div>
        <button
          onClick={() => onToggle(!enabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            enabled ? "bg-emerald-600" : "bg-gray-200"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {enabled && (
        <div className="space-y-3">
          {FACTORS.map(({ key, label, icon }) => (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span>
                  {icon} {label}
                </span>
                <span className="font-medium text-muted-foreground">{priorities[key]}/7</span>
              </div>
              <Slider
                value={[priorities[key]]}
                min={0}
                max={7}
                step={1}
                onValueChange={(val) => onChange({ ...priorities, [key]: Array.isArray(val) ? val[0] : val })}
                className="w-full"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
