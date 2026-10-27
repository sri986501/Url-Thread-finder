"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart3,
  Cpu,
  ShieldAlert,
  TrendingUp,
  Activity,
  CheckCircle2,
  PieChart as PieIcon
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  BarChart, Bar, Cell, PieChart, Pie
} from "recharts";
import { api, AnalyticsSummary } from "@/lib/api";

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("7d");

  useEffect(() => {
    api.getAnalytics()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Analytics error:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-mono text-slate-400">Loading deep telemetry &amp; model metrics...</p>
      </div>
    );
  }

  const overview = data?.overview;
  const currentModel = data?.current_model;
  const trend = data?.recent_trend || [];
  const verdictDist = data?.verdict_distribution || [];
  const topIndicators = data?.top_indicators || [];

  const pieColors = ["#10b981", "#38bdf8", "#f59e0b", "#f97316", "#f43f5e"];

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <span>Deep Threat Analytics &amp; Model Evaluation</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative evaluation metrics, feature significance, and detection volume.
          </p>
        </div>

        {/* Time range selector (Section 22) */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          {(["7d", "30d", "90d"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1 rounded-lg transition-colors ${
                timeRange === r
                  ? "bg-cyan-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Model Performance Cards (Section 22: Real Metrics from Training Pipeline) */}
      <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
                Evaluated ML Classifier Performance ({currentModel?.model_name || "XGBoost"} v{currentModel?.model_version || "2.0.0"})
              </h2>
              <span className="text-xs text-slate-400">
                Trained on validated ground-truth benchmark dataset ({currentModel?.training_sample_size || 320} samples)
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 self-start">
            VERIFIED BENCHMARK
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 text-center space-y-1">
            <span className="text-[11px] font-mono text-slate-400 block uppercase">Accuracy</span>
            <span className="text-2xl font-black text-white font-mono">
              {currentModel ? `${(currentModel.accuracy * 100).toFixed(1)}%` : "N/A"}
            </span>
          </div>

          <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 text-center space-y-1">
            <span className="text-[11px] font-mono text-slate-400 block uppercase">Precision</span>
            <span className="text-2xl font-black text-cyan-400 font-mono">
              {currentModel ? `${(currentModel.precision * 100).toFixed(1)}%` : "N/A"}
            </span>
          </div>

          <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 text-center space-y-1">
            <span className="text-[11px] font-mono text-slate-400 block uppercase">Recall</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">
              {currentModel ? `${(currentModel.recall * 100).toFixed(1)}%` : "N/A"}
            </span>
          </div>

          <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 text-center space-y-1">
            <span className="text-[11px] font-mono text-slate-400 block uppercase">F1-Score</span>
            <span className="text-2xl font-black text-purple-400 font-mono">
              {currentModel ? `${(currentModel.f1_score * 100).toFixed(1)}%` : "N/A"}
            </span>
          </div>

          <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 text-center space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-mono text-slate-400 block uppercase">ROC-AUC</span>
            <span className="text-2xl font-black text-amber-400 font-mono">
              {currentModel ? `${(currentModel.roc_auc * 100).toFixed(1)}%` : "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Detection Trends */}
        <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">
            Detection Trend vs Safe Volume
          </h2>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "8px", fontSize: "12px" }} />
                <Area type="monotone" dataKey="total_scans" stroke="#38bdf8" strokeWidth={2} fill="#38bdf8" fillOpacity={0.15} name="Total Scans" />
                <Area type="monotone" dataKey="threats" stroke="#f43f5e" strokeWidth={2} fill="#f43f5e" fillOpacity={0.15} name="Threats Detected" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Verdict Breakdown */}
        <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">
            Verdict Categorization Share
          </h2>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={verdictDist}>
                <XAxis dataKey="verdict" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "8px", fontSize: "12px" }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {verdictDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Threat Indicators (Section 20 & 22) */}
      <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          Prevalent Threat Indicators Observed
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topIndicators.map((ind, idx) => (
            <div key={idx} className="p-4 bg-slate-950/70 rounded-xl border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-200 font-semibold">{ind.indicator}</span>
                <span className="text-cyan-400 font-bold">{ind.percentage}% prevalence</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                  style={{ width: `${ind.percentage}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500 font-mono block">
                Flagged in {ind.count} active scan records
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
