# stonk5.fyi — "Aurora" redesign brief for Claude Code

You are acting as a senior front-end engineer with a strong product-design eye. Your job: make the **live stonk5.fyi Next.js site** look and feel exactly like the approved design in `design-reference/`, without breaking any of its data logic.

stonk5.fyi is an **unofficial community tracker** for the $STONK5 "Top 5 index" token on StonkFun (Solana). It is deployed on Vercel. The audience is **holders checking their rewards**, mostly on a phone. Vibe: premium dark glass, calm, trustworthy — not a casino.

> Read this whole file first. Then do Step 0 and report back before you write code.

---

## 0. Rules of engagement (non-negotiable)

1. Work on a new git branch: `redesign/aurora`. **Never push to the production branch and never deploy to production.** Push the branch so Vercel creates a Preview deployment, then give me the preview URL.
2. **Do not change data logic**: API routes, fetchers, env vars, on-chain reads, polling, caching, and routes/URLs stay as they are unless a step below says otherwise. This is a visual/UX redesign. If you find a bug in the data layer, list it in your report instead of silently changing it (exceptions: the price formatter in §7 and the fake-chart rule in §8).
3. **Never invent numbers.** Every number in `design-reference/aurora-home-reference-1440.png` is a placeholder. Live numbers must come from the site's existing data sources (DexScreener for price/volume, stonkfun.xyz for status/launch data, on-chain for burns/authorities). If a value is unavailable, show `—` (or the skeleton), never a made-up value.
4. Don't add heavy dependencies. Prefer plain CSS (the provided `aurora-tokens.css`), CSS modules or whatever the repo already uses. No UI kit, no animation library, no icon pack — inline SVG is fine.
5. Keep the site fast: target Lighthouse Performance ≥ 90 mobile, Accessibility ≥ 95, no layout shift.
6. Commit in small, logical steps with clear messages.

## 1. Files you have

Everything lives in `design-reference/` in the repo root (a copy of this kit folder; it is reference material and is not imported by the app):

| File | What it is |
|---|---|
| `aurora-home-reference-1440.png` | **The target.** Full Overview page at 1440 px. Match this. |
| `aurora-home-reference.html` | Static HTML/CSS of the same page — use it to read exact sizes, spacing, gradients, SVG ring/chart markup. Needs Poppins installed to render correctly. |
| `aurora-tokens.css` | Production-ready design tokens + base components (glass card, buttons, chips, bars, aurora background, responsive rules, focus styles, skeletons). **Import this globally and build on it.** |
| `site-assets/` | `favicon.ico`, `favicon-32.png`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`, `og-image.png` (1200×630, contains no live stats). |

The design was approved on the Overview page; the **Market** and **Engine** pages reuse the same components (see §5).

## 2. Step 0 — recon (do this first, then report; no code yet)

Inspect the repo and answer in a short message:
- Next.js version, App Router or Pages Router, TypeScript or JS.
- Styling approach today (Tailwind? CSS modules? styled-jsx? global CSS?).
- Current routes/pages, and where each data source is fetched (server vs client, polling interval, caching/revalidate).
- Current components (nav, price, stats, chart, countdown, footer) and what each shows.
- Current fonts, the price formatter, chart implementation.
- Anything that will conflict with the plan below.

Then propose a **short** plan (max ~12 bullets) mapping the design to the existing files. If the repo uses Tailwind, keep using it but map the tokens in `aurora-tokens.css` into `tailwind.config` (colors, radii, font) and use the utility classes/`@layer components` for `.glass`, `.btn`, `.chip` etc. Proceed after I approve, or immediately if the plan is straightforward and low-risk.

## 3. Design principles (why it looks like this)

- **One focal point per screen.** Hero: the payout countdown. Below the fold: price. Everything else supports these two.
- **Answer the holder's questions in order:** "When is my next payout?" → "What's the token doing?" → "How does this work?" → "Am I eligible?" (whale cap) → "Where do I buy / check rewards?".
- **Glass cards on a dark aurora background**: layered depth, low visual noise, 1 px borders, generous radius.
- **Restraint with colour.** Gradient (sky → indigo → violet) is used only for the key words in headlines, the primary button, the ring and progress bars. Mint = positive/live. Coral = negative. Everything else is neutral text on ink.
- **Numbers are data, treat them like data**: one number font, tabular figures, consistent units, sensible rounding, always with context (24h change, % of market cap …).
- **Trust signals are part of the design**: "Unofficial" chip in the nav, source line + "Updated Xs ago" in the footer, disclaimers visible.

## 4. Tokens & typography

Import `design-reference/aurora-tokens.css` into the global stylesheet (copy it to e.g. `app/aurora.css` and import from the root layout). Do not re-declare the colours elsewhere — use the CSS variables.

Core palette:

| Token | Hex | Use |
|---|---|---|
| `--bg` | `#060913` | page background |
| `--ink` / `--ink2` / `--mute` | `#F2F5FF` / `#AEB7D2` / `#7C87A8` | primary / secondary / tertiary text (tertiary only for labels & footnotes) |
| `--c1 --c2 --c3` | `#38BDF8` `#818CF8` `#C084FC` | brand gradient sky → indigo → violet |
| `--pos` / `--neg` | `#5EEAD4` / `#FB7185` | positive/live, negative (never pure red) |
| glass | `linear-gradient(180deg, rgba(255,255,255,.075), rgba(255,255,255,.03))`, 1px `rgba(255,255,255,.10)`, radius 24 px, blur 24 px | every card |

All text/background pairs already pass WCAG AA (ink 18.3:1, ink2 9.9:1, mute 5.6:1, mint 13.4:1, coral 7.4:1, primary-button text `#060913` on the gradient ≥ 7.5:1). Keep it that way.

**Fonts (max two families on the whole site):**
- **Poppins** (weights 400, 500, 600 only) for everything including all numbers. Load with `next/font/google` (`display: 'swap'`, `variable: '--font-poppins'`). Use `.num` (tabular-nums) on every live number, especially the countdown, so digits never jitter.
- **JetBrains Mono** (`variable: '--font-mono'`, weight 400/500) **only** for the contract address and very long token strings (`.code`). Never for normal numbers, never for the countdown.

Type scale (desktop): h1 68/1.06/−0.035em/600 (clamped for mobile in the CSS) · price 72 · section h2 34 · card value 34 · body 16 · lead 19 · label 12 px uppercase 0.09em · small 13–14.

## 5. Information architecture

Keep existing routes. The nav has three tabs (pill segmented control, `aria-current="page"` for the active one): **Overview**, **Market**, **Engine**.

- **Overview** (home) — everything in §6, in the order of the reference image.
- **Market** — price card (large), the four stat cards (market cap/FDV, liquidity, 24h volume, peak market cap & drawdown), the chart card, contract address card. Same components as Overview.
- **Engine** — payout card (countdown + Timer/Engine-wallet bars + payout basket + burn chip), "How the engine works" 4 steps, Whale cap card, Paired-with-SOL card. Same components.

If the site is currently a single page, build the three routes as thin compositions of the same components and keep `/` = Overview. If routes with other names already exist, map to them instead of renaming (and add redirects only if you must).

Nav (height 88 px, content max-width 1120 px): left wordmark **stonk5.fyi**; centre tabs; right an `Unofficial` chip and a ghost button **Buy $STONK5** (reuse the site's existing buy URL). On phones: wordmark left, tabs move to a full-width segmented row directly under the header (horizontally scrollable if needed), chip and button collapse into a single "Buy" button.

## 6. Overview page — section by section

Page width: content column `max-width: 1120px`, centred, side gutters 24 px (16 px on phones). Vertical rhythm: sections 88 px apart on desktop (56 px on mobile). Render `<div class="aurora-bg" aria-hidden>` once behind everything (markup in the CSS comment).

**6.1 Hero (centred)**
- Pill: green live dot + "Live · Community tracker for the Top 5 index on StonkFun".
- H1: "Your STONK5 payout," / gradient "tracked live." (68 px desktop).
- Lead (max 700 px): "Every 5 hours — or as soon as the engine wallet reaches 5 SOL — the engine buys StonkFun's top 5 tokens and sends them to eligible holders."
- CTAs: primary gradient button "Check my rewards ↗" (keep the existing rewards URL, currently stonk5.com), ghost button "How it works" (smooth-scrolls to §6.4).

**6.2 Payout card** (full-width glass card, 36/40 px padding, 3 columns 232px · 1fr · 300px; stacks on mobile)
- Col 1: SVG progress ring 232 px, stroke 14, gradient sky→violet, round caps. Centre: label "Next payout in" and the countdown (`HH:MM:SS`, Poppins 600 36 px, tabular-nums).
- Col 2: label "Round trigger · whichever comes first". Two rows, each a label + right-aligned bold value + 10 px progress bar: **Timer** "2h 46m of 5h" and **Engine wallet** "3.2 / 5 SOL". The ring shows the *closer-to-firing* of the two triggers (max of timer %, wallet %).
- Col 3: label "Payout basket", five circular slots 1–5, text "The five biggest StonkFun tokens at the moment of each round.", and a mint chip: "5% of each round's budget buys back & burns $STONK5".
- Remove the "Sample values shown in this mockup." line — it only exists in the mockup.

**6.3 Market bento** (4-column grid, gap 20 px)
- Price card spans 2×2: label "Stonk5 Index" + chips "Solana" and status chip (e.g. "Graduated" — only if the source says so), big price (72 px, see §7), 24h change chip (▼/▲ + sign + %, coral/mint, always with an arrow so colour isn't the only cue), the SOL price in `.code` 13 px muted, sparkline (see §8).
- Four stat cards (hide a card rather than fake it if the data source doesn't provide it, e.g. peak market cap): **Market cap** (sub: "FDV …"), **Liquidity** (sub: "% of market cap"), **24h volume** (sub: "× market cap"), **Peak market cap** (sub: "−xx% from peak", coral). Labels 12 px uppercase; value 34 px/600; sub 13 px muted.
- Compact money format: `$71K`, `$1.2M`, `$24.26K` (2 decimals under 100K, 1 decimal above; en-US). Percent: real minus sign `−`, one decimal for 24h change, no decimals for drawdown.

**6.4 "How the engine works"** — h2 + sub "Four steps, every round." + 4 equal glass cards (number badge, h3, 14 px body): 1 "1% fee on every trade" — "Half of the fee is paid to a public engine wallet as creator fees." · 2 "Engine fills up" — "Every 5 hours, or once the wallet holds 5 SOL — whichever comes first." · 3 "Buys the top 5" — "The engine buys the current top 5 StonkFun tokens with the round's budget." · 4 "Holders get paid" — "Tokens are deposited to eligible STONK5 holders. Check what you're owed at stonk5.com." (link `stonk5.com`).

**6.5 Two cards side by side (1.25fr / 1fr)**
- **Whale cap**: label, "Hold more than 30,000,000? No rewards.", body "Wallets above 3% of supply earn zero — their share goes to holders below the line, discouraging hoarding.", the bar (left 62% gradient = eligible, right = coral hatch = no rewards), scale labels `0` · `30,000,000 (3%)` · `Supply`.
- **Paired with SOL**: label, "Trade with what you already hold.", body "STONK5 is paired with SOL rather than a stablecoin, since most traders already hold and use it.", ghost button "Buy $STONK5 ↗".

**6.6 Chart card** — label "Chart", timeframe pills `1H 24H 7D ALL` (active pill = soft white fill), gradient line + faint area fill, 4 subtle grid lines, white end-point dot. See §8 for data rules.

**6.7 Contract address card** — label + `.code` address (15 px, wraps/`overflow-wrap:anywhere` on mobile) + ghost "Copy" button. Copy → button text becomes "Copied" for 1.5 s and an `aria-live="polite"` region announces it.

**6.8 Footer** — 13 px `--mute`, line 1: **Updated Xs ago** · "price & volume from DexScreener, status & launch data from stonkfun.xyz, burns & authorities verified on-chain." Line 2: "**Unofficial community tracker** for STONK5. Not affiliated with StonkFun or the STONK5 team. Not financial advice." Keep the "Updated Xs ago" ticking client-side from the real last-fetch timestamp.

## 7. Price formatter (bug fix + spec)

The current site shows tiny prices as `$0.₄7171`, which drops a zero. The convention used by DexScreener and everyone else: subscript = number of leading zeros after the decimal point, and one zero stays visible. Correct: `0.00007171` → `$0.0₄7171`.

Implement one shared `formatUsdPrice(value: number)` returning `{ text }` or `{ pre, zeros, digits }` and a `<Price>` component that renders `$0.0<sub>4</sub>7171` (the CSS `.price sub` handles size/position; keep the plain text version in `aria-label` / `title`, e.g. `aria-label="$0.00007171"`).

```ts
export function priceParts(p: number) {
  if (!Number.isFinite(p) || p <= 0) return { text: '—' };
  if (p >= 1) return { text: '$' + p.toLocaleString('en-US', { maximumFractionDigits: 2 }) };
  if (p >= 0.01) return { text: '$' + p.toFixed(4) };
  const [m, e] = p.toExponential(3).split('e');       // "7.171", "-5"
  const digits = m.replace('.', '').replace(/0+$/, '') || '0';
  const zeros = -Number(e) - 1;                       // leading zeros after "0."
  if (zeros < 3) return { text: '$0.' + '0'.repeat(zeros) + digits };
  return { pre: '$0.0', zeros, digits };              // render pre + <sub>{zeros}</sub> + digits
}
```
Unit tests (add them): `0.00007171 → $0.0₄7171`, `0.00004535 → $0.0₄4535`, `0.0000004188 → $0.0₆4188`, `0.0042 → $0.0042`, `0.5 → $0.5000`, `12.3456 → $12.35`, `0 / NaN → —`. The SOL price stays a plain string in `.code`, e.g. `0.0000004188 SOL`.

## 8. Chart & sparkline rules

- Use the site's existing chart data source. If it already has a real price series, restyle it to match (gradient stroke 2.4–2.6 px, area fill `#818CF8` 40 % → 0, subtle grid, white end dot, no axes clutter, tooltip on hover/touch with time + price).
- If there is **no real series available**, do **not** ship the mockup's decorative curve as if it were real. Instead, show a clean empty state inside the card: "Live chart on DexScreener ↗" (button linking to the pair) — or an iframe/embed only if the site already used one. Same for the sparkline in the price card: hide it rather than fake it.
- Timeframe pills must actually change the data; if only some ranges are available, only render those.

## 9. Engine / countdown data

- The countdown, timer progress and engine-wallet progress must be driven by **real values** from the existing engine data (last round timestamp, wallet balance). If the source can't tell when the round started, show `—` and the wallet bar only; don't guess.
- Countdown ticks every second client-side but re-syncs on each data refresh; use `font-variant-numeric: tabular-nums`; **do not** announce every second to screen readers (`role="timer"` with `aria-live="off"`; give the card an `aria-label` like "Next payout in 2 hours 14 minutes").
- Poll no faster than every 30–60 s, pause polling when the tab is hidden (`visibilitychange`), and keep the last good value on error with a subtle "Data may be stale" note instead of clearing the UI.

## 10. States every live number needs

Loading → skeleton (`.skeleton`), error/unavailable → `—` with the source name on hover/`title`, stale (> 3 min) → "Updated Xm ago" in `--neg`-tinted text. No layout shift between states (reserve widths/heights).

## 11. Responsive rules

Breakpoints: ≥1100 desktop · 860–1099 tablet-landscape · 721–859 tablet · ≤720 phone. The CSS file already contains the grid changes; make the components match:
- Hero H1 scales via `clamp`; CTAs stack full-width on phones.
- Payout card: ring centred on top, then the two tracks, then the basket (full width).
- Bento: 2 columns on tablet/phone; the price card spans the full row.
- Steps: 2×2 on tablet, 1 column on phones.
- Whale/Paired cards stack.
- Every tap target ≥ 44×44 px. No horizontal scroll at 320 px. Contract address wraps.
- Test at 375, 390, 768, 1024, 1440.

## 12. Accessibility

- Semantic landmarks: `header`/`nav`, `main`, `section` with headings in order (one `h1`), `footer`.
- Visible focus ring (`:focus-visible`, 2 px `--c2`) — already in the CSS; don't remove outlines.
- Colour is never the only signal: ▲/▼ on changes, text labels on chips.
- Decorative SVG/background: `aria-hidden="true"`; the ring gets a text alternative via the card's `aria-label`.
- `prefers-reduced-motion` is respected (CSS handles it; avoid adding motion beyond hover lifts and the skeleton shimmer).
- Buttons that are links use `<a>`; actions (Copy) use `<button>`.

## 13. Brand rules

- Logo = **wordmark only**: `stonk5` (Poppins 600, `--ink`) + `.fyi` (Poppins 500, `--mute`), letter-spacing −0.02em. **No symbol, no icon, no pentagon.** Nav size 28 px.
- Do not use the StonkFun or STONK5 logos or imagery. The site is unofficial and must say so (nav chip + footer).
- Favicon: the "5" monogram files in `site-assets/` (favicon only — it's the one place a symbol is allowed because 16 px can't carry a wordmark).
- Tone of copy: plain, calm, precise. No hype, no emojis, no price predictions, no "moon" language.

## 14. SEO, meta and assets

- `title`: "stonk5.fyi — STONK5 payouts, tracked live" · `description`: "Unofficial community tracker for the STONK5 Top 5 index on StonkFun: payout countdown, engine wallet, market data and burns."
- OpenGraph/Twitter: `og-image.png` (1200×630) copied to `public/`, `twitter:card = summary_large_image`, absolute URL from `metadataBase`.
- `theme-color` `#060913`, `color-scheme: dark`.
- Icons: put `favicon.ico`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` where the router expects them (App Router: `app/favicon.ico`, `app/icon.png`, `app/apple-icon.png`, or `public/` + `metadata.icons`). Add `manifest.webmanifest` only if the site has none.
- Keep existing analytics if any; don't add new trackers.

## 15. Performance checklist

`next/font` (no layout shift, no external font request) · no `filter: blur()` on giant elements (the CSS uses radial-gradients instead) · `backdrop-filter` only on cards, not full-screen · SVG for ring and charts (no chart library unless already present) · no images above the fold · server-render the first paint with the last known data where the architecture allows it · client bundle should not grow by more than ~15 KB gz.

## 16. Definition of done / QA

1. Side-by-side comparison with `aurora-home-reference-1440.png` at 1440 px — spacing, radii, gradients, type sizes match closely (attach your screenshot next to the reference in your report).
2. Screenshots at 375 and 768 px for Overview, Market, Engine.
3. Lighthouse mobile ≥ 90 perf / ≥ 95 a11y; no CLS; no console errors.
4. Unit tests for the price formatter pass; existing tests still pass; `next build` + lint clean.
5. Every number on the page traces to a real data source; none of the mockup's sample values remain in the code (search for `71K`, `24.26K`, `73.75K`, `244.94K`, `02:14:09`, `3.2 / 5`, `−24.81`).
6. Keyboard-only walkthrough works (tab order, focus visible, Copy button).
7. Push `redesign/aurora`, wait for the Vercel Preview, and give me: the preview URL, a list of changed files grouped by purpose, anything from §2 that surprised you, and any data-layer bugs you noticed but did not touch.

**Stop there. Do not merge to the production branch — I will review the preview first.**
