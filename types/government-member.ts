// types/minister.ts
export type GovernmentMember = {
  name: string;
  type: string | null;
  role: string;
  nominationDate: string;
  photo: string | null;
  rating: number;
};
