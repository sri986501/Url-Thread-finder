"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  LayoutDashboard,
  Search,
  History,
  BarChart3,
  GitCompare,
  Layers,
  Cpu,
  Globe2,
  ShieldCheck,
  Settings,
  Lock
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const links = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Scan URL", href: "/scan", icon: Search },
    { label: "History", href: "/history", icon: History },
    { label: "Analytics", href: "/analytics", icon: BarChart3 },
    { label: "Compare", href: "/compare", icon: GitCompare },
    { label: "Batch Scan", href: "/batch-scan", icon: Layers },
  ];

  const securityLinks = [
    { label: "Model Intelligence", href: "/admin?tab=models", icon: Cpu },
    { label: "Threat Intelligence", href: "/admin?tab=threat-intel", icon: Globe2 },
  ];

  const adminLinks = [
    { label: "Admin Portal", href: "/admin", icon: ShieldCheck },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 hidden md:flex flex-col border-r border-slate-800/80 bg-[#070b12] text-slate-300 min-h-screen sticky top-0 p-4 shrink-0">
      {/* Brand */}
      <Link href="/" className="flex items-center gap-2.5 px-3 py-4 mb-4 group">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <span className="font-black text-base tracking-wider text-white block leading-none">
            PHISHGUARD<span className="text-cyan-400">.AI</span>
          </span>
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-mono">
            Threat Detection v2
          </span>
        </div>
      </Link>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-3 block mb-2 font-semibold">
            Core Scanner
          </span>
          <div className="space-y-1">
            {links.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-cyan-400" : "text-slate-400"}`} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Security Section */}
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-3 block mb-2 font-semibold">
            Security & Signals
          </span>
          <div className="space-y-1">
            {securityLinks.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className="w-4 h-4 text-slate-400" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Admin Section */}
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-3 block mb-2 font-semibold">
            Management
          </span>
          <div className="space-y-1">
            {adminLinks.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className="w-4 h-4 text-slate-400" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Status Footer */}
      <div className="mt-auto pt-4 border-t border-slate-800/80">
        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-mono text-slate-300">ML Engine v2</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 font-semibold px-2 py-0.5 bg-emerald-500/10 rounded border border-emerald-500/20">
            ONLINE
          </span>
        </div>
      </div>
    </aside>
  );
}
