export type Talent = {
  id: string;
  name: string;
  headshotUrl: string;
  union: string;
  height: string;
  heightIn: number | null;
  weight: string;
  skills: string;
  vocalRange: string;
  repStatus: string;
  repDetail: string;
  agencyIds: string[];
  submittedForIds: string[];
  shortlistForIds: string[];
  engagement: string;
  submissionNotes: string;
  beAppearances: number | null;
  actorsAccessUrl: string;
  beResumeId: string;
  dataConfidence: string;
  lane: string;
  assessedTier: string;
};

export type NamedRef = { id: string; name: string };

export type Roster = {
  fetchedAt: string;
  mock: boolean;
  talent: Talent[];
  agencies: NamedRef[];
  roles: NamedRef[];
};

export const TIERS = ["Emerging", "Established", "Premium"] as const;
export const CONFIDENCES = ["Verified", "Unverified"] as const;
export const LANES = ["Actor", "Producer/Director", "Investor/Financier", "Other"] as const;
export const UNION_BUCKETS = ["SAG-AFTRA", "SAG-AFTRA Eligible", "Non-Union", "AEA"] as const;
