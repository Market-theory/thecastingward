import type { Roster, Talent } from "./types";

// Deterministic fake roster so the app runs (and can be demoed/tested)
// before AIRTABLE_TOKEN is configured. Never used once the token exists.

const FIRST = ["Ava", "Marcus", "Lena", "Diego", "Imani", "Theo", "Priya", "Jonah", "Sofia", "Malik", "Grace", "Hiro", "Nadia", "Cole", "Yara", "Felix", "Dana", "Omar", "Ruth", "Silas"];
const LAST = ["Bennett", "Okafor", "Delgado", "Kim", "Rossi", "Hayes", "Sharma", "Whitfield", "Nakamura", "Price", "Vaughn", "Ortiz", "Klein", "Moreau", "Sato", "Grant", "Idris", "Palmer", "Novak", "Reyes"];
const UNIONS = ["SAG-AFTRA", "SAG-AFTRA Eligible", "NON-UNION", "AEA, SAG-AFTRA"];
const SKILLS = [
  "Basketball, Improvisation, Licensed Driver, Singer",
  "Dance Ballet, Dance Jazz, French Dialect, Piano",
  "Stage Combat, Horseback Riding, Guitar, Stunts",
  "Soccer, Spanish Fluent, Voiceover, Skateboarding",
  "Boxing, Motorcycle License, Swimming, Rock Climbing",
];
const AGENCIES = ["Authentic", "Gersh", "Innovative Artists", "Paradigm", "AKA Talent"];
const ROLES = ["NATE (bd 78762)", "TEDDY (bd 78762)", "MALE HOST (bd 83458)", "DETECTIVE ROSS (bd 91020)", "COMEDIAN (bd 388279)"];

export function mockRoster(): Roster {
  const talent: Talent[] = [];
  for (let i = 0; i < 60; i++) {
    const name = `${FIRST[i % FIRST.length]} ${LAST[(i * 7) % LAST.length]}`.toUpperCase();
    const heightIn = 58 + ((i * 3) % 20);
    const agencyIdx = i % (AGENCIES.length + 1);
    talent.push({
      id: `recMOCK${String(i).padStart(10, "0")}`,
      name,
      headshotUrl: "",
      union: UNIONS[i % UNIONS.length],
      height: `${Math.floor(heightIn / 12)}'${heightIn % 12}"`,
      heightIn,
      weight: `${120 + ((i * 5) % 90)} lbs`,
      skills: SKILLS[i % SKILLS.length],
      vocalRange: i % 3 === 0 ? "Baritone" : "",
      repStatus: agencyIdx === AGENCIES.length ? "Self-Managed" : "Repped",
      repDetail: agencyIdx === AGENCIES.length ? "" : `${AGENCIES[agencyIdx]} — Theatrical`,
      agencyIds: agencyIdx === AGENCIES.length ? [] : [`recAGCY${String(agencyIdx).padStart(10, "0")}`],
      submittedForIds: [`recROLE${String(i % ROLES.length).padStart(10, "0")}`],
      shortlistForIds: [],
      engagement: "selected",
      submissionNotes: ROLES[i % ROLES.length],
      beAppearances: 1 + (i % 6),
      actorsAccessUrl: "https://casting.breakdownexpress.com/talentsearch/onepageresume/000000-0000000",
      beResumeId: `000${i}-000${i * 13}`,
      dataConfidence: i % 4 === 0 ? "Unverified" : "Verified",
      lane: "Actor",
      assessedTier: i % 5 === 0 ? "Premium" : i % 5 === 1 ? "Established" : "",
    });
  }
  talent.sort((a, b) => a.name.localeCompare(b.name));
  return {
    fetchedAt: new Date(0).toISOString(),
    mock: true,
    talent,
    agencies: AGENCIES.map((name, i) => ({ id: `recAGCY${String(i).padStart(10, "0")}`, name })),
    roles: ROLES.map((name, i) => ({ id: `recROLE${String(i).padStart(10, "0")}`, name })),
  };
}
