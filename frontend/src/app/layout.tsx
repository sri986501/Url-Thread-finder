import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "PhishGuard AI — Explainable AI-Powered Phishing URL Detection Platform",
  description: "Enterprise-grade explainable phishing URL detection powered by Machine Learning (XGBoost) and Threat Intelligence signal fusion.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#080c14] text-slate-100 min-h-screen flex antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        <Suspense fallback={<div className="w-64 hidden md:block bg-[#070b12]" />}>
          <Sidebar />
        </Suspense>
        <div className="flex-1 flex flex-col min-w-0">
          <Suspense fallback={<div className="h-16 border-b border-slate-800 bg-[#080c14]" />}>
            <Navbar />
          </Suspense>
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
