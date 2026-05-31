export interface PublicPersonAppointment {
  id: number;
  position_title: string;
  position_category: string;
  position_category_slug?: string | null;
  organization_label: string;
  appointment_date: string;
  end_date?: string | null;
  end_reason?: string | null;
  is_current: boolean;
  predecessor_label?: string | null;
  predecessor?: { id: number; full_name: string; slug: string } | null;
  successor_label?: string | null;
  successor?: { id: number; full_name: string; slug: string } | null;
  source_label?: string | null;
  source_link?: string | null;
  source_document?: { id: number; title: string } | null;
  notes?: string | null;
}

export interface PublicPerson {
  id: number;
  full_name: string;
  slug: string;
  sexe: 'male' | 'female';
  short_bio?: string | null;
  long_bio?: string | null;
  education?: string | null;
  photo?: string | null;
  facebook?: string | null;
  twitter?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  linkedin?: string | null;
  website?: string | null;
  current_appointment?: PublicPersonAppointment | null;
}

export interface PublicPersonDetail extends PublicPerson {
  appointments: PublicPersonAppointment[];
}
