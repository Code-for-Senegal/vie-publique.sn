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
  birthdate?: string;
  birthplace?: string;
  facebook?: string;
  twitter?: string;
  documents?: any;
}
