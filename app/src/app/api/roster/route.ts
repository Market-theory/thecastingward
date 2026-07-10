import { NextRequest, NextResponse } from "next/server";
import { getRoster } from "@/lib/airtable";

// The first pull of ~21k records takes ~60s under Airtable's rate limit.
export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const force = req.nextUrl.searchParams.get("refresh") === "1";
  try {
    const roster = await getRoster(force);
    return NextResponse.json(roster, {
      headers: { "Cache-Control": "private, max-age=300" },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "roster fetch failed" },
      { status: 502 },
    );
  }
}
