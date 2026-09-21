import { NextResponse } from "next/server";
import { STONK5_API_BASE, STONKFUN_API_BASE } from "@/lib/constants";
import type { ClaimsResponse } from "@/lib/types";

const WALLET_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const FETCH_TIMEOUT_MS = 8_000;

export async function GET(req: Request) {
  const wallet = new URL(req.url).searchParams.get("wallet") ?? "";
  if (!WALLET_RE.test(wallet)) {
    return NextResponse.json(
      { error: "Enter a valid Solana wallet address." },
      { status: 400 }
    );
  }

  let data: ClaimsResponse;
  try {
    const res = await fetch(`${STONK5_API_BASE}/claims?wallet=${wallet}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { accept: "application/json" },
    });
    if (!res.ok) throw new Error(`stonk5.com claims responded ${res.status}`);
    data = (await res.json()) as ClaimsResponse;
  } catch {
    return NextResponse.json(
      { error: "Lookup failed — try again in a moment." },
      { status: 502 }
    );
  }

  // stonk5.com's claims response doesn't include token images. Enrich each
  // referenced token from stonkfun (the same source the basket display
  // already uses), tolerating individual failures.
  const mints = Object.keys(data.tokens ?? {});
  const imageResults = await Promise.allSettled(
    mints.map(async (mint) => {
      const r = await fetch(`${STONKFUN_API_BASE}/tokens/${mint}`, {
        cache: "no-store",
        signal: AbortSignal.timeout(5_000),
        headers: { accept: "application/json" },
      });
      if (!r.ok) throw new Error("not found");
      const j = (await r.json()) as { data?: { token?: { imageUrl?: string } } };
      const raw = j.data?.token?.imageUrl ?? null;
      const imageUrl = raw
        ? raw.startsWith("http")
          ? raw
          : `https://www.stonkfun.xyz${raw}`
        : null;
      return { mint, imageUrl };
    })
  );

  imageResults.forEach((result, i) => {
    const mint = mints[i];
    if (data.tokens[mint]) {
      data.tokens[mint].imageUrl = result.status === "fulfilled" ? result.value.imageUrl : null;
    }
  });

  return NextResponse.json(data);
}
