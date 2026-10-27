"use client";

import React, { useState } from "react";
import {
  Layers,
  Upload,
  Download,
  AlertTriangle,
  CheckCircle2,
  FileText,
  ArrowRight
} from "lucide-react";
import { api } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";

export default function BatchScanPage() {
  const [textInput, setTextInput] = useState(
    "https://www.google.com\n" +
    "http://paypal-security-verification-alert.account-update.xyz/login.php\n" +
    "https://github.com\n" +
    "http://192.168.1.104/secure-banking/chase/sign_in.htm"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);

  const handleRunBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    const urls = textInput
      .split("\n")
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    if (urls.length === 0) return;

    setLoading(true);
    setError(null);
    try {
      const res = await api.batchScan(urls);
      setResults(res.results);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Batch scan failed.");
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      setTextInput(content);
    };
    reader.readAsText(file);
  };

  const downloadResultsCSV = () => {
    if (results.length === 0) return;
    const header = "URL,Risk Score,Verdict,Confidence,Model\n";
    const rows = results
      .map((r) => `"${r.url}",${r.risk_score},"${r.verdict}",${r.confidence},"${r.model_name}"`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "phishguard_batch_results.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>High-Throughput Batch URL Scanner</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Submit multiple URLs via raw input or CSV file to batch-classify threat levels and export results.
          </p>
        </div>

        {results.length > 0 && (
          <button
            onClick={downloadResultsCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors shadow-sm self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Batch CSV</span>
          </button>
        )}
      </div>

      {/* Input Card */}
      <form onSubmit={handleRunBatch} className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-mono uppercase text-slate-400 font-semibold">
            Input URLs (One per line — up to 50 items)
          </label>
          <div className="relative">
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full"
            />
            <span className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-mono cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              Upload .CSV / .TXT
            </span>
          </div>
        </div>

        <textarea
          rows={6}
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="https://example1.com&#10;https://example2.com"
          className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
        />

        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] text-slate-500 font-mono">
            {textInput.split("\n").filter((l) => l.trim()).length} URLs detected
          </span>
          <button
            type="submit"
            disabled={loading || !textInput.trim()}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing Batch...</span>
              </>
            ) : (
              <>
                <Layers className="w-3.5 h-3.5" />
                <span>Execute Batch Scan</span>
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

      {/* Results Table (Section 24) */}
      {results.length > 0 && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">
              Batch Scan Results ({results.length} processed)
            </h2>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-900/50 shadow-lg">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Destination URL</th>
                  <th className="px-4 py-3">Risk Score</th>
                  <th className="px-4 py-3">Verdict</th>
                  <th className="px-4 py-3">Confidence</th>
                  <th className="px-4 py-3">Model</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {results.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 max-w-sm truncate text-cyan-300 font-sans">
                      {r.url}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-100">
                      {r.error ? "N/A" : `${r.risk_score} / 100`}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge verdict={r.error ? "ERROR" : r.verdict} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {r.error ? "—" : `${(r.confidence * 100).toFixed(0)}%`}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {r.model_name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
