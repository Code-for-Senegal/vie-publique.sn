export interface SocialStat {
  id: string;
  name: string;
  followers: number;
  display: boolean;
  order: number | null;
  link: string;
  status?: string;
}

export interface SocialStatsResponse {
  data: SocialStat[];
  total: number;
}
