"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { TokenStats } from "./types";
import { REFRESH_INTERVAL_MS } from "./constants";

interface StatsContextValue {
  stats: TokenStats | null;
  error: string | null;
  stale: boolean;
}

const StatsContext = createContext<StatsContextValue>({
  stats: null,
  error: null,
  stale: false,
});

export function useStats() {
  return useContext(StatsContext);
}

export function StatsProvider({
  initialStats,
  children,
}: {
  initialStats: TokenStats | null;
  children: React.ReactNode;
}) {
  const [stats, setStats] = useState<TokenStats | null>(initialStats);
  const [error, setError] = useState<string | null>(
    initialStats ? null : "Unable to load live data right now."
  );
  const [stale, setStale] = useState(false);
  const lastOkRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | null = null;
    lastOkRef.current = Date.now();

    async function poll() {
      try {
        const res = await fetch("/api/stats", { cache: "no-store" });
        if (!res.ok) throw new Error("stats endpoint error");
        const data = (await res.json()) as TokenStats;
        if (!cancelled) {
          setStats(data);
          setError(null);
          lastOkRef.current = Date.now();
        }
      } catch {
        if (!cancelled) setError("Live refresh failed — showing last known data.");
      }
    }

    function start() {
      poll();
      interval = setInterval(poll, REFRESH_INTERVAL_MS);
    }
    function stop() {
      if (interval) clearInterval(interval);
      interval = null;
    }
    function onVisibilityChange() {
      if (document.hidden) stop();
      else start();
    }

    if (!document.hidden) start();
    document.addEventListener("visibilitychange", onVisibilityChange);

    const staleCheck = setInterval(() => {
      setStale(Date.now() - (lastOkRef.current ?? Date.now()) > 3 * 60 * 1000);
    }, 5_000);

    return () => {
      cancelled = true;
      stop();
      clearInterval(staleCheck);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return (
    <StatsContext.Provider value={{ stats, error, stale }}>
      {children}
    </StatsContext.Provider>
  );
}
