# stonk5.fyi

Unofficial live tracker for the **STONK5** token (`F7CTvENFnkDJysMhaFFicDT2FwnbW2oasFZGG6WJnar7`) on Solana, launched via [stonkfun.xyz](https://www.stonkfun.xyz/token/F7CTvENFnkDJysMhaFFicDT2FwnbW2oasFZGG6WJnar7). Not affiliated with StonkFun.

- Website: https://stonk5.com/
- X / Twitter: https://x.com/stonk5onsf

## What it shows

- Live price, market cap, FDV, liquidity, 24h volume, 24h change, peak market cap
- Graduation status
- Burn totals (tokens burned, USD value at burn, burn count)
- Embedded Dexscreener chart
- One-click copy of the contract address

## Data sources

No API keys required.

1. **Primary**: [stonkfun.xyz public API](https://www.stonkfun.xyz/developers) (`/api/public/v1/tokens/{mint}` and `/tokens/{mint}/burns`) — this is the platform's own engine, so it's the source of truth for burn data and graduation status.
2. **Fallback**: [Dexscreener public API](https://docs.dexscreener.com/api/reference) — used automatically if stonkfun.xyz is unreachable. Burn/graduation data isn't available from this fallback.

The server route `app/api/stats/route.ts` does this lookup and the client polls it every 30s (see `lib/constants.ts` for `REFRESH_INTERVAL_MS`).

## Development

```bash
npm install
npm run dev
```

## Deployment

This is a standard Next.js 14 App Router project — deploy as-is on Vercel. No environment variables are required (see `.env.example` for optional overrides).
