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
      className="group flex w-full items-center justify-between gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-left transition hover:border-zinc-700"
    >
      <div className="min-w-0">
        <div className="text-xs uppercase tracking-wide text-zinc-500">
          Contract address
        </div>
        <div className="mt-1 truncate font-mono text-sm text-zinc-300">
          {MINT}
        </div>
      </div>
      <span className="shrink-0 rounded-lg border border-zinc-700 px-2 py-1 text-xs text-zinc-300 group-hover:border-zinc-500">
        {copied ? "Copied" : "Copy"}
      </span>
    </button>
  );
}
