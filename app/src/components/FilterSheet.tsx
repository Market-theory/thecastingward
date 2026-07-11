"use client";

import { useEffect, useState } from "react";
import type { Filters } from "@/lib/filters";
import { EMPTY_FILTERS, fmtIn } from "@/lib/filters";
import { LANES, TIERS, UNION_BUCKETS } from "@/lib/types";

const HEIGHTS: number[] = [];
for (let i = 56; i <= 80; i++) HEIGHTS.push(i);

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${
        active ? "bg-garnet-700 text-white" : "hairline bg-white text-ink/75"
      }`}
    >
      {active ? "✓ " : ""}
      {label}
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-ink/8 py-4 last:border-0">
      <p className="mb-2.5 text-[12px] font-semibold uppercase tracking-wide text-ink/45">{title}</p>
      {children}
    </div>
  );
}

export default function FilterSheet({
  open,
  initial,
  resultCount,
  onDraftChange,
  onApply,
  onClose,
}: {
  open: boolean;
  initial: Filters;
  resultCount: number;
  onDraftChange: (f: Filters) => void;
  onApply: (f: Filters) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<Filters>(initial);

  useEffect(() => {
    if (open) setDraft(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    onDraftChange(draft);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  if (!open) return null;

  const toggle = (group: "union" | "tier" | "confidence" | "lane", value: string) =>
    setDraft((d) => ({
      ...d,
      [group]: d[group].includes(value) ? d[group].filter((x) => x !== value) : [...d[group], value],
    }));

  const inputCls =
    "hairline w-full rounded-xl bg-white px-3.5 py-2.5 text-[14px] outline-none placeholder:text-ink/35 focus:ring-2 focus:ring-brass-400";
  const selectCls =
    "hairline rounded-xl bg-white px-3 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-brass-400";

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-hidden rounded-t-3xl bg-cream shadow-2xl sm:inset-x-auto sm:left-1/2 sm:top-1/2 sm:max-h-[85dvh] sm:w-[430px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl">
        <div className="mx-auto mt-2.5 h-1 w-9 rounded-full bg-ink/15 sm:hidden" />
        <div className="flex items-center justify-between px-5 pb-2 pt-3">
          <h2 className="text-[17px] font-bold tracking-tight">Filters</h2>
          <button
            onClick={() => setDraft({ ...EMPTY_FILTERS })}
            className="text-[13px] font-medium text-garnet-700"
          >
            Clear all
          </button>
        </div>

        <div className="max-h-[calc(88dvh-130px)] overflow-y-auto px-5 pb-3 sm:max-h-[calc(85dvh-130px)]">
          <Section title="Union">
            <div className="flex flex-wrap gap-2">
              {UNION_BUCKETS.map((u) => (
                <Chip key={u} label={u} active={draft.union.includes(u)} onClick={() => toggle("union", u)} />
              ))}
            </div>
          </Section>

          <Section title="Height">
            <div className="flex items-center gap-2.5">
              <select
                value={draft.minIn ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, minIn: e.target.value ? Number(e.target.value) : null }))}
                className={selectCls}
              >
                <option value="">No min</option>
                {HEIGHTS.map((h) => (
                  <option key={h} value={h}>
                    {fmtIn(h)}
                  </option>
                ))}
              </select>
              <span className="text-[13px] text-ink/40">to</span>
              <select
                value={draft.maxIn ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, maxIn: e.target.value ? Number(e.target.value) : null }))}
                className={selectCls}
              >
                <option value="">No max</option>
                {HEIGHTS.map((h) => (
                  <option key={h} value={h}>
                    {fmtIn(h)}
                  </option>
                ))}
              </select>
            </div>
          </Section>

          <Section title="Skills">
            <input
              value={draft.skill}
              onChange={(e) => setDraft((d) => ({ ...d, skill: e.target.value }))}
              placeholder="e.g. stage combat, dance, Spanish…"
              className={inputCls}
            />
          </Section>

          <Section title="Agency / manager">
            <input
              value={draft.agency}
              onChange={(e) => setDraft((d) => ({ ...d, agency: e.target.value }))}
              placeholder="e.g. Gersh, Authentic…"
              className={inputCls}
            />
          </Section>

          <Section title="Assessed tier">
            <div className="flex flex-wrap gap-2">
              {TIERS.map((t) => (
                <Chip key={t} label={t} active={draft.tier.includes(t)} onClick={() => toggle("tier", t)} />
              ))}
            </div>
          </Section>

          <Section title="Data confidence">
            <div className="flex flex-wrap gap-2">
              {["Verified", "Unverified"].map((c) => (
                <Chip key={c} label={c} active={draft.confidence.includes(c)} onClick={() => toggle("confidence", c)} />
              ))}
            </div>
          </Section>

          <Section title="Lane">
            <div className="flex flex-wrap gap-2">
              {LANES.map((l) => (
                <Chip key={l} label={l} active={draft.lane.includes(l)} onClick={() => toggle("lane", l)} />
              ))}
            </div>
          </Section>
        </div>

        <div className="border-t border-ink/8 bg-cream px-5 py-3.5">
          <button
            onClick={() => onApply(draft)}
            className="w-full rounded-xl bg-garnet-700 py-3 text-[15px] font-semibold text-white transition active:scale-[0.99]"
          >
            Show {resultCount.toLocaleString()} {resultCount === 1 ? "actor" : "actors"}
          </button>
        </div>
      </div>
    </div>
  );
}
