// types/minister.ts
export type GovernmentMember = {
  sexe: string;
  name: string;
  type: string | null;
  role: string;
  nominationDate: string;
  photo: string | null;
  formation: string | null;
  predecessor: string | null;
  rating: number | null;
};
