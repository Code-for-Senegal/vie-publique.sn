export interface Candidate {
  id?: string | number;
  first_name: string;
  last_name: string;
  profession: string;
  gender: string;
  position: number;
  photo: string | null;
  voter_number: string;
  biography: string | null;
  facebook?: string;
  twitter?: string;
}
