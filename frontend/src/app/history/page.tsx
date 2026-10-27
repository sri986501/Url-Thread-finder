"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  History,
  Search,
  Filter,
  Download,
  Trash2,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertTriangle
} from "lucide-react";
import { api, ScanListItem, API_BASE_URL } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";

export default function HistoryPage() {
  const [items, setItems] = useState<ScanListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [verdict, setVerdict] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  const loadData = () => {
    setLoading(true);
    api.getHistory({
      page,
      page_size: 10,
      search: search || undefined,
      verdict: verdict || undefined,
      sort_by: sortBy,
      sort_order: sortOrder
    }).then((res) => {
      setItems(res.items);
      setTotal(res.total);
      setTotalPages(res.total_pages);
      setLoading(false);
    }).catch((err) => {
      console.error("History fetch error:", err);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, [page, verdict, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this scan log?")) return;
    try {
      await api.deleteScan(id);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to delete scan.");
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            <span>Scan Audit History</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse, filter, and audit all analyzed URL threat assessments.
          </p>
        </div>

        <a
          href={`${API_BASE_URL}/history/export/csv`}
          download
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          <span>Export CSV</span>
        </a>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audited URLs..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Verdict Filter */}
          <select
            value={verdict}
            onChange={(e) => { setVerdict(e.target.value); setPage(1); }}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Verdicts</option>
            <option value="SAFE">Safe</option>
            <option value="LOW_RISK">Low Risk</option>
            <option value="SUSPICIOUS">Suspicious</option>
            <option value="HIGH_RISK">High Risk</option>
            <option value="CRITICAL">Critical</option>
          </select>

          {/* Sort By */}
          <select
            value={`${sortBy}:${sortOrder}`}
            onChange={(e) => {
              const [sb, so] = e.target.value.split(":");
              setSortBy(sb);
              setSortOrder(so);
              setPage(1);
            }}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-cyan-500"
          >
            <option value="created_at:desc">Newest First</option>
            <option value="created_at:asc">Oldest First</option>
            <option value="risk_score:desc">Highest Risk</option>
            <option value="risk_score:asc">Lowest Risk</option>
          </select>
        </div>
      </div>

      {/* Scans Table */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <span className="text-xs font-mono text-slate-400">Loading audit history...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 bg-slate-900/30 rounded-2xl border border-slate-800 text-center space-y-3">
          <ShieldCheck className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">No scans match query</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search criteria or clear the verdict filters.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-900/50 shadow-lg">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Destination URL</th>
                <th className="px-4 py-3">Verdict</th>
                <th className="px-4 py-3">Risk Score</th>
                <th className="px-4 py-3">Confidence</th>
                <th className="px-4 py-3">Model</th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {items.map((s) => (
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
                    {new Date(s.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-sans space-x-2">
                    <Link
                      href={`/result/${s.id}`}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Delete log"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-2">
          <span>
            Page {page} of {totalPages} ({total} total scans)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:text-white disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:text-white disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
