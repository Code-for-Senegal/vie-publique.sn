// types/media.ts
export interface Media {
  nom: string;
  type: MediaType;
  logo: string | null;
  url: string | null;
}

export type MediaType =
  | "TV"
  | "RADIO"
  | "PE"
  | "PEL"
  | "WEB TV"
  | "RADIO COMMUNAUTAIRES";
