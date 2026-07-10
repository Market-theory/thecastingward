import { NextRequest, NextResponse } from "next/server";
import { getTalentLive, patchAssessment } from "@/lib/airtable";
import { CONFIDENCES, TIERS } from "@/lib/types";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  try {
    const talent = await getTalentLive(id);
    if (!talent) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json(talent);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "fetch failed" },
      { status: 502 },
    );
  }
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = (await req.json().catch(() => ({}))) as {
    assessedTier?: string;
    dataConfidence?: string;
  };

  const fields: { assessedTier?: string; dataConfidence?: string } = {};
  if (body.assessedTier !== undefined) {
    if (body.assessedTier !== "" && !(TIERS as readonly string[]).includes(body.assessedTier)) {
      return NextResponse.json({ error: "invalid assessedTier" }, { status: 400 });
    }
    fields.assessedTier = body.assessedTier;
  }
  if (body.dataConfidence !== undefined) {
    if (
      body.dataConfidence !== "" &&
      !(CONFIDENCES as readonly string[]).includes(body.dataConfidence)
    ) {
      return NextResponse.json({ error: "invalid dataConfidence" }, { status: 400 });
    }
    fields.dataConfidence = body.dataConfidence;
  }
  if (Object.keys(fields).length === 0) {
    return NextResponse.json({ error: "nothing to update" }, { status: 400 });
  }

  try {
    const updated = await patchAssessment(id, fields);
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "update failed" },
      { status: 502 },
    );
  }
}
