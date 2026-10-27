import React from "react";
import { StatusBadge } from "./StatusBadge";

interface RiskGaugeProps {
  score: number; // 0 to 100
  verdict: string;
  confidence: number; // 0 to 1
  size?: "sm" | "md" | "lg";
}

export function RiskGauge({ score, verdict, confidence, size = "md" }: RiskGaugeProps) {
  const clampedScore = Math.min(100, Math.max(0, score));
  const confidencePct = Math.round(confidence * 100);

  // Determine stroke color
  const getColor = (s: number) => {
    if (s <= 20) return "#10b981"; // emerald-500
    if (s <= 40) return "#38bdf8"; // sky-400
    if (s <= 60) return "#f59e0b"; // amber-500
    if (s <= 80) return "#f97316"; // orange-500
    return "#f43f5e"; // rose-500
  };

  const strokeColor = getColor(clampedScore);

  // Radial dimensions
  const radius = size === "lg" ? 84 : size === "sm" ? 48 : 68;
  const stroke = size === "lg" ? 14 : size === "sm" ? 8 : 11;
  const circumference = 2 * Math.PI * radius;
  // Use a 260-degree arc for a modern gauge look
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-900/60 rounded-2xl border border-slate-800/80 backdrop-blur-sm shadow-xl">
      <div className="relative flex items-center justify-center">
        <svg
          className="transform -rotate-90"
          width={radius * 2 + stroke * 2}
          height={radius * 2 + stroke * 2}
        >
          {/* Background circle */}
          <circle
            cx={radius + stroke}
            cy={radius + stroke}
            r={radius}
            stroke="#1e293b"
            strokeWidth={stroke}
            fill="transparent"
          />
          {/* Animated score arc */}
          <circle
            cx={radius + stroke}
            cy={radius + stroke}
            r={radius}
            stroke={strokeColor}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-4xl md:text-5xl font-black tracking-tight text-white font-mono">
            {clampedScore}
          </span>
          <span className="text-xs uppercase tracking-widest text-slate-400 font-medium">
            / 100 Risk
          </span>
        </div>
      </div>

      <div className="mt-5 flex flex-col items-center gap-2">
        <StatusBadge verdict={verdict} size="lg" />
        <span className="text-xs text-slate-400 font-mono">
          Model Confidence: <span className="text-slate-200 font-semibold">{confidencePct}%</span>
        </span>
      </div>

      {/* Threshold indicator bar */}
      <div className="w-full mt-6 pt-4 border-t border-slate-800/60">
        <div className="flex justify-between text-[10px] text-slate-500 font-mono mb-1.5">
          <span>0 SAFE</span>
          <span>40</span>
          <span>60</span>
          <span>80</span>
          <span>100 CRIT</span>
        </div>
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
          <div className="w-[20%] bg-emerald-500/40" />
          <div className="w-[20%] bg-sky-500/40" />
          <div className="w-[20%] bg-amber-500/40" />
          <div className="w-[20%] bg-orange-500/40" />
          <div className="w-[20%] bg-rose-500/40" />
        </div>
      </div>
    </div>
  );
}
