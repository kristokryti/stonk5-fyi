import { NextResponse } from "next/server";
import { getTokenStats } from "@/lib/fetchStats";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stats = await getTokenStats();
    return NextResponse.json(stats, {
      headers: { "Cache-Control": "s-maxage=15, stale-while-revalidate=45" },
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 502 }
    );
  }
}
