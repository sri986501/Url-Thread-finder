"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Clock,
  History,
  AlertTriangle
} from "lucide-react";
import { api, ScanListItem } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";

export default function ScanPage() {
  const [url, setUrl] = useState("");
  const [stage, setStage] = useState<number | null>(null); // 0 to 4
  const [error, setError] = useState<string | null>(null);
  const [recentScans, setRecentScans] = useState<ScanListItem[]>([]);
  const router = useRouter();

  const stages = [
    "Validating & normalizing URL scheme",
    "Extracting 26 lexical & host features",
    "Executing XGBoost model inference",
    "Querying threat intelligence signals",
    "Synthesizing explainable risk report"
  ];

  useEffect(() => {
    // Load recent scans
    api.getHistory({ page_size: 5 })
      .then((res) => setRecentScans(res.items))
      .catch(() => {});
  }, []);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || stage !== null) return;

    setError(null);
    setStage(0);

    // Simulate authentic stage progression while awaiting scan response
    const interval = setInterval(() => {
      setStage((prev) => (prev !== null && prev < 4 ? prev + 1 : prev));
    }, 280);

    try {
      const scan = await api.scanUrl(url.trim());
      clearInterval(interval);
      setStage(4);
      setTimeout(() => {
        router.push(`/result/${scan.id}`);
      }, 350);
    } catch (err: any) {
      clearInterval(interval);
      setStage(null);
      setError(err.message || "Failed to scan URL.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Analyze Suspicious URL
        </h1>
        <p className="text-sm text-slate-400">
          Enter an unknown link to extract threat indicators, determine machine-learning risk scores, and view explainable intelligence.
        </p>
      </div>

      {/* Main Scan Form */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-xl space-y-6">
        <form onSubmit={handleScan} className="space-y-4">
          <div>
            <label htmlFor="url-input" className="block text-xs font-mono uppercase text-slate-400 mb-2 font-semibold">
              Target Web Address (HTTP / HTTPS)
            </label>
            <div className="relative">
              <input
                id="url-input"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example-banking-login.com/checkpoint?id=892"
                disabled={stage !== null}
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <span className="text-xs text-slate-500">
              🔒 Safe isolation: submitted destination will not be fetched directly by the backend.
            </span>

            <button
              type="submit"
              disabled={stage !== null || !url.trim()}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>{stage !== null ? "Analyzing Link..." : "Start Security Scan"}</span>
            </button>
          </div>
        </form>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Scan Error</span>
              <p className="text-xs text-rose-300/90 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Real Progress Stage Indicator */}
        {stage !== null && (
          <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-mono text-cyan-400">
              <span className="flex items-center gap-2 font-semibold">
                <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                Pipeline Active: Stage {stage + 1} of 5
              </span>
              <span>{Math.round(((stage + 1) / 5) * 100)}%</span>
            </div>

            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                style={{ width: `${((stage + 1) / 5) * 100}%` }}
              />
            </div>

            <ul className="space-y-2 text-xs">
              {stages.map((st, idx) => (
                <li
                  key={idx}
                  className={`flex items-center gap-2 ${
                    idx <= stage ? "text-slate-200" : "text-slate-600"
                  }`}
                >
                  {idx < stage ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : idx === stage ? (
                    <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin shrink-0" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-700 shrink-0" />
                  )}
                  <span className={idx === stage ? "font-semibold text-cyan-300" : ""}>{st}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Recent Scans Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            Recent Scans
          </h2>
          <Link href="/history" className="text-xs text-cyan-400 hover:text-cyan-300 font-medium">
            View All History →
          </Link>
        </div>

        {recentScans.length === 0 ? (
          <div className="p-6 bg-slate-900/30 rounded-xl border border-slate-800 text-center text-slate-500 text-sm">
            No recent scans recorded yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5">
            {recentScans.map((s) => (
              <Link
                key={s.id}
                href={`/result/${s.id}`}
                className="p-3.5 bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800/80 rounded-xl flex items-center justify-between gap-4 transition-all group"
              >
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-mono text-slate-300 truncate block group-hover:text-cyan-300 transition-colors">
                    {s.normalized_url}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                    {new Date(s.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge verdict={s.verdict} size="sm" />
                  <span className="text-xs font-mono font-bold text-slate-300">
                    {s.risk_score} <span className="text-[10px] text-slate-500">/ 100</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
