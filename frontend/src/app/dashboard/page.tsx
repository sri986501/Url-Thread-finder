"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  ArrowUpRight,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Clock,
  Layers,
  ArrowRight
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from "recharts";
import { api, AnalyticsSummary, ScanListItem } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";

export default function DashboardPage() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [recentScans, setRecentScans] = useState<ScanListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getAnalytics(),
      api.getHistory({ page_size: 6 })
    ]).then(([analytics, history]) => {
      setData(analytics);
      setRecentScans(history.items);
      setLoading(false);
    }).catch((err) => {
      console.error("Dashboard error:", err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-mono text-slate-400">Loading security operations overview...</p>
      </div>
    );
  }

  const overview = data?.overview || {
    total_scans: 0,
    threats_detected: 0,
    high_risk_scans: 0,
    detection_rate_pct: 0,
    average_risk_score: 0
  };

  const trendData = data?.recent_trend || [];
  const riskDist = data?.risk_distribution || [];

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner (Section 60) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-xs font-mono uppercase text-cyan-400 tracking-wider font-semibold">
            Operational Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Security Intelligence Overview
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time phishing telemetry and automated model inference results.
          </p>
        </div>

        <Link
          href="/scan"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-cyan-500/20 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Search className="w-4 h-4" />
          <span>Scan New URL</span>
        </Link>
      </div>

      {/* Top 4 KPI Metrics (Section 20 & 60) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-slate-900/60 rounded-2xl border border-slate-800 backdrop-blur-sm space-y-1">
          <span className="text-xs text-slate-400 font-medium font-sans">Total Scans</span>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {overview.total_scans.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500 font-mono block">Audited URLs</span>
        </div>

        <div className="p-5 bg-slate-900/60 rounded-2xl border border-slate-800 backdrop-blur-sm space-y-1">
          <span className="text-xs text-slate-400 font-medium font-sans">Threats Detected</span>
          <div className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">
            {overview.threats_detected.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500 font-mono block">
            {overview.detection_rate_pct}% Detection Rate
          </span>
        </div>

        <div className="p-5 bg-slate-900/60 rounded-2xl border border-slate-800 backdrop-blur-sm space-y-1">
          <span className="text-xs text-slate-400 font-medium font-sans">High Risk / Critical</span>
          <div className="text-2xl sm:text-3xl font-black text-orange-400 font-mono">
            {overview.high_risk_scans.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500 font-mono block">Active campaigns</span>
        </div>

        <div className="p-5 bg-slate-900/60 rounded-2xl border border-slate-800 backdrop-blur-sm space-y-1">
          <span className="text-xs text-slate-400 font-medium font-sans">Average Risk Score</span>
          <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">
            {overview.average_risk_score} <span className="text-xs text-slate-500 font-normal">/ 100</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono block">Across all telemetry</span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart (2 Columns) */}
        <div className="lg:col-span-2 p-6 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">
                Scan Activity &amp; Threat Volume (Last 7 Days)
              </h2>
              <span className="text-xs text-slate-500">Total scans vs malicious detections</span>
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "8px", fontSize: "12px" }}
                  />
                  <Area type="monotone" dataKey="total_scans" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" name="Total Scans" />
                  <Area type="monotone" dataKey="threats" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorThreats)" name="Threats" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500 font-mono">
                No time-series data yet.
              </div>
            )}
          </div>
        </div>

        {/* Risk Distribution Bar Chart (1 Column) */}
        <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">
              Risk Score Distribution
            </h2>
            <span className="text-xs text-slate-500">Distribution across severity tiers</span>
          </div>

          <div className="h-64 w-full pt-4">
            {riskDist.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskDist}>
                  <XAxis dataKey="range" stroke="#64748b" fontSize={9} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "8px", fontSize: "12px" }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {riskDist.map((entry, index) => {
                      const colors = ["#10b981", "#38bdf8", "#f59e0b", "#f97316", "#f43f5e"];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500 font-mono">
                No bucket data available.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Scans Table (Section 20) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">
              Recent Activity
            </h2>
            <span className="text-xs text-slate-500">Latest analyzed URL destinations</span>
          </div>
          <Link href="/history" className="text-xs text-cyan-400 hover:text-cyan-300 font-medium">
            Explore All History →
          </Link>
        </div>

        {recentScans.length === 0 ? (
          <div className="p-10 bg-slate-900/40 rounded-2xl border border-slate-800 text-center space-y-3">
            <ShieldCheck className="w-8 h-8 text-slate-600 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-300">No scans recorded yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Analyze your first URL to start generating real-time security telemetry and risk analytics.
            </p>
            <Link
              href="/scan"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-semibold text-xs mt-2"
            >
              Analyze URL
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-900/50">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Destination URL</th>
                  <th className="px-4 py-3">Verdict</th>
                  <th className="px-4 py-3">Risk Score</th>
                  <th className="px-4 py-3">Confidence</th>
                  <th className="px-4 py-3">Model</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {recentScans.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 max-w-xs truncate text-cyan-300 font-sans">
                      {s.normalized_url}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge verdict={s.verdict} size="sm" />
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-100">
                      {s.risk_score} / 100
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {(s.confidence * 100).toFixed(0)}%
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {s.model_name}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-[11px]">
                      {new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 text-right font-sans">
                      <Link
                        href={`/result/${s.id}`}
                        className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
