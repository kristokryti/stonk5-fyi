import { NextResponse } from "next/server";

const FETCH_TIMEOUT_MS = 4_000;
const RETRY_DELAY_MS = 300;
const CACHE_CONTROL = "public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000";
// Short-lived: a fallback here usually means a transient upstream hiccup, not
// a permanently missing logo. Caching it as long as a real image would lock
// in that one failure (client + edge) for up to a week.
const FALLBACK_CACHE_CONTROL = "public, max-age=30, s-maxage=30";

// Token logos are hosted on a handful of third-party gateways (stonkfun,
// Arweave/irys, a DigitalOcean space) that each occasionally fail or time
// out for a given client. Proxying through our own server means every
// request gets a real image response either way — the actual logo when the
// upstream is reachable, or a generated initials fallback when it isn't —
// so an <img> pointed here never shows a broken-image icon.
const ALLOWED_HOSTS = ["www.stonkfun.xyz", "stonkfun.xyz", "gateway.irys.xyz", "arweave.net"];

function isAllowedHost(url: URL): boolean {
  return ALLOWED_HOSTS.includes(url.hostname) || url.hostname.endsWith(".digitaloceanspaces.com");
}

function fallbackSvg(symbol: string): string {
  const initials = (symbol || "?").slice(0, 2).toUpperCase().replace(/[^A-Z0-9?]/g, "");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
    <rect width="64" height="64" rx="32" fill="#1a2036"/>
    <text x="32" y="40" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#aeb7d2" text-anchor="middle">${initials}</text>
  </svg>`;
}

function fallbackResponse(symbol: string) {
  return new NextResponse(fallbackSvg(symbol), {
    headers: { "content-type": "image/svg+xml", "cache-control": FALLBACK_CACHE_CONTROL },
  });
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface CachedImage {
  buf: ArrayBuffer;
  contentType: string;
}

// A fresh deploy resets Vercel's CDN cache, so every logo gets re-fetched
// from scratch on its first request afterward — right when the retry above
// still isn't enough (a sustained, not just one-request, upstream blip).
// Once we've ever served a real image for a given URL in this warm
// instance's lifetime, remember it and keep serving it instead of
// regressing to the initials fallback while upstream is unwell.
const lastKnownGood = new Map<string, CachedImage>();

async function fetchUpstream(upstream: URL): Promise<CachedImage> {
  const res = await fetch(upstream, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: { accept: "image/*" },
  });
  const contentType = res.headers.get("content-type") ?? "";
  if (!res.ok || !contentType.startsWith("image/")) {
    throw new Error(`upstream responded ${res.status} (${contentType})`);
  }
  return { buf: await res.arrayBuffer(), contentType };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawUrl = searchParams.get("url");
  const symbol = searchParams.get("symbol") ?? "";

  let upstream: URL;
  try {
    upstream = new URL(rawUrl ?? "");
  } catch {
    return fallbackResponse(symbol);
  }
  if (upstream.protocol !== "https:" || !isAllowedHost(upstream)) {
    return fallbackResponse(symbol);
  }
  const cacheKey = upstream.toString();

  const ATTEMPTS = 3;
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      const image = await fetchUpstream(upstream);
      lastKnownGood.set(cacheKey, image);
      return new NextResponse(image.buf, {
        headers: { "content-type": image.contentType, "cache-control": CACHE_CONTROL },
      });
    } catch {
      if (attempt < ATTEMPTS) await sleep(RETRY_DELAY_MS);
    }
  }

  const stale = lastKnownGood.get(cacheKey);
  if (stale) {
    return new NextResponse(stale.buf, {
      headers: { "content-type": stale.contentType, "cache-control": FALLBACK_CACHE_CONTROL },
    });
  }
  return fallbackResponse(symbol);
}
