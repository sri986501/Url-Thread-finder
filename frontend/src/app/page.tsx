"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldAlert,
  ArrowRight,
  Cpu,
  Layers,
  Sparkles,
  Lock,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  FileText
} from "lucide-react";
import { api } from "@/lib/api";

export default function LandingPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const scan = await api.scanUrl(url.trim());
      router.push(`/result/${scan.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to analyze URL.");
      setLoading(false);
    }
  };

  const sampleTargets = [
    { label: "Legitimate Wikipedia Link", url: "https://en.wikipedia.org/wiki/Phishing", type: "safe" },
    { label: "Spoofed Banking Portal", url: "http://paypal-security-verification-alert.account-update.xyz/login.php", type: "phish" },
    { label: "Raw IP Host Attack", url: "http://192.168.1.104/secure-banking/chase/sign_in.htm", type: "phish" }
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="text-center pt-8 sm:pt-14 max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Production ML Classifier & Threat Signal Fusion</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
          AI-Powered Phishing URL Detection &amp; Risk Intelligence
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
          Analyze suspicious links before they become security incidents. Authoritative XGBoost classification, 26+ lexical/host signals, and explainable AI insights.
        </p>

        {/* Scanner Bar */}
        <div className="max-w-2xl mx-auto pt-2">
          <form onSubmit={handleScan} className="relative flex flex-col sm:flex-row gap-2 p-2 bg-slate-900/80 rounded-2xl border border-slate-800 shadow-2xl backdrop-blur-xl">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste any suspicious URL (e.g. https://domain.com/login)..."
              disabled={loading}
              className="flex-1 bg-transparent px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none rounded-xl"
            />
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <span>Analyze URL</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {error && (
            <p className="mt-2 text-xs text-rose-400 font-mono text-left px-2">
              ⚠️ {error}
            </p>
          )}

          {/* Quick Click Samples */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-slate-400">
            <span className="font-mono text-[11px] text-slate-500">Test Samples:</span>
            {sampleTargets.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setUrl(s.url)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono border transition-colors ${
                  s.type === "safe"
                    ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10"
                    : "border-rose-500/20 bg-rose-500/5 text-rose-400 hover:bg-rose-500/10"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Detection Pipeline Section */}
      <section className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 sm:p-10 backdrop-blur-sm">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            How The Detection Pipeline Works
          </h2>
          <p className="text-sm text-slate-400">
            Explainable by design. The machine learning model acts as the authoritative classifier, while AI contextualizes the evidence.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/60 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center font-mono font-bold text-xs">
              01
            </div>
            <h3 className="text-sm font-semibold text-white">URL Normalization</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Strict SSRF isolation, protocol verification, and canonical hostname extraction.
            </p>
          </div>

          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/60 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-mono font-bold text-xs">
              02
            </div>
            <h3 className="text-sm font-semibold text-white">Feature Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Extracts 26 features including Shannon entropy, disposable TLDs, and auth tokens.
            </p>
          </div>

          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/60 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-mono font-bold text-xs">
              03
            </div>
            <h3 className="text-sm font-semibold text-white">XGBoost Inference</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Trained champion ensemble computes non-linear probability &amp; feature importance weights.
            </p>
          </div>

          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/60 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-mono font-bold text-xs">
              04
            </div>
            <h3 className="text-sm font-semibold text-white">Risk Calibration</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Fuses model probability with threat feeds into calibrated 0–100 risk score and verdict.
            </p>
          </div>

          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/60 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono font-bold text-xs">
              05
            </div>
            <h3 className="text-sm font-semibold text-white">Explainable AI</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Synthesizes actionable plain-English explanation grounded strictly on empirical evidence.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-slate-900/40 rounded-2xl border border-slate-800/80 space-y-3">
          <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Explainable Machine Learning</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            No black-box answers. Each risk score breaks down individual feature contributions and structural deception indicators.
          </p>
        </div>

        <div className="p-6 bg-slate-900/40 rounded-2xl border border-slate-800/80 space-y-3">
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Safe Sandboxed Analysis</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Strict SSRF protection blocks scanning of local loopback or cloud metadata services. No unsafe backend web fetching.
          </p>
        </div>

        <div className="p-6 bg-slate-900/40 rounded-2xl border border-slate-800/80 space-y-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Enterprise Tooling</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Side-by-side URL comparison, bulk batch file processing, audit logging, and downloadable CSV compliance reports.
          </p>
        </div>
      </section>

      {/* Cybersecurity Disclaimer (Section 54) */}
      <section className="p-4 sm:p-5 rounded-xl bg-slate-950 border border-slate-800/80 text-slate-400 text-xs flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-slate-200">Cybersecurity Advisory &amp; Disclaimer</span>
          <p>
            PhishGuard AI provides automated risk analysis and should not be treated as a guarantee of safety. Security classifications may contain false positives or false negatives. Never submit sensitive authentication credentials to untrusted destinations.
          </p>
        </div>
      </section>
    </div>
  );
}
