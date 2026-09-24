// Refreshes the local top-tokens snapshot used as a last-resort fallback
// when stonkfun's live API is unreachable — see lib/basketFallback.json and
// its use in lib/fetchStats.ts. Re-run this occasionally (and commit the
// result) to keep the snapshot from drifting too far from reality:
//
//   node scripts/refresh-basket-fallback.mjs
//   SITE_ORIGIN=https://stonk5.fyi node scripts/refresh-basket-fallback.mjs
//
// Downloads the top N tokens' logos into public/token-fallback/ and writes
// lib/basketFallback.json with their mint/name/symbol + local image path.
// No prices/market caps are stored — those would go stale immediately and
// this snapshot only ever backs the payout basket's logos/tickers, never
// live numbers.
//
// Images are fetched through our own deployed /api/token-image proxy
// (SITE_ORIGIN) rather than hitting stonkfun/irys/arweave directly: that
// route already has the retry + allowlist logic for those hosts, and it's
// the one endpoint guaranteed reachable from wherever this script runs.

import { mkdir, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const STONKFUN_API_BASE =
  process.env.STONKFUN_API_BASE ?? "https://www.stonkfun.xyz/api/public/v1";
const SITE_ORIGIN = process.env.SITE_ORIGIN ?? "https://stonk5-fyi.vercel.app";
const TOP_N = 30;
const OUT_DIR = path.join(process.cwd(), "public", "token-fallback");
const MANIFEST_PATH = path.join(process.cwd(), "lib", "basketFallback.json");

function extFromContentType(contentType) {
  if (contentType.includes("png")) return "png";
  if (contentType.includes("jpeg") || contentType.includes("jpg")) return "jpg";
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("gif")) return "gif";
  return "bin";
}

async function fetchImageViaProxy(rawImageUrl, symbol) {
  const proxyUrl = `${SITE_ORIGIN}/api/token-image?url=${encodeURIComponent(rawImageUrl)}&symbol=${encodeURIComponent(symbol)}`;
  const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(15_000) });
  const contentType = res.headers.get("content-type") ?? "";
  // The proxy always returns 200 — image/svg+xml means it fell back to a
  // generated initials icon (upstream unreachable), not a real logo.
  if (!res.ok || contentType === "image/svg+xml" || !contentType.startsWith("image/")) return null;
  return { buf: Buffer.from(await res.arrayBuffer()), ext: extFromContentType(contentType) };
}

async function main() {
  const res = await fetch(`${STONKFUN_API_BASE}/tokens?sort=marketCap&pageSize=${TOP_N}`, {
    signal: AbortSignal.timeout(15_000),
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error(`stonkfun tokens fetch failed: ${res.status}`);
  const json = await res.json();
  const tokens = json.data?.tokens ?? [];
  if (tokens.length === 0) throw new Error("stonkfun returned no tokens — refusing to overwrite snapshot");

  await mkdir(OUT_DIR, { recursive: true });
  const filesBefore = await readdir(OUT_DIR).catch(() => []);

  const manifest = [];
  const keepFiles = new Set();

  for (const t of tokens) {
    const mint = t.mint;
    const symbol = t.symbol;
    const name = t.name ?? symbol;
    const rawImageUrl = t.imageUrl
      ? t.imageUrl.startsWith("http")
        ? t.imageUrl
        : `https://www.stonkfun.xyz${t.imageUrl}`
      : null;

    // A token already has a saved logo from a previous run if any file here
    // starts with its mint — reuse that as the starting point so a flaky
    // upstream on THIS run doesn't throw away a perfectly good image.
    let imageFile = filesBefore.find((f) => f.startsWith(`${mint}.`)) ?? null;

    if (rawImageUrl) {
      try {
        const image = await fetchImageViaProxy(rawImageUrl, symbol);
        if (image) {
          imageFile = `${mint}.${image.ext}`;
          await writeFile(path.join(OUT_DIR, imageFile), image.buf);
        } else if (!imageFile) {
          console.warn(`skipped image for ${symbol} (${mint}): not a usable image response`);
        } else {
          console.warn(`upstream failed for ${symbol} (${mint}), keeping previously-saved image`);
        }
      } catch (err) {
        if (imageFile) {
          console.warn(`upstream errored for ${symbol} (${mint}), keeping previously-saved image:`, err.message);
        } else {
          console.warn(`skipped image for ${symbol} (${mint}):`, err.message);
        }
      }
    }

    if (imageFile) keepFiles.add(imageFile);
    manifest.push({ mint, name, symbol, imageFile, sourceUrl: rawImageUrl });
  }

  // Drop stale images for tokens that fell out of the top N.
  const existing = await readdir(OUT_DIR).catch(() => []);
  await Promise.all(
    existing
      .filter((f) => !keepFiles.has(f))
      .map((f) => unlink(path.join(OUT_DIR, f)).catch(() => {}))
  );

  await writeFile(
    MANIFEST_PATH,
    JSON.stringify({ generatedAt: new Date().toISOString(), tokens: manifest }, null, 2) + "\n"
  );

  console.log(
    `Saved ${manifest.length} tokens (${manifest.filter((m) => m.imageFile).length} with images) to ${MANIFEST_PATH}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
