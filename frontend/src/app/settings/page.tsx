"use client";

import React, { useState, useEffect } from "react";
import { Settings, Shield, Key, Bell, Database, LogOut } from "lucide-react";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const raw = localStorage.getItem("phishguard_user");
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {}
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("phishguard_token");
    localStorage.removeItem("phishguard_user");
    window.location.href = "/";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div className="space-y-1 pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          <span>Security &amp; System Settings</span>
        </h1>
        <p className="text-xs text-slate-400">
          Manage scanning environment parameters, user profiles, and operational preferences.
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Card */}
        <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">
            User Account Profile
          </h2>
          {user ? (
            <div className="space-y-2 text-xs font-mono">
              <div>Name: <span className="text-slate-100 font-bold">{user.name}</span></div>
              <div>Email: <span className="text-cyan-300">{user.email}</span></div>
              <div>Role: <span className="text-purple-300 font-semibold">{user.role}</span></div>
              <div className="pt-3">
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg hover:bg-rose-500/20 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">
              Operating in anonymous session mode. Sign in to associate scans with your profile.
            </p>
          )}
        </div>

        {/* Engine Parameters */}
        <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">
            Scanner Engine Configuration
          </h2>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800/80">
              <div>
                <span className="font-semibold text-slate-200 block">Strict SSRF Guard</span>
                <span className="text-slate-500">Blocks local, RFC1918, and link-local destinations</span>
              </div>
              <span className="text-emerald-400 font-mono font-bold">ENFORCED</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800/80">
              <div>
                <span className="font-semibold text-slate-200 block">Explainability Synthesis</span>
                <span className="text-slate-500">Feature contribution mapping with deterministic fallback</span>
              </div>
              <span className="text-cyan-400 font-mono font-bold">ACTIVE</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800/80">
              <div>
                <span className="font-semibold text-slate-200 block">Threat Intelligence Feed</span>
                <span className="text-slate-500">External provider query adapter</span>
              </div>
              <span className="text-amber-400 font-mono font-bold">OFFLINE SAFE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
