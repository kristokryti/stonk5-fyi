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
    <div
      className="glass flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center"
      style={{ backdropFilter: "none", WebkitBackdropFilter: "none", background: "#0e1426" }}
    >
      <div className="min-w-0">
        <div className="label">Contract address</div>
        <div className="code mt-1.5 text-[15px] text-ink2" style={{ overflowWrap: "anywhere" }}>
          {MINT}
        </div>
      </div>
      <button onClick={handleCopy} className="btn btn-ghost btn-sm shrink-0">
        {copied ? "Copied" : "Copy"}
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? "Address copied to clipboard" : ""}
      </span>
    </div>
  );
}
