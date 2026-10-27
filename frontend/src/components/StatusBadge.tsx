import React from "react";
import { ShieldCheck, AlertTriangle, ShieldAlert, AlertOctagon, Info } from "lucide-react";

interface StatusBadgeProps {
  verdict: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function StatusBadge({ verdict, className = "", size = "md" }: StatusBadgeProps) {
  const norm = (verdict || "").toUpperCase();

  const config = {
    SAFE: {
      label: "SAFE",
      color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      dot: "bg-emerald-500",
      icon: ShieldCheck,
    },
    LOW_RISK: {
      label: "LOW RISK",
      color: "bg-sky-500/10 text-sky-400 border-sky-500/20",
      dot: "bg-sky-500",
      icon: Info,
    },
    SUSPICIOUS: {
      label: "SUSPICIOUS",
      color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      dot: "bg-amber-500",
      icon: AlertTriangle,
    },
    HIGH_RISK: {
      label: "HIGH RISK",
      color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      dot: "bg-orange-500",
      icon: ShieldAlert,
    },
    CRITICAL: {
      label: "CRITICAL",
      color: "bg-rose-500/10 text-rose-400 border-rose-500/30",
      dot: "bg-rose-500 animate-pulse",
      icon: AlertOctagon,
    },
    ERROR: {
      label: "ERROR",
      color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
      dot: "bg-zinc-500",
      icon: AlertTriangle,
    },
  }[norm] || {
    label: verdict,
    color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    dot: "bg-zinc-500",
    icon: Info,
  };

  const Icon = config.icon;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1.5",
    md: "px-2.5 py-1 text-xs font-medium gap-2",
    lg: "px-3.5 py-1.5 text-sm font-semibold gap-2.5",
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.color} ${sizeClasses} ${className}`}
      role="status"
      aria-label={`Security Verdict: ${config.label}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      <Icon className={size === "lg" ? "w-4 h-4" : "w-3.5 h-3.5"} />
      <span>{config.label}</span>
    </span>
  );
}
