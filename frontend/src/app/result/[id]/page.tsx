"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldAlert,
  ArrowLeft,
  Share2,
  Copy,
  Check,
  Cpu,
  Globe2,
  Sparkles,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  FileText
} from "lucide-react";
import { api, ScanDetail } from "@/lib/api";
import { RiskGauge } from "@/components/RiskGauge";
import { StatusBadge } from "@/components/StatusBadge";
import { FeatureBreakdown } from "@/components/FeatureBreakdown";

function ResultContent() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [scan, setScan] = useState<ScanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.getScan(id)
      .then((data) => {
        setScan(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load security scan result.");
        setLoading(false);
      });
  }, [id]);

  const copyUrl = () => {
    if (!scan) return;
    navigator.clipboard.writeText(scan.normalized_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-mono text-slate-400">Loading security assessment #{id}...</p>
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Scan Not Found</h2>
        <p className="text-sm text-slate-400">{error || "Requested scan report could not be retrieved."}</p>
        <Link
          href="/scan"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-200 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Scanner</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href="/scan"
            className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>Security Assessment Report</span>
              <StatusBadge verdict={scan.verdict} size="sm" />
            </h1>
            <span className="text-xs text-slate-500 font-mono">
              Report ID: {scan.id} • Analyzed on {new Date(scan.created_at).toLocaleString()}
            </span>
          </div>
        </div>

        <button
          onClick={copyUrl}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "URL Copied" : "Copy URL"}</span>
        </button>
      </div>

      {/* Target URL Card (Safely Escaped - Never Executable) */}
      <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1 min-w-0 flex-1">
          <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider font-semibold">
            Analyzed Destination
          </span>
          <div className="text-sm font-mono text-cyan-300 break-all select-all">
            {scan.normalized_url}
          </div>
        </div>
        <div className="text-xs text-slate-500 font-mono shrink-0 sm:text-right">
          Length: {scan.normalized_url.length} chars
        </div>
      </div>

      {/* Main Verdict & Gauge Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Risk Gauge */}
        <div className="lg:col-span-1">
          <RiskGauge
            score={scan.risk_score}
            verdict={scan.verdict}
            confidence={scan.confidence}
            size="lg"
          />
        </div>

        {/* Right Column: Recommended Action & AI Explanation */}
        <div className="lg:col-span-2 space-y-6">
          {/* Actionable Recommendation Card */}
          <div className={`p-5 rounded-2xl border ${
            scan.verdict === "SAFE" || scan.verdict === "LOW_RISK"
              ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-200"
              : "bg-rose-500/10 border-rose-500/30 text-rose-200"
          }`}>
            <div className="flex items-start gap-3">
              {scan.verdict === "SAFE" || scan.verdict === "LOW_RISK" ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase font-bold tracking-wider">
                  Recommended Action
                </span>
                <p className="text-sm font-medium leading-relaxed">
                  {scan.recommended_action}
                </p>
              </div>
            </div>
          </div>

          {/* AI Explanation ("Why was this URL flagged?") */}
          <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-3 backdrop-blur-sm shadow-xl">
            <div className="flex items-center gap-2 text-cyan-400">
              <Sparkles className="w-4 h-4" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-mono">
                Explainable Analysis: Why Was This URL Flagged?
              </h2>
            </div>
            <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line font-sans">
              {scan.ai_explanation}
            </div>
          </div>
        </div>
      </div>

      {/* Contributing Risk Factors Cards (Section 19) */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          Contributing Evidence &amp; Risk Factors ({scan.risk_factors.length})
        </h2>

        {scan.risk_factors.length === 0 ? (
          <div className="p-6 bg-slate-900/40 rounded-xl border border-slate-800 text-center text-slate-400 text-sm">
            No anomalous or high-risk deception factors were detected for this URL.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scan.risk_factors.map((rf, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl space-y-2 hover:border-slate-700 transition-colors shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-100">{rf.title}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold border ${
                    rf.severity === "CRITICAL"
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                      : rf.severity === "HIGH"
                      ? "bg-orange-500/20 text-orange-300 border-orange-500/30"
                      : rf.severity === "MEDIUM"
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                      : "bg-sky-500/20 text-sky-300 border-sky-500/30"
                  }`}>
                    {rf.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {rf.description}
                </p>
                <div className="pt-2 text-[10px] font-mono text-slate-500 flex items-center justify-between border-t border-slate-800/60">
                  <span>Deception Factor #{idx + 1}</span>
                  <span>Impact Weight: +{rf.impact_score} pts</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Feature Breakdown Table & Cards */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          Detailed Feature Vector Analysis
        </h2>
        <FeatureBreakdown features={scan.features} />
      </div>

      {/* Model & Intelligence Signals Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* ML Model Card */}
        <div className="p-5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400">
            <Cpu className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
              Authoritative ML Model
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div>
              <span className="text-slate-500 block">Classifier</span>
              <span className="text-slate-200 font-bold">{scan.model_name}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Version</span>
              <span className="text-slate-200 font-bold">{scan.model_version}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Probability</span>
              <span className="text-slate-200 font-bold">
                {scan.prediction ? `${(scan.prediction.probability * 100).toFixed(1)}%` : "N/A"}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Decision</span>
              <span className="text-slate-200 font-bold">
                {scan.prediction?.prediction || "Evaluated"}
              </span>
            </div>
          </div>
        </div>

        {/* Threat Intel Card */}
        <div className="p-5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400">
            <Globe2 className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
              Threat Intelligence Status
            </h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between font-mono">
              <span className="text-slate-500">Provider</span>
              <span className="text-slate-200 font-semibold">
                {scan.threat_intelligence?.provider || "Threat Intelligence Hub"}
              </span>
            </div>
            <div className="flex items-center justify-between font-mono">
              <span className="text-slate-500">Signal Status</span>
              <span className="text-slate-400">
                {scan.threat_intelligence?.status || "unavailable"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 italic pt-1">
              {scan.threat_intelligence?.metadata?.message ||
                "Threat intelligence checked via offline isolated reputation provider."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-mono text-slate-400">Loading security assessment...</p>
      </div>
    }>
      <ResultContent />
    </Suspense>
  );
}
