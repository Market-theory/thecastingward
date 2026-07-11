"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Roster, Talent } from "@/lib/types";
import { LANES, TIERS, UNION_BUCKETS } from "@/lib/types";
import TalentCard from "./TalentCard";

const HEIGHTS: { label: string; inches: number }[] = [];
for (let i = 56; i <= 80; i++) {
  HEIGHTS.push({ label: `${Math.floor(i / 12)}'${i % 12}"`, inches: i });
}

function matchesUnion(union: string, bucket: string): boolean {
  const u = union.toUpperCase();
  switch (bucket) {
    case "SAG-AFTRA":
      return u.includes("SAG-AFTRA") && !u.includes("ELIGIBLE");
    case "SAG-AFTRA Eligible":
      return u.includes("SAG-AFTRA ELIGIBLE");
    case "Non-Union":
      return u.includes("NON-UNION");
    case "AEA":
      return u.includes("AEA");
    default:
      return true;
  }
}

const chip = (active: boolean) =>
  `appearance-none rounded-full px-3.5 py-1.5 text-[13px] font-medium outline-none focus:ring-2 focus:ring-brass-400 ${
    active ? "bg-garnet-700 text-white" : "hairline bg-white text-ink/80"
  }`;

export default function SearchApp() {
  const [roster, setRoster] = useState<Roster | null>(null);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [union, setUnion] = useState("");
  const [minIn, setMinIn] = useState("");
  const [maxIn, setMaxIn] = useState("");
  const [agencyQ, setAgencyQ] = useState("");
  const [tier, setTier] = useState("");
  const [lane, setLane] = useState("");
  const [confidence, setConfidence] = useState("");
  const [skillQ, setSkillQ] = useState("");
  const [limit, setLimit] = useState(96);
  const [refreshing, setRefreshing] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  async function load(refresh = false) {
    if (refresh) setRefreshing(true);
    try {
      const res = await fetch(`/api/roster${refresh ? "?refresh=1" : ""}`);
      if (!res.ok) throw new Error(`Roster load failed (${res.status})`);
      setRoster((await res.json()) as Roster);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Roster load failed");
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const agencyById = useMemo(() => {
    const m = new Map<string, string>();
    for (const a of roster?.agencies ?? []) m.set(a.id, a.name);
    return m;
  }, [roster]);

  const filtered = useMemo(() => {
    if (!roster) return [];
    const query = q.trim().toLowerCase();
    const skill = skillQ.trim().toLowerCase();
    const agency = agencyQ.trim().toLowerCase();
    const min = minIn ? Number(minIn) : null;
    const max = maxIn ? Number(maxIn) : null;
    return roster.talent.filter((t: Talent) => {
      if (query && !t.name.toLowerCase().includes(query)) return false;
      if (union && !matchesUnion(t.union, union)) return false;
      if (min !== null && (t.heightIn === null || t.heightIn < min)) return false;
      if (max !== null && (t.heightIn === null || t.heightIn > max)) return false;
      if (skill && !t.skills.toLowerCase().includes(skill)) return false;
      if (agency) {
        const names = t.agencyIds.map((id) => agencyById.get(id) ?? "").join(" ");
        const hay = `${names} ${t.repDetail}`.toLowerCase();
        if (!hay.includes(agency)) return false;
      }
      if (tier && t.assessedTier !== tier) return false;
      if (lane && t.lane !== lane) return false;
      if (confidence && t.dataConfidence !== confidence) return false;
      return true;
    });
  }, [roster, q, union, minIn, maxIn, skillQ, agencyQ, tier, lane, confidence, agencyById]);

  const hasFilters = Boolean(q || union || minIn || maxIn || skillQ || agencyQ || tier || lane || confidence);

  function clearFilters() {
    setQ("");
    setUnion("");
    setMinIn("");
    setMaxIn("");
    setAgencyQ("");
    setTier("");
    setLane("");
    setConfidence("");
    setSkillQ("");
    setLimit(96);
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16" ref={topRef}>
      <header className="frosted sticky top-0 z-10 -mx-4 px-4 pb-3 pt-4">
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="text-[22px] font-bold tracking-tight text-garnet-800">
            The Casting Ward
          </h1>
          <div className="flex items-center gap-3 text-[12px] text-ink/50">
            {roster && (
              <span>
                {filtered.length.toLocaleString()} of {roster.talent.length.toLocaleString()}
                {roster.mock && " · demo data"}
              </span>
            )}
            <button
              onClick={() => void load(true)}
              disabled={refreshing}
              className="font-medium text-garnet-700 disabled:opacity-50"
              title="Re-pull from Airtable"
            >
              {refreshing ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </div>

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name…"
          className="hairline mt-3 w-full rounded-xl bg-white px-4 py-2.5 text-[15px] outline-none placeholder:text-ink/35 focus:ring-2 focus:ring-brass-400"
        />

        <div className="scrollbar-none -mx-4 mt-2.5 flex gap-2 overflow-x-auto px-4 pb-0.5">
          <select value={union} onChange={(e) => setUnion(e.target.value)} className={chip(Boolean(union))}>
            <option value="">Union</option>
            {UNION_BUCKETS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
          <select value={minIn} onChange={(e) => setMinIn(e.target.value)} className={chip(Boolean(minIn))}>
            <option value="">Min height</option>
            {HEIGHTS.map((h) => (
              <option key={h.inches} value={h.inches}>
                ≥ {h.label}
              </option>
            ))}
          </select>
          <select value={maxIn} onChange={(e) => setMaxIn(e.target.value)} className={chip(Boolean(maxIn))}>
            <option value="">Max height</option>
            {HEIGHTS.map((h) => (
              <option key={h.inches} value={h.inches}>
                ≤ {h.label}
              </option>
            ))}
          </select>
          <input
            value={skillQ}
            onChange={(e) => setSkillQ(e.target.value)}
            placeholder="Skill…"
            className={`${chip(Boolean(skillQ))} w-32 shrink-0 placeholder:text-ink/40`}
          />
          <input
            value={agencyQ}
            onChange={(e) => setAgencyQ(e.target.value)}
            placeholder="Agency…"
            className={`${chip(Boolean(agencyQ))} w-32 shrink-0 placeholder:text-ink/40`}
          />
          <select value={tier} onChange={(e) => setTier(e.target.value)} className={chip(Boolean(tier))}>
            <option value="">Assessed tier</option>
            {TIERS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            value={confidence}
            onChange={(e) => setConfidence(e.target.value)}
            className={chip(Boolean(confidence))}
          >
            <option value="">Confidence</option>
            <option value="Verified">Verified</option>
            <option value="Unverified">Unverified</option>
          </select>
          <select value={lane} onChange={(e) => setLane(e.target.value)} className={chip(Boolean(lane))}>
            <option value="">Lane</option>
            {LANES.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="shrink-0 rounded-full bg-garnet-700 px-3.5 py-1.5 text-[13px] font-medium text-white"
            >
              Clear
            </button>
          )}
        </div>
      </header>

      {error && (
        <div className="hairline mt-6 rounded-2xl bg-white p-6 text-center text-sm text-ink/70">
          <p className="font-semibold text-garnet-700">Couldn&apos;t load the roster</p>
          <p className="mt-1">{error}</p>
          <button
            onClick={() => void load()}
            className="mt-3 rounded-full bg-garnet-700 px-4 py-1.5 text-[13px] font-medium text-white"
          >
            Try again
          </button>
        </div>
      )}

      {!roster && !error && (
        <>
          <p className="mt-4 text-center text-[12px] text-ink/45">
            Loading the roster… first load after a deploy can take a minute.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-2xl bg-garnet-100" />
            ))}
          </div>
        </>
      )}

      {roster && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filtered.slice(0, limit).map((t) => (
              <TalentCard
                key={t.id}
                talent={t}
                agencyName={t.agencyIds.map((id) => agencyById.get(id)).filter(Boolean).join(", ")}
              />
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="mt-16 text-center text-sm text-ink/50">
              No one matches — loosen a filter.
            </p>
          )}
          {filtered.length > limit && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setLimit((l) => l + 192)}
                className="hairline rounded-full bg-white px-5 py-2 text-[13px] font-semibold text-garnet-700"
              >
                Show more ({(filtered.length - limit).toLocaleString()} left)
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
