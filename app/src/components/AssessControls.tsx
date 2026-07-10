"use client";

import { useState } from "react";
import { CONFIDENCES, TIERS } from "@/lib/types";

function Segmented({
  options,
  value,
  onChange,
  busy,
}: {
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  busy: boolean;
}) {
  return (
    <div className="hairline flex rounded-xl bg-ink/5 p-1">
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            disabled={busy}
            onClick={() => onChange(active ? "" : opt)}
            className={`flex-1 rounded-lg px-2 py-1.5 text-[13px] font-medium transition ${
              active ? "bg-garnet-700 text-white shadow-sm" : "text-ink/60"
            } disabled:opacity-60`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

export default function AssessControls({
  recordId,
  assessedTier,
  dataConfidence,
}: {
  recordId: string;
  assessedTier: string;
  dataConfidence: string;
}) {
  const [tier, setTier] = useState(assessedTier);
  const [confidence, setConfidence] = useState(dataConfidence);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function save(fields: { assessedTier?: string; dataConfidence?: string }) {
    setBusy(true);
    setError("");
    const res = await fetch(`/api/talent/${recordId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    setBusy(false);
    if (!res.ok) {
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      setError(json.error ?? "Save failed — change it in Airtable instead.");
      return false;
    }
    return true;
  }

  return (
    <section className="hairline rounded-2xl bg-white p-4">
      <h2 className="text-[13px] font-semibold uppercase tracking-wide text-ink/45">
        Natasha&apos;s assessment
      </h2>
      <p className="mb-2 mt-3 text-[12px] font-medium text-ink/55">Assessed tier</p>
      <Segmented
        options={TIERS}
        value={tier}
        busy={busy}
        onChange={(v) => {
          const prev = tier;
          setTier(v);
          void save({ assessedTier: v }).then((ok) => !ok && setTier(prev));
        }}
      />
      <p className="mb-2 mt-4 text-[12px] font-medium text-ink/55">Data confidence</p>
      <Segmented
        options={CONFIDENCES}
        value={confidence}
        busy={busy}
        onChange={(v) => {
          const prev = confidence;
          setConfidence(v);
          void save({ dataConfidence: v }).then((ok) => !ok && setConfidence(prev));
        }}
      />
      {error && <p className="mt-3 text-[12px] text-garnet-700">{error}</p>}
      <p className="mt-3 text-[11px] text-ink/40">Writes straight to Airtable. Tap again to clear.</p>
    </section>
  );
}
