// ─── Dashboard ───────────────────────────────────────────────────────

/** Score CPI Transparency International (0-100) */
export interface CorruptionScoreCPI {
  year: number;
  score: number; // 0-100
  rank: number;
  totalCountries: number;
  trend: 'up' | 'down' | 'stable';
  trendDelta: number;
}

/** Score IIAG Mo Ibrahim (0-100) — Gouvernance globale en Afrique */
export interface GovernanceScoreIIAG {
  year: number;
  score: number; // 0-100
  rank: number;
  totalCountries: number; // 54 pays africains
  trend: 'up' | 'down' | 'stable';
  trendDelta: number;
}

export interface CorruptionEvolution {
  year: number;
  score: number;
  africaAvg: number; // moyenne Afrique subsaharienne
}

export interface CorruptionPillar {
  key: string;
  label: string;
  score: number; // 0-100
  trendDelta: number;
  description: string;
}

export interface AlertSignal {
  id: string;
  label: string;
  value: string;
  numericValue?: number;
  icon: string;
  trend: 'up' | 'down' | 'stable';
  source: string;
}

export interface CorruptionSource {
  name: string;
  url: string;
}

export interface CorruptionDashboardResponse {
  country: string;
  iiag: GovernanceScoreIIAG;
  cpi: CorruptionScoreCPI;
  evolution: CorruptionEvolution[];
  pillars: CorruptionPillar[];
  alerts: AlertSignal[];
  lastUpdated: string; // ISO date
  sources: CorruptionSource[];
}

// ─── Whistleblowing ──────────────────────────────────────────────────

export interface WhistleblowingSubject {
  id: string;
  label: string;
  description: string;
  icon: string;
}

export interface WhistleblowingSubjectsResponse {
  subjects: WhistleblowingSubject[];
}

export interface WhistleblowingSubmitRequest {
  subjectId: string;
  description: string; // min 10, max 1000
  contactEmail?: string;
  attachmentMeta?: {
    name: string;
    size: number;
    type: string;
  };
}

export interface WhistleblowingSubmitResponse {
  success: boolean;
  ticketId: string; // ex: "VP-4827"
  message: string;
  createdAt: string; // ISO date
}
