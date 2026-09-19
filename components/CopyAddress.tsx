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
      className="group flex w-full items-center justify-between gap-2 rounded-xl border border-navy-700 bg-navy-800/60 px-4 py-3 text-left transition hover:border-navy-500"
    >
      <div className="min-w-0">
        <div className="text-xs uppercase tracking-wide text-navy-400">
          Contract address
        </div>
        <div className="mt-1 truncate font-mono text-sm text-navy-200">
          {MINT}
        </div>
      </div>
      <span className="shrink-0 rounded-lg border border-navy-500 px-2 py-1 text-xs text-navy-200 group-hover:border-teal">
        {copied ? "Copied" : "Copy"}
      </span>
    </button>
  );
}
