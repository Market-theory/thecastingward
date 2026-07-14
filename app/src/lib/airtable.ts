import type { NamedRef, Roster, Talent } from "./types";
import { mockRoster } from "./mock";

const BASE_ID = "appwOxqLtl8mJYFv3";
const TALENT = "tbl7rjwjvTv9StY82";
const REPRESENTATION = "tbl7lmUGOf7bQQ8xO";
const ROLES = "tblKXPftHARmxlZxQ";

const API = `https://api.airtable.com/v0/${BASE_ID}`;
const TTL_MS = 15 * 60 * 1000;

const TALENT_FIELDS = [
  "Name",
  "City / Location",
  "Headshot URL",
  "Union Status",
  "Height",
  "Height (inches)",
  "Weight",
  "Skills",
  "Vocal Range",
  "Representation Status",
  "Representation Detail",
  "Representation",
  "Submitted For",
  "Shortlist For",
  "Engagement Status (BE)",
  "Submission Notes",
  "BE Appearances Count",
  "Actors Access URL",
  "BE Resume ID",
  "Data Confidence",
  "Lane",
  "Assessed Tier",
];

type AirtableRecord = {
  id: string;
  fields: Record<string, unknown>;
};

function token(): string | undefined {
  return process.env.AIRTABLE_TOKEN;
}

async function airtableFetch(path: string, init?: RequestInit): Promise<Response> {
  // Airtable allows ~5 req/s per base; on 429 it asks for a 30s pause.
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(`${API}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token()}`,
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });
    if (res.status === 429 && attempt < 5) {
      await new Promise((r) => setTimeout(r, 30_000));
      continue;
    }
    return res;
  }
}

async function listAll(tableId: string, fields?: string[]): Promise<AirtableRecord[]> {
  const records: AirtableRecord[] = [];
  let offset: string | undefined;
  do {
    const params = new URLSearchParams({ pageSize: "100" });
    for (const f of fields ?? []) params.append("fields[]", f);
    if (offset) params.set("offset", offset);
    const res = await airtableFetch(`/${tableId}?${params.toString()}`);
    if (!res.ok) {
      throw new Error(`Airtable ${tableId} list failed: ${res.status} ${await res.text()}`);
    }
    const json = (await res.json()) as { records: AirtableRecord[]; offset?: string };
    records.push(...json.records);
    offset = json.offset;
    // Stay politely under the rate limit on this long sequential pull.
    if (offset) await new Promise((r) => setTimeout(r, 210));
  } while (offset);
  return records;
}

const s = (v: unknown): string => (typeof v === "string" ? v : "");
const n = (v: unknown): number | null => (typeof v === "number" ? v : null);
const ids = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x) => typeof x === "string") : []);

function toTalent(r: AirtableRecord): Talent {
  const f = r.fields;
  return {
    id: r.id,
    name: s(f["Name"]),
    location: s(f["City / Location"]),
    headshotUrl: s(f["Headshot URL"]),
    union: s(f["Union Status"]),
    height: s(f["Height"]),
    heightIn: n(f["Height (inches)"]),
    weight: s(f["Weight"]),
    skills: s(f["Skills"]),
    vocalRange: s(f["Vocal Range"]),
    repStatus: s(f["Representation Status"]),
    repDetail: s(f["Representation Detail"]),
    agencyIds: ids(f["Representation"]),
    submittedForIds: ids(f["Submitted For"]),
    shortlistForIds: ids(f["Shortlist For"]),
    engagement: s(f["Engagement Status (BE)"]),
    submissionNotes: s(f["Submission Notes"]),
    beAppearances: n(f["BE Appearances Count"]),
    actorsAccessUrl: s(f["Actors Access URL"]),
    beResumeId: s(f["BE Resume ID"]),
    dataConfidence: s(f["Data Confidence"]),
    lane: s(f["Lane"]),
    assessedTier: s(f["Assessed Tier"]),
  };
}

async function fetchRoster(): Promise<Roster> {
  const [talent, agencies, roles] = [
    await listAll(TALENT, TALENT_FIELDS),
    await listAll(REPRESENTATION, ["Name"]),
    await listAll(ROLES, ["Role Name"]),
  ];
  const named = (rs: AirtableRecord[], field: string): NamedRef[] =>
    rs.map((r) => ({ id: r.id, name: s(r.fields[field]) })).filter((x) => x.name);
  return {
    fetchedAt: new Date().toISOString(),
    mock: false,
    talent: talent.map(toTalent).sort((a, b) => a.name.localeCompare(b.name)),
    agencies: named(agencies, "Name").sort((a, b) => a.name.localeCompare(b.name)),
    roles: named(roles, "Role Name").sort((a, b) => a.name.localeCompare(b.name)),
  };
}

// ── In-memory roster cache (stale-while-revalidate) ───────────────────────
// One full pull is ~230 paged requests ≈ 50-60s under Airtable's rate limit,
// so it runs at most once per TTL per warm instance; readers get the stale
// copy while a refresh runs in the background.
type CacheBox = { roster: Roster; fetchedAt: number };
const g = globalThis as typeof globalThis & {
  __cwCache?: CacheBox;
  __cwInflight?: Promise<Roster> | null;
};

async function refresh(): Promise<Roster> {
  if (!g.__cwInflight) {
    g.__cwInflight = fetchRoster()
      .then((roster) => {
        g.__cwCache = { roster, fetchedAt: Date.now() };
        return roster;
      })
      .finally(() => {
        g.__cwInflight = null;
      });
  }
  return g.__cwInflight;
}

export async function getRoster(force = false): Promise<Roster> {
  if (!token()) return mockRoster();
  const cached = g.__cwCache;
  if (cached && !force) {
    if (Date.now() - cached.fetchedAt > TTL_MS) void refresh().catch(() => {});
    return cached.roster;
  }
  return refresh();
}

export async function getTalentLive(recordId: string): Promise<Talent | null> {
  if (!token()) {
    const roster = mockRoster();
    return roster.talent.find((t) => t.id === recordId) ?? null;
  }
  const res = await airtableFetch(`/${TALENT}/${recordId}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Airtable record fetch failed: ${res.status}`);
  return toTalent((await res.json()) as AirtableRecord);
}

// Resolve a handful of linked-record IDs to their display names with ONE
// request, instead of pulling an entire table. Used by the profile page so it
// never triggers the full 20k-record roster fetch (which exceeds the
// serverless timeout on a cold instance).
async function resolveLinkedNames(
  tableId: string,
  nameField: string,
  ids: string[],
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const unique = [...new Set(ids)];
  if (unique.length === 0) return map;
  const formula = `OR(${unique.map((id) => `RECORD_ID()='${id}'`).join(",")})`;
  const params = new URLSearchParams({ filterByFormula: formula, pageSize: "100" });
  params.append("fields[]", nameField);
  const res = await airtableFetch(`/${tableId}?${params.toString()}`);
  if (!res.ok) return map; // names are non-critical; render the profile regardless
  const json = (await res.json()) as { records: AirtableRecord[] };
  for (const r of json.records) map.set(r.id, s(r.fields[nameField]));
  return map;
}

export type TalentPageData = {
  talent: Talent;
  agencies: string[];
  submitted: string[];
  shortlisted: string[];
};

// Everything the profile page needs, resolved cheaply: the record itself plus
// its own linked agency/role names — no full-table scans.
export async function getTalentPageData(recordId: string): Promise<TalentPageData | null> {
  const talent = await getTalentLive(recordId);
  if (!talent) return null;

  if (!token()) {
    const r = mockRoster();
    const nameOf = (refs: NamedRef[], id: string) => refs.find((x) => x.id === id)?.name ?? "";
    return {
      talent,
      agencies: talent.agencyIds.map((id) => nameOf(r.agencies, id)).filter(Boolean),
      submitted: talent.submittedForIds.map((id) => nameOf(r.roles, id)).filter(Boolean),
      shortlisted: talent.shortlistForIds.map((id) => nameOf(r.roles, id)).filter(Boolean),
    };
  }

  const [agencyMap, roleMap] = await Promise.all([
    resolveLinkedNames(REPRESENTATION, "Name", talent.agencyIds),
    resolveLinkedNames(ROLES, "Role Name", [...talent.submittedForIds, ...talent.shortlistForIds]),
  ]);
  const pick = (map: Map<string, string>, ids: string[]) =>
    ids.map((id) => map.get(id) ?? "").filter(Boolean);
  return {
    talent,
    agencies: pick(agencyMap, talent.agencyIds),
    submitted: pick(roleMap, talent.submittedForIds),
    shortlisted: pick(roleMap, talent.shortlistForIds),
  };
}

export async function patchAssessment(
  recordId: string,
  fields: { assessedTier?: string; dataConfidence?: string },
): Promise<Talent> {
  if (!token()) {
    // Mock mode: pretend it worked so the UI flow can be exercised.
    const t = (mockRoster().talent as Talent[]).find((x) => x.id === recordId);
    if (!t) throw new Error("Not found");
    return {
      ...t,
      assessedTier: fields.assessedTier ?? t.assessedTier,
      dataConfidence: fields.dataConfidence ?? t.dataConfidence,
    };
  }
  const patch: Record<string, unknown> = {};
  if (fields.assessedTier !== undefined) {
    patch["Assessed Tier"] = fields.assessedTier === "" ? null : fields.assessedTier;
  }
  if (fields.dataConfidence !== undefined) {
    patch["Data Confidence"] = fields.dataConfidence === "" ? null : fields.dataConfidence;
  }
  const res = await airtableFetch(`/${TALENT}/${recordId}`, {
    method: "PATCH",
    body: JSON.stringify({ fields: patch }),
  });
  if (!res.ok) throw new Error(`Airtable patch failed: ${res.status} ${await res.text()}`);
  const updated = toTalent((await res.json()) as AirtableRecord);
  // Keep the cached copy consistent without a full refetch.
  const cached = g.__cwCache;
  if (cached) {
    const i = cached.roster.talent.findIndex((t) => t.id === recordId);
    if (i >= 0) cached.roster.talent[i] = updated;
  }
  return updated;
}
