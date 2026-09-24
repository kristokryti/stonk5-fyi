import basketFallbackData from "./basketFallback.json";

// Manually curated logo replacements, keyed by mint. Used when a token's
// official image is real but poorly suited to a small circular slot (e.g.
// a sticker-style asset with a lot of padding around the actual mark) —
// the source is re-cropped once and saved locally, then always preferred
// here over whatever stonkfun's live API reports, so the image doesn't
// keep reverting to the awkward original whenever the live fetch succeeds.
// Shared by lib/fetchStats.ts (payout basket) and app/api/claims/route.ts
// (My rewards) — both display token logos and should stay consistent.
export const CURATED_IMAGE_OVERRIDES: Record<string, string> = {
  HTmQz7My6MehV7bjhJ6jde8nDND1yvsz68d24LP7YgUQ: // GP (RuneScape Gold)
    "/token-fallback/HTmQz7My6MehV7bjhJ6jde8nDND1yvsz68d24LP7YgUQ.jpg",
};

const localSnapshotByMint = new Map(
  basketFallbackData.tokens
    .filter((t) => t.imageFile)
    .map((t) => [t.mint, `/token-fallback/${t.imageFile}`])
);

/**
 * Resolves the image to show for a mint: a curated override if one exists,
 * else the given live URL if it's real, else a locally-saved logo from the
 * top-30 basket snapshot (see scripts/refresh-basket-fallback.mjs) if this
 * mint happens to be in it, else null (caller falls back to initials).
 */
export function resolveTokenImage(mint: string, liveImageUrl: string | null): string | null {
  return CURATED_IMAGE_OVERRIDES[mint] ?? liveImageUrl ?? localSnapshotByMint.get(mint) ?? null;
}
