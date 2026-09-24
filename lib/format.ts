/**
 * Routes a third-party token logo through our own /api/token-image proxy,
 * which always returns a valid image (the real logo, or a generated
 * initials fallback if the upstream host is unreachable) — see that
 * route for why. Returns null if there's no logo to show at all.
 *
 * A same-origin path (e.g. /token-fallback/<mint>.png, from the local
 * basket snapshot) is already a static asset — serve it directly instead
 * of wrapping it in the proxy, which expects an absolute upstream URL.
 */
export function proxiedTokenImage(url: string | null | undefined, symbol: string): string | null {
  if (!url) return null;
  if (url.startsWith("/")) return url;
  return `/api/token-image?url=${encodeURIComponent(url)}&symbol=${encodeURIComponent(symbol)}`;
}

export function formatUsd(value: number | null, opts: { compact?: boolean } = {}): string {
  if (value === null || Number.isNaN(value)) return "—";
  if (opts.compact) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(value);
  }
  const maximumFractionDigits = Math.abs(value) < 1 ? 8 : 2;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits,
  }).format(value);
}

/**
 * Price formatter — brief §7.
 *
 * Returns either `{ text }` for a plain string, or `{ pre, zeros, digits }`
 * for prices small enough to need the subscript-zero-count notation used by
 * DexScreener and friends (e.g. 0.00007171 -> "$0.0" + <sub>4</sub> + "7171").
 * `zeros` is the count of leading zeros after the decimal point, with one
 * zero kept visible before the subscript. This replaces the previous
 * implementation, which dropped that leading zero (an off-by-one bug).
 */
export interface PriceTextShape {
  text: string;
}
export interface PriceSubscriptShape {
  pre: string;
  zeros: number;
  digits: string;
}
export type PriceParts = PriceTextShape | PriceSubscriptShape;

export function priceParts(p: number): PriceParts {
  if (!Number.isFinite(p) || p <= 0) return { text: "—" };
  if (p >= 1) return { text: "$" + p.toLocaleString("en-US", { maximumFractionDigits: 2 }) };
  if (p >= 0.01) return { text: "$" + p.toFixed(4) };
  // Full decimal expansion, no subscript leading-zero-count notation — just
  // a plain number like $0.0004461.
  const [m, e] = p.toExponential(3).split("e"); // "7.171", "-5"
  const digits = m.replace(".", "").replace(/0+$/, "") || "0";
  const zeros = -Number(e) - 1; // leading zeros after "0."
  return { text: "$0." + "0".repeat(zeros) + digits };
}

export function isPriceSubscriptShape(parts: PriceParts): parts is PriceSubscriptShape {
  return "digits" in parts;
}

/** Full plain-text price for aria-label/title, e.g. "$0.00007171". */
export function priceFullText(p: number): string {
  if (!Number.isFinite(p) || p <= 0) return "—";
  const parts = priceParts(p);
  if (!isPriceSubscriptShape(parts)) return parts.text;
  return "$0." + "0".repeat(parts.zeros) + parts.digits;
}

export function formatPercent(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "—";
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${Math.abs(value).toFixed(2)}%`;
}

/** One decimal, real minus sign — used for the 24h change chip (brief §6.3). */
export function formatPercent1dp(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "—";
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${Math.abs(value).toFixed(1)}%`;
}

export function formatNumber(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(
    value
  );
}

export function formatCompactNumber(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Compact money format per brief §6.3: 2 decimals under 100K, 1 decimal
 * above (e.g. $71K, $1.2M, $24.26K), en-US.
 */
export function formatCompactUsd(value: number | null): string {
  if (value === null || Number.isNaN(value)) return "—";
  const abs = Math.abs(value);
  const maximumFractionDigits = abs < 100_000 ? 2 : 1;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits,
  }).format(value);
}

export function formatMultiplier(current: number | null, base: number | null): string {
  if (current === null || base === null || base === 0) return "—";
  return `${(current / base).toFixed(1)}×`;
}

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function formatDateShort(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatDuration(fromIso: string, toIso: string | null): string {
  if (!toIso) return "—";
  const ms = new Date(toIso).getTime() - new Date(fromIso).getTime();
  if (!Number.isFinite(ms) || ms < 0) return "—";
  const hours = ms / (1000 * 60 * 60);
  if (hours < 1) return `${Math.round(ms / (1000 * 60))}m`;
  if (hours < 48) return `${hours.toFixed(1)}h`;
  return `${(hours / 24).toFixed(1)}d`;
}

export function shortenAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}…${address.slice(-chars)}`;
}

export function formatRelativeTime(iso: string): string {
  const seconds = Math.max(
    0,
    Math.round((Date.now() - new Date(iso).getTime()) / 1000)
  );
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  return `${minutes}m ago`;
}

/** HH:MM:SS countdown text, clamped at 00:00:00. Used by the payout timer. */
export function formatCountdown(msRemaining: number): string {
  const total = Math.max(0, Math.floor(msRemaining / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}
