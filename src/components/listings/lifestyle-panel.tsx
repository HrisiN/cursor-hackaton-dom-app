"use client";

import { Slider } from "@/components/ui/slider";
import { TramFront, GraduationCap, Cross, TreePine, Coins } from "lucide-react";
import type { LifestylePriorities } from "@/lib/scoring";
import type { LucideIcon } from "lucide-react";

interface LifestylePanelProps {
  priorities: LifestylePriorities;
  onChange: (priorities: LifestylePriorities) => void;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

const FACTORS: { key: keyof LifestylePriorities; label: string; Icon: LucideIcon }[] = [
  { key: "transit", label: "Public transport", Icon: TramFront },
  { key: "kindergarten", label: "Kindergartens & schools", Icon: GraduationCap },
  { key: "hospital", label: "Hospital nearby", Icon: Cross },
  { key: "park", label: "Parks & green space", Icon: TreePine },
  { key: "price", label: "Best price per m²", Icon: Coins },
];

export function LifestylePanel({ priorities, onChange, enabled, onToggle }: LifestylePanelProps) {
  return (
    <div className="rounded-2xl border border-dom-border/60 bg-dom-card p-4 shadow-moss space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-fraunces font-700 text-sm">Lifestyle Match</h3>
          <p className="text-xs text-dom-muted-fg font-nunito">What matters most to you?</p>
        </div>
        <button
          onClick={() => onToggle(!enabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
            enabled ? "bg-dom-primary" : "bg-dom-border"
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
          {FACTORS.map(({ key, label, Icon }) => (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5 text-emerald-600" />
                  {label}
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
