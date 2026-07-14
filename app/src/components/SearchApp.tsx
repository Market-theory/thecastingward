"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Fuse from "fuse.js";
import type { Roster } from "@/lib/types";
import type { Filters, SortKey } from "@/lib/filters";
import {
  EMPTY_FILTERS,
  SORT_OPTIONS,
  activeFilterCount,
  applyFilters,
  applyQuery,
  buildHaystack,
  describeActiveFilters,
  removeFilter,
  sortTalent,
} from "@/lib/filters";
import FilterSheet from "./FilterSheet";
import TalentCard from "./TalentCard";

export default function SearchApp() {
  const [roster, setRoster] = useState<Roster | null>(null);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("name");
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

  const roleById = useMemo(() => {
    const m = new Map<string, string>();
    for (const r of roster?.roles ?? []) m.set(r.id, r.name);
    return m;
  }, [roster]);

  // Precompute a full-text haystack per talent once, so the search box can
  // match anything (skills, union, agency, resume ID, submitted roles…)
  // without rebuilding strings on every keystroke.
  const haystackById = useMemo(() => {
    const m = new Map<string, string>();
    for (const t of roster?.talent ?? []) {
      const agencyNames = t.agencyIds.map((id) => agencyById.get(id) ?? "").join(" ");
      const roleNames = [...t.submittedForIds, ...t.shortlistForIds]
        .map((id) => roleById.get(id) ?? "")
        .join(" ");
      m.set(t.id, buildHaystack(t, agencyNames, roleNames));
    }
    return m;
  }, [roster, agencyById, roleById]);

  // Fuse index over the haystacks — powers typo-tolerant fallback. Built once
  // per roster; searched only when a literal match returns nothing.
  const fuse = useMemo(() => {
    const docs = (roster?.talent ?? []).map((t) => ({ id: t.id, hay: haystackById.get(t.id) ?? "" }));
    return new Fuse(docs, {
      keys: ["hay"],
      threshold: 0.42,
      distance: 400,
      ignoreLocation: true,
      minMatchCharLength: 2,
    });
  }, [roster, haystackById]);

  // Fuzzy id set for the current query (only computed when there's a query).
  const fuzzyIds = useMemo(() => {
    if (!roster || q.trim().length < 2) return null;
    return new Set(fuse.search(q.trim()).map((r) => r.item.id));
  }, [roster, q, fuse]);

  const runFilters = (f: Filters) => {
    if (!roster) return [];
    const structured = applyFilters(roster.talent, f, agencyById);
    return applyQuery(structured, q, haystackById, fuzzyIds);
  };

  const filtered = useMemo(
    () => sortTalent(runFilters(filters), sortKey),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [roster, q, filters, sortKey, agencyById, haystackById, fuzzyIds],
  );

  // Live count for the sheet's Apply button, computed against the draft.
  const draftCount = useMemo(
    () => (roster && sheetOpen ? runFilters(draft).length : 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [roster, sheetOpen, q, draft, agencyById, haystackById, fuzzyIds],
  );

  const nActive = activeFilterCount(filters);
  const activeChips = describeActiveFilters(filters);
  const sortLabel = SORT_OPTIONS.find((s) => s.key === sortKey)?.label ?? "Sort";

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16" ref={topRef}>
      <header className="frosted sticky top-0 z-10 -mx-4 px-4 pb-3 pt-4">
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="text-[22px] font-bold tracking-tight text-garnet-800">The Casting Ward</h1>
          <div className="flex items-center gap-3 text-[12px] text-ink/50">
            {roster?.mock && <span>demo data</span>}
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
          placeholder="Search name, skill, union, agency, resume ID…"
          className="hairline mt-3 w-full rounded-xl bg-white px-4 py-2.5 text-[15px] outline-none placeholder:text-ink/35 focus:ring-2 focus:ring-brass-400"
        />

        <div className="scrollbar-none -mx-4 mt-2.5 flex items-center gap-2 overflow-x-auto px-4 pb-0.5">
          <button
            onClick={() => setSortOpen(true)}
            className="hairline shrink-0 rounded-full bg-white px-3.5 py-1.5 text-[13px] font-medium text-ink/75"
          >
            ⇅ {sortKey === "name" ? "Sort" : sortLabel}
          </button>
          <button
            onClick={() => setSheetOpen(true)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium ${
              nActive > 0 ? "bg-garnet-700 text-white" : "hairline bg-white text-ink/75"
            }`}
          >
            Filters{nActive > 0 ? ` (${nActive})` : ""}
          </button>
          {activeChips.map((c) => (
            <button
              key={c.key}
              onClick={() => setFilters((f) => removeFilter(f, c.key))}
              className="shrink-0 rounded-full bg-garnet-100 px-3 py-1.5 text-[13px] font-medium text-garnet-800"
              title="Remove filter"
            >
              {c.label} ✕
            </button>
          ))}
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
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-ink/40">
            {filtered.length.toLocaleString()} {filtered.length === 1 ? "actor" : "actors"}
          </p>
          <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filtered.slice(0, limit).map((t) => (
              <TalentCard
                key={t.id}
                talent={t}
                agencyName={t.agencyIds.map((id) => agencyById.get(id)).filter(Boolean).join(", ")}
              />
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="mt-16 text-center text-sm text-ink/50">No one matches — loosen a filter.</p>
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

      <FilterSheet
        open={sheetOpen}
        initial={filters}
        resultCount={draftCount}
        onDraftChange={setDraft}
        onApply={(f) => {
          setFilters(f);
          setSheetOpen(false);
          setLimit(96);
          topRef.current?.scrollIntoView({ behavior: "smooth" });
        }}
        onClose={() => setSheetOpen(false)}
      />

      {sortOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={() => setSortOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-cream pb-4 shadow-2xl sm:inset-x-auto sm:left-1/2 sm:top-1/2 sm:w-[360px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl">
            <div className="mx-auto mt-2.5 h-1 w-9 rounded-full bg-ink/15 sm:hidden" />
            <p className="px-5 pb-1 pt-3 text-[17px] font-bold tracking-tight">Sort by</p>
            {SORT_OPTIONS.map((s) => (
              <button
                key={s.key}
                onClick={() => {
                  setSortKey(s.key);
                  setSortOpen(false);
                }}
                className="flex w-full items-center justify-between px-5 py-3 text-left text-[15px] active:bg-ink/5"
              >
                <span className={s.key === sortKey ? "font-semibold" : ""}>{s.label}</span>
                {s.key === sortKey && <span className="text-garnet-700">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
