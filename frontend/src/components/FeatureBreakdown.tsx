import React from "react";
import { ExtractedFeatures } from "@/lib/api";
import { CheckCircle2, XCircle, AlertTriangle, Globe, Lock, Code2, Hash } from "lucide-react";

interface FeatureBreakdownProps {
  features?: ExtractedFeatures;
}

export function FeatureBreakdown({ features }: FeatureBreakdownProps) {
  if (!features) {
    return (
      <div className="p-6 bg-slate-900/50 rounded-xl border border-slate-800 text-slate-400 text-sm">
        No feature vector available.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Structural & Lexical Card */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800/80">
          <Code2 className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            URL Structure & Lexical Metrics
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm font-mono">
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/60">
            <span className="text-xs text-slate-400 block font-sans">Total Length</span>
            <span className="text-base text-slate-100 font-bold">{features.url_length} chars</span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/60">
            <span className="text-xs text-slate-400 block font-sans">Domain Length</span>
            <span className="text-base text-slate-100 font-bold">{features.domain_length} chars</span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/60">
            <span className="text-xs text-slate-400 block font-sans">Path Length</span>
            <span className="text-base text-slate-100 font-bold">{features.path_length} chars</span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/60">
            <span className="text-xs text-slate-400 block font-sans">Shannon Entropy</span>
            <span className={`text-base font-bold ${features.url_entropy > 4.5 ? "text-amber-400" : "text-emerald-400"}`}>
              {features.url_entropy}
            </span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/60">
            <span className="text-xs text-slate-400 block font-sans">Digits</span>
            <span className="text-base text-slate-100 font-bold">{features.digit_count}</span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/60">
            <span className="text-xs text-slate-400 block font-sans">Special Chars</span>
            <span className="text-base text-slate-100 font-bold">{features.special_character_count}</span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/60">
            <span className="text-xs text-slate-400 block font-sans">Subdomains</span>
            <span className={`text-base font-bold ${features.subdomain_count > 2 ? "text-rose-400" : "text-slate-100"}`}>
              {features.subdomain_count}
            </span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/60">
            <span className="text-xs text-slate-400 block font-sans">Parameters</span>
            <span className="text-base text-slate-100 font-bold">{features.query_param_count}</span>
          </div>
        </div>
      </div>

      {/* Security Flags Card */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800/80">
          <Lock className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Security & Deception Indicators
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          {/* HTTPS */}
          <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-lg border border-slate-800/60">
            <span className="text-slate-300">HTTPS Transport</span>
            {features.has_https ? (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4" /> Valid SSL
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-rose-400 font-medium">
                <XCircle className="w-4 h-4" /> Plain HTTP
              </span>
            )}
          </div>

          {/* Raw IP */}
          <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-lg border border-slate-800/60">
            <span className="text-slate-300">Raw IP Hostname</span>
            {features.has_ip ? (
              <span className="flex items-center gap-1.5 text-xs text-rose-400 font-medium">
                <AlertTriangle className="w-4 h-4" /> Detected (High)
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4" /> FQDN Domain
              </span>
            )}
          </div>

          {/* Suspicious Keywords */}
          <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-lg border border-slate-800/60">
            <span className="text-slate-300">Targeting Keywords</span>
            <span className={`text-xs font-semibold ${features.suspicious_keyword_count > 0 ? "text-amber-400" : "text-emerald-400"}`}>
              {features.suspicious_keyword_count} detected
            </span>
          </div>

          {/* Shortener */}
          <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-lg border border-slate-800/60">
            <span className="text-slate-300">URL Shortener Mask</span>
            {features.is_shortened ? (
              <span className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                <AlertTriangle className="w-4 h-4" /> Shortened
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4" /> Direct Host
              </span>
            )}
          </div>

          {/* Suspicious TLD */}
          <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-lg border border-slate-800/60">
            <span className="text-slate-300">High-Risk TLD</span>
            {features.suspicious_tld ? (
              <span className="flex items-center gap-1.5 text-xs text-rose-400 font-medium">
                <AlertTriangle className="w-4 h-4" /> Bulk Disposable
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4" /> Standard TLD
              </span>
            )}
          </div>

          {/* Punycode */}
          <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-lg border border-slate-800/60">
            <span className="text-slate-300">Punycode / Homoglyph</span>
            {features.has_punycode ? (
              <span className="flex items-center gap-1.5 text-xs text-rose-400 font-medium">
                <AlertTriangle className="w-4 h-4" /> Present (xn--)
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4" /> Clean ASCII
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
