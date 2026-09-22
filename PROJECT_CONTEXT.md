# stonk5.fyi — Project Handoff / Context Package

Paste this whole file (or point a new Claude Code session at it with
"read PROJECT_CONTEXT.md") to pick up where this chat left off without
re-deriving everything from scratch.

## What this is

**stonk5.fyi** is an **unofficial community tracker** for the $STONK5
Solana token. It is NOT the official stonk5.com site — it's a fan-built
dashboard that pulls real, live data from several sources and presents it
more clearly/attractively than the official site does. Repo:
`kristokryti/stonk5-fyi`, branch `main`, deployed on Vercel, live at
`https://stonk5-fyi.vercel.app/` and now also being connected to the
custom domain **stonk5.fyi** (purchased via mynymbox.io — DNS records
added, SSL cert was generating in Vercel as of the last message in this
chat).

## Hard rules carried through this whole project (do not relax these)

- **Never fabricate or invent numbers.** Every figure on the site must
  trace back to a real API response (on-chain RPC, stonkfun, Dexscreener,
  or stonk5.com's own API) or be an explicitly-labeled model/estimate
  built from real data + cited assumptions (never invented assumptions —
  reuse stonk5.com's own published methodology where one exists).
- Anything modelled/estimated (the "What would you receive?" estimator,
  the burn+lock 1M/1Y projections) must say clearly it's a **model, not a
  forecast**, and must show its assumptions in a disclaimer line.
- Don't add comments/abstractions/error-handling beyond what's needed;
  match the existing code style; no unrequested scope creep.
- User is very particular about **exact copy wording** — when they specify
  exact text (e.g. "Current: X.XX% of supply burned+locked"), match it
  verbatim, including spacing/capitalization.
- Every UI change gets verified against the **live production deployment**
  (not just localhost) via Playwright screenshots before being reported
  done — this has repeatedly caught real bugs that only showed up live.

## Tech stack

- Next.js 16.3.5 App Router, TypeScript, Tailwind CSS, deployed on Vercel.
- `lightweight-charts` v5.2.1 (TradingView's OSS charting lib) — used for
  the self-built candlestick/line chart (see below).
- No database — everything is fetched live server-side on each request /
  poll, with a stale-fallback cache layer (see `lib/fetchStats.ts`) to
  smooth over flaky third-party APIs.

## Data sources (all real, no mocks)

1. **Solana RPC** (`lib/solana.ts`) — on-chain burns, mint authority
   status, token supply, engine wallet SOL balance.
2. **stonkfun.xyz public API** — token/launch/basket metadata, token
   images, prices.
3. **Dexscreener API** — price/volume/pair data.
4. **stonk5.com's own public API** (`STONK5_API_BASE` in
   `lib/constants.ts`) — the **authoritative source for engine
   bookkeeping**: `/api/payout`, `/api/lock` (locked/in-vault token
   counts), `/api/rounds` (round history, used to compute average SOL per
   round), `/api/claims?wallet=` (per-wallet payout history — powers "Your
   rewards").
5. **GeckoTerminal's public OHLCV API** (`api.geckoterminal.com`) — real
   candle data for the self-built chart, added this session to replace an
   unreliable DexScreener iframe embed. Endpoint shape documented at top
   of `app/api/ohlcv/route.ts`.

## Key features built this project (in rough chronological order)

- **Hero** — headline, "Check my rewards" scroll-to-anchor button (targets
  `#your-rewards`).
- **PayoutCard** — countdown ring to next payout round (whichever comes
  first: 5h timer or 5 SOL in engine wallet), current 5-token payout
  basket with images, burn/lock chips.
- **MarketBento** — price/mcap/volume tiles, "Trade $STONK5 ↗" link (no
  more "Paired with SOL" section — deleted per user request; no more
  On-chain Safety section either — also deleted).
- **HowItWorks** — 3-step explainer mirroring stonk5.com's own wording
  (no invented fee %s), plus a payout-rules disclaimer (2x account-rent
  floor, forfeiture-on-selling-before-settlement rule).
- **BuybackBurn** — the burn+lock supply bar. Final design ("Option 3 —
  continuous aurora gradient", user-picked from 5 PNG mockups): a single
  smooth gradient fill (sky→indigo→purple) up to the 1-year projection,
  with Now/1M/1Y tick marks, legend text reading exactly:
  `Current: X.XX% of supply burned+locked` /
  `1 Month from now: X.XX% of supply burned+locked` /
  `1 Year from now: X.XX% of supply burned+locked`.
  Bar is scaled to a fixed `barMaxPct = 120` so the 1-year mark never
  visually reads as "100% gone". All 4 stat values (Total burned, Locked,
  In the vault, Circulating supply) show the STONK5 logo icon next to
  them. Disclaimer: "Estimated at the current average pace — not a
  forecast."
- **YourRounds.tsx** (section heading "Your rewards", id `your-rewards`)
  — real wallet lookup via `/api/claims?wallet=`, shows round-by-round
  payout history + any carried/undelivered claims with humanized status
  labels.
- **Estimator.tsx** ("What would you receive?") — user enters $STONK5
  held (default 10,000,000, comma-formatted input with a clickable
  STONK5-logo badge linking to stonkfun), calculates modelled per-round
  and per-30-day rewards **from the average SOL per round over the last
  10 real rounds** (`avgRoundSol`, NOT the current partially-filled
  round — this was an explicit correction from the user), broken down
  per basket token with real images (no USD prices per-token — removed
  per request). Disclaimer cites the exact model assumptions (98%
  eligible supply share, 5% delivery cost cap, 7% pool/tax loss —
  sourced from stonk5.com's own published methodology).
- **Chart.tsx** — fully self-built (replaced a chronically-unreliable
  DexScreener iframe that kept getting stuck on "Loading pair..."). Real
  OHLCV data via `/api/ohlcv` (GeckoTerminal proxy). Features: Candles/
  Line toggle, Price/Market-Cap toggle, Log/Linear scale, Fullscreen,
  OHLC hover readout, volume histogram, % change badge, 6 timeframes
  (1m/5m/15m/1H/4H/1D), custom date-aware tick-mark labels on the time
  axis (e.g. "Sep 18" not just "18").
- **CopyAddress** — contract-address card; had a "weird glow bar" bug
  (turned out to be `backdrop-filter: blur()` on `.glass` visually
  sampling the live chart rendered directly above it) — fixed by giving
  this specific card a solid background instead of blur.
- **Token image reliability** — `/api/token-image` route: server-side
  proxy with a domain allowlist (SSRF-safe) that ALWAYS returns a valid
  image — either the real logo or a generated SVG initials fallback.
  Used everywhere a token image renders (`proxiedTokenImage()` helper in
  `lib/format.ts`).
- **Data-flakiness fix** — third-party sub-fetches (stonkfun metadata,
  stonk5.com lock/rounds) occasionally failed independently, blanking
  individual fields even when the rest of `/api/stats` succeeded (showed
  as "—" in the estimator / burn bar). Fixed two ways:
  1. Server-side stale-fallback cache (`withStaleFallback()` in
     `lib/fetchStats.ts`, 10-min max staleness).
  2. Client-side field-level merge (`mergeStats()` in
     `lib/statsContext.tsx`) — never lets a poll's null overwrite a
     previously-good value.

## Design/copy preferences the user has shown repeatedly

- Prefers subtle, professional styling over flashy — rejected a "too
  long"/"shadowed" burn bar design multiple times before landing on the
  clean gradient version.
- Wants two-tone text for live-vs-static values (bright live number +
  muted "/ X threshold" — see PayoutCard's Timer and Engine-wallet-holds
  rows).
- Removes anything not adding real value fast: deleted "Paired with SOL"
  section, deleted "On-chain Safety" section, deleted "STONK5.com" nav
  button.
- Wants numbers comma-formatted in inputs, minimum-to-qualify amounts
  surfaced, USD-equivalents shown where it aids understanding but NOT
  everywhere (explicitly removed USD from the estimator's per-token
  table).
- Icons: STONK5 logo (`/stonk5-logo.png`) shown next to key stat values
  as a small branding touch (18px, rounded-full).

## File map (most relevant files)

- `lib/constants.ts` — all magic numbers/addresses (MINT, PAIR_ADDRESS,
  ENGINE_WALLET, ROUND_SOL_THRESHOLD=5, ROUND_MAX_HOURS=5,
  MIN_QUALIFY_TOKENS=50000, MIN_QUALIFY_USD=20, BASKET_SHARE_OF_ROUND=0.9,
  ROUND_HISTORY_SAMPLE_SIZE=10, STONK5_API_BASE, LINKS).
- `lib/types.ts` — `OnchainStats`, `BasketToken`, full `ClaimsResponse`
  type family.
- `lib/solana.ts` — RPC-layer on-chain stats.
- `lib/fetchStats.ts` — orchestrates all fetches, stale-fallback caching.
- `lib/statsContext.tsx` — client polling + `mergeStats()`.
- `lib/format.ts` — formatters incl. `proxiedTokenImage()`.
- `app/api/claims/route.ts`, `app/api/token-image/route.ts`,
  `app/api/ohlcv/route.ts` — proxy routes built this project.
- `components/` — one component per section (see feature list above);
  `app/page.tsx` has the final section order:
  `Hero → PayoutCard → MarketBento → HowItWorks → BuybackBurn → YourRounds → Estimator → Chart → CopyAddress`.

## Known minor open item (not user-requested, self-flagged only)

The chart's right price-axis occasionally shows spurious negative tick
labels in the empty space reserved for the volume pane at the bottom —
cosmetic only, not a data bug. Not yet fixed; no user complaint about it.

## Domain setup — DONE, live

Custom domain `stonk5.fyi` (purchased at mynymbox.io) is fully connected
and live:
- `stonk5.fyi` (apex) — Vercel: Production, No Redirect. DNS at
  mynymbox.io: `A` record `@` → `76.76.21.21`.
- `www.stonk5.fyi` — Vercel: Production, 307 Redirect → `stonk5.fyi`.
  DNS at mynymbox.io: `CNAME` record `www` →
  `a9c7e9b8f9257812.vercel-dns-017.com.` (Vercel's newer CNAME target;
  the legacy `cname.vercel-dns.com` also still works).
- Both show "Valid Configuration" in Vercel, SSL certs issued.
- Note: this newer Vercel UI has no separate "set as primary domain"
  toggle — `stonk5.fyi` being Production/No-Redirect *is* the complete
  setup. The old `stonk5-fyi.vercel.app` URL will keep working side by
  side (it does not auto-redirect to the custom domain in this UI
  version) — that's expected, not a bug.
- The site is now reachable at **https://stonk5.fyi** (this is the
  canonical URL going forward — use it instead of the `.vercel.app` one
  in any future links/screenshots).

## How to resume in a new chat

Just say something like: "Continuing work on stonk5.fyi — read
PROJECT_CONTEXT.md in the repo for full context" and describe the new
task. A fresh session can `Read` this file plus grep the relevant
component before making changes, without needing the full prior
conversation history.
