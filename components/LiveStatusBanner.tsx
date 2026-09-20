"use client";

import { useStats } from "@/lib/statsContext";

export default function LiveStatusBanner() {
  const { stats, error } = useStats();
  const messages = [error, ...(stats?.warnings ?? [])].filter(
    (m): m is string => Boolean(m)
  );

  if (messages.length === 0) return null;

  return (
    <div className="wrap mt-6 space-y-2">
      {messages.map((message) => (
        <div key={message} className="chip w-fit">
          {message}
        </div>
      ))}
    </div>
  );
}
