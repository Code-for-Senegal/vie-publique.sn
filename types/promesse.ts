export type Promesse = {
  label: string;
  objectif: string;
  sector: string;
  schedules: string;
  status: string;
  reference: string;
  source: string;
  theme: string;
};

export type PromesseStats = {
  total: number;
  tenues: number;
  non_tenues: number;
  en_cours: number;
  non_evaluees: number;
  inevaluables: number;
};
