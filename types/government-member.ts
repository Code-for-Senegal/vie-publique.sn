export type GovernmentMember = {
  id?: string;
  sexe: string;
  name: string;
  slug?: string; // Generated from name if not provided by Directus
  type: string | null;
  role: string;
  nominationDate: string;
  endDate: string;
  photo: string | null;
  formation: string | null;
  predecessor: string | null;
  rating: number | null;
  portrait: string | null;
  organisation: string | null;
  bio?: string | null; // HTML biography from Directus
};
