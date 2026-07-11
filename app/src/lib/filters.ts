import type { Talent } from "./types";

export type Filters = {
  union: string[];
  minIn: number | null;
  maxIn: number | null;
  skill: string;
  agency: string;
  tier: string[];
  confidence: string[];
  lane: string[];
};

export const EMPTY_FILTERS: Filters = {
  union: [],
  minIn: null,
  maxIn: null,
  skill: "",
  agency: "",
  tier: [],
  confidence: [],
  lane: [],
};

export type SortKey = "name" | "heightAsc" | "heightDesc" | "appearances";

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "name", label: "Name A–Z" },
  { key: "heightAsc", label: "Height — shortest first" },
  { key: "heightDesc", label: "Height — tallest first" },
  { key: "appearances", label: "Most BE appearances" },
];

export function matchesUnion(union: string, bucket: string): boolean {
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

export function activeFilterCount(f: Filters): number {
  return (
    f.union.length +
    f.tier.length +
    f.confidence.length +
    f.lane.length +
    (f.minIn !== null ? 1 : 0) +
    (f.maxIn !== null ? 1 : 0) +
    (f.skill.trim() ? 1 : 0) +
    (f.agency.trim() ? 1 : 0)
  );
}

export function applyFilters(
  talent: Talent[],
  query: string,
  f: Filters,
  agencyById: Map<string, string>,
): Talent[] {
  const q = query.trim().toLowerCase();
  const skill = f.skill.trim().toLowerCase();
  const agency = f.agency.trim().toLowerCase();
  return talent.filter((t) => {
    if (q && !t.name.toLowerCase().includes(q)) return false;
    if (f.union.length && !f.union.some((b) => matchesUnion(t.union, b))) return false;
    if (f.minIn !== null && (t.heightIn === null || t.heightIn < f.minIn)) return false;
    if (f.maxIn !== null && (t.heightIn === null || t.heightIn > f.maxIn)) return false;
    if (skill && !t.skills.toLowerCase().includes(skill)) return false;
    if (agency) {
      const names = t.agencyIds.map((id) => agencyById.get(id) ?? "").join(" ");
      if (!`${names} ${t.repDetail}`.toLowerCase().includes(agency)) return false;
    }
    if (f.tier.length && !f.tier.includes(t.assessedTier)) return false;
    if (f.confidence.length && !f.confidence.includes(t.dataConfidence)) return false;
    if (f.lane.length && !f.lane.includes(t.lane)) return false;
    return true;
  });
}

export function sortTalent(list: Talent[], key: SortKey): Talent[] {
  const arr = [...list];
  switch (key) {
    case "heightAsc":
      arr.sort((a, b) => (a.heightIn ?? 999) - (b.heightIn ?? 999));
      break;
    case "heightDesc":
      arr.sort((a, b) => (b.heightIn ?? -1) - (a.heightIn ?? -1));
      break;
    case "appearances":
      arr.sort((a, b) => (b.beAppearances ?? 0) - (a.beAppearances ?? 0));
      break;
    default:
      arr.sort((a, b) => a.name.localeCompare(b.name));
  }
  return arr;
}

export function describeActiveFilters(f: Filters): { key: string; label: string }[] {
  const chips: { key: string; label: string }[] = [];
  for (const u of f.union) chips.push({ key: `union:${u}`, label: u });
  if (f.minIn !== null) chips.push({ key: "minIn", label: `≥ ${fmtIn(f.minIn)}` });
  if (f.maxIn !== null) chips.push({ key: "maxIn", label: `≤ ${fmtIn(f.maxIn)}` });
  if (f.skill.trim()) chips.push({ key: "skill", label: `Skill: ${f.skill.trim()}` });
  if (f.agency.trim()) chips.push({ key: "agency", label: `Agency: ${f.agency.trim()}` });
  for (const t of f.tier) chips.push({ key: `tier:${t}`, label: t });
  for (const c of f.confidence) chips.push({ key: `confidence:${c}`, label: c });
  for (const l of f.lane) chips.push({ key: `lane:${l}`, label: l });
  return chips;
}

export function removeFilter(f: Filters, key: string): Filters {
  const next = { ...f, union: [...f.union], tier: [...f.tier], confidence: [...f.confidence], lane: [...f.lane] };
  if (key === "minIn") next.minIn = null;
  else if (key === "maxIn") next.maxIn = null;
  else if (key === "skill") next.skill = "";
  else if (key === "agency") next.agency = "";
  else {
    const [group, value] = key.split(":");
    if (group === "union") next.union = next.union.filter((x) => x !== value);
    if (group === "tier") next.tier = next.tier.filter((x) => x !== value);
    if (group === "confidence") next.confidence = next.confidence.filter((x) => x !== value);
    if (group === "lane") next.lane = next.lane.filter((x) => x !== value);
  }
  return next;
}

export function fmtIn(inches: number): string {
  return `${Math.floor(inches / 12)}'${inches % 12}"`;
}
