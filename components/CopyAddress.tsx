"use client";

import { useState } from "react";
import { MINT } from "@/lib/constants";

export default function CopyAddress() {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(MINT);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard API unavailable; no-op
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="group flex w-full items-center justify-between gap-3 rounded-[28px] border border-white/[0.08] bg-navy-800/50 px-5 py-4 text-left shadow-card transition-colors hover:border-navy-500"
    >
      <div className="min-w-0">
        <div className="text-[11px] font-medium uppercase tracking-wider text-navy-400">
          Contract address
        </div>
        <div className="mt-1 truncate font-mono text-sm text-navy-200">
          {MINT}
        </div>
      </div>
      <span className="shrink-0 rounded-lg border border-navy-500 px-3 py-1.5 text-xs font-medium text-navy-200 transition-colors group-hover:border-action group-hover:text-sky-300">
        {copied ? "Copied" : "Copy"}
      </span>
    </button>
  );
}
