// types/media.ts
export type MediaType =
  | "television"
  | "radio"
  | "community_radio"
  | "printed_press"
  | "online_press"
  | "web_tv";

export interface Media {
  id: number;
  name: string;
  type: MediaType;
  group: {
    name: number | null;
  };
  logo: string | null;
  description: string | null;
  facebook: string | null;
  instagram: string | null;
  twitter: string | null;
  youtube: string | null;
  linkedin: string | null;
  website: string | null;
}

// Mapping pour l'affichage en français
export const typeDisplayMap: Record<MediaType, string> = {
  television: "TV",
  radio: "Radio",
  community_radio: "Radio Communautaire",
  printed_press: "Presse Écrite",
  online_press: "Presse en Ligne",
  web_tv: "Web TV",
};

// Mapping pour les couleurs des types
export const typeColorMap: Record<MediaType, string> = {
  television: "bg-blue-50",
  radio: "bg-yellow-100",
  community_radio: "bg-red-50",
  printed_press: "bg-purple-100",
  online_press: "bg-emerald-50",
  web_tv: "bg-blue-50",
};

// Mapping pour les icônes des types
export const typeIconMap: Record<MediaType, string> = {
  television: "i-lucide-tv",
  radio: "i-lucide-radio",
  community_radio: "i-lucide-radio-tower",
  printed_press: "i-lucide-newspaper",
  online_press: "i-lucide-globe",
  web_tv: "i-lucide-monitor-play",
};
