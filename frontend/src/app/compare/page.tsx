"use client";

import React, { useState } from "react";
import {
  GitCompare,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles
} from "lucide-react";
import { api, CompareResult } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";

export default function ComparePage() {
  const [urlA, setUrlA] = useState("https://www.google.com/search?q=cybersecurity");
  const [urlB, setUrlB] = useState("http://paypal-security-verification-alert.account-update.xyz/login.php");
  const [result, setResult] = useState<CompareResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlA.trim() || !urlB.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await api.compareUrls(urlA.trim(), urlB.trim());
      setResult(res);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Failed to compare URLs.");
      setLoading(false);
    }
  };

  const a = result?.url_a_result;
  const b = result?.url_b_result;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="space-y-1 pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-cyan-400" />
          <span>Comparative URL Risk Analysis</span>
        </h1>
        <p className="text-xs text-slate-400">
          Directly evaluate two destinations side-by-side to understand divergence in lexical signals, host attributes, and risk scores.
        </p>
      </div>

      {/* Comparison Form */}
      <form onSubmit={handleCompare} className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-2 font-semibold">
              URL Destination A
            </label>
            <input
              type="text"
              value={urlA}
              onChange={(e) => setUrlA(e.target.value)}
              placeholder="https://legitimate-portal.com"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-2 font-semibold">
              URL Destination B
            </label>
            <input
              type="text"
              value={urlB}
              onChange={(e) => setUrlB(e.target.value)}
              placeholder="http://suspicious-spoofed-bank.xyz"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading || !urlA.trim() || !urlB.trim()}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Evaluating Targets...</span>
              </>
            ) : (
              <>
                <GitCompare className="w-3.5 h-3.5" />
                <span>Execute Comparative Audit</span>
              </>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
          ⚠️ {error}
        </div>
      )}

      {/* Comparison Results Table */}
      {result && a && b && (
        <div className="space-y-6 animate-in fade-in">
          {/* Summary Banner (Section 23) */}
          <div className="p-5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-cyan-400 font-bold uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Comparative Summary
              </span>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-bold">
                Risk Delta: Δ {result.risk_difference} pts
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {result.summary}
            </p>
          </div>

          {/* Side-by-Side Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Target A */}
            <div className="p-5 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-[10px] font-mono uppercase text-slate-500 block font-bold">
                  Target Destination A
                </span>
                <span className="text-xs font-mono text-cyan-300 break-all block mt-1">
                  {a.normalized_url}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Risk Score</span>
                <span className="text-2xl font-black font-mono text-white">
                  {a.risk_score} <span className="text-xs text-slate-500 font-normal">/ 100</span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Verdict</span>
                <StatusBadge verdict={a.verdict} size="sm" />
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Domain Length</span>
                  <span className="text-slate-200">{a.features?.domain_length} chars</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Subdomains</span>
                  <span className="text-slate-200">{a.features?.subdomain_count}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Targeting Keywords</span>
                  <span className="text-slate-200">{a.features?.suspicious_keyword_count}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">HTTPS Transport</span>
                  <span className={a.features?.has_https ? "text-emerald-400" : "text-rose-400"}>
                    {a.features?.has_https ? "Enforced (SSL)" : "Unencrypted"}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Shannon Entropy</span>
                  <span className="text-slate-200">{a.features?.url_entropy}</span>
                </div>
              </div>
            </div>

            {/* Target B */}
            <div className="p-5 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-[10px] font-mono uppercase text-slate-500 block font-bold">
                  Target Destination B
                </span>
                <span className="text-xs font-mono text-cyan-300 break-all block mt-1">
                  {b.normalized_url}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Risk Score</span>
                <span className="text-2xl font-black font-mono text-white">
                  {b.risk_score} <span className="text-xs text-slate-500 font-normal">/ 100</span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Verdict</span>
                <StatusBadge verdict={b.verdict} size="sm" />
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Domain Length</span>
                  <span className="text-slate-200">{b.features?.domain_length} chars</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Subdomains</span>
                  <span className="text-slate-200">{b.features?.subdomain_count}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Targeting Keywords</span>
                  <span className="text-slate-200">{b.features?.suspicious_keyword_count}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">HTTPS Transport</span>
                  <span className={b.features?.has_https ? "text-emerald-400" : "text-rose-400"}>
                    {b.features?.has_https ? "Enforced (SSL)" : "Unencrypted"}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Shannon Entropy</span>
                  <span className="text-slate-200">{b.features?.url_entropy}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
