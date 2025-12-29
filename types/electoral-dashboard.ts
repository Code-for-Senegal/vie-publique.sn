import type { Coalition } from './coalition';
import type { Candidate } from './candidate';

export interface DashboardCoalition extends Coalition {
  head_of_list: {
    last_name: string;
    first_name: string;
    photo: string;
    profession?: string;
  };
}

export interface DashboardCandidate extends Candidate {
  facebook?: string;
  twitter?: string;
}

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface GroupedConstituency {
  name: string;
  titulaires: any | null;
  suppleants: any | null;
}

export interface ElectionDetails {
  name: string;
  status: string;
  rounds?: number;
  description?: string;
  election_date: string | null;
  campaign_start_date: string | null;
  campaign_end_date: string | null;
  date_round_2?: string | null;
}
