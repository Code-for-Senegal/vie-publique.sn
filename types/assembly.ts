/**
 * Types pour les entités de l'Assemblée Nationale
 */
import type { Document } from './document';

// Type de base pour un député
export interface AssemblyDeputy {
  id: number;
  first_name: string;
  last_name: string;
  gender?: string;
  photo?: string | null;
  profession?: string | null;
  birthplace?: string | null;
  birthdate?: string | null;
  biography?: string | null;
  bio?: string | null;
  facebook?: string | null;
  twitter?: string | null;
  group?: AssemblyGroupInfo | null;
  electoral_list?: AssemblyElectoralList | null;
}

// Type pour une liste électorale
export interface AssemblyElectoralList {
  name: string;
  type?: string | null;
  coalition?: {
    name: string;
    color?: string | null;
  } | null;
  constituency?: {
    name: string;
  } | null;
}

// Type pour les commissions d'un député
export interface AssemblyDeputyCommission {
  assembly_commission_id: {
    id: string;
    name: string;
  };
  assembly_deputy_id: string;
}

// Type d'information minimale sur un groupe
export interface AssemblyGroupInfo {
  name: string;
  color: string; // ✅ Rendre obligatoire pour éviter les erreurs TypeScript
}

// Type pour une commission parlementaire
export interface AssemblyCommission {
  id: string;
  name: string;
  description?: string | null;
  type: 'permanent' | 'special' | 'ad_hoc';
  president?: AssemblyDeputy | null;
  vice_president?: AssemblyDeputy | null;
  '1st_vice_president'?: AssemblyDeputy | null;
  '2nd_vice_president'?: AssemblyDeputy | null;
  secretary?: AssemblyDeputy | null;
  reporter?: AssemblyDeputy | null;
  members?: AssemblyDeputy[];
  membersCount?: number;
}

// Type pour un groupe parlementaire
export interface AssemblyGroup {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  creation_date?: string | null;
  logo?: string | null;
  description?: string | null;
  color?: string | null;
  president?: AssemblyDeputy | null;
  vice_president?: AssemblyDeputy | null;
  members?: AssemblyDeputy[];
  membersCount?: number;
}

// Type pour un membre du bureau de l'assemblée
export interface AssemblyOfficeMember {
  id: string;
  role: string;
  rank?: number | null;
  deputy?: AssemblyDeputy | null;
}

// Type pour une question parlementaire
export interface AssemblyQuestion {
  id: string;
  subject: string;
  slug?: string;
  question_text?: string | null;
  question_date?: string | null;
  status: 'draft' | 'published' | 'answered';
  deputy?: AssemblyDeputy | null;
  attachments?: AssemblyQuestionAttachment[];
}

// Type pour une pièce jointe d'une question
export interface AssemblyQuestionAttachment {
  id: string;
  type?: string;
  filename?: string;
  filesize?: number;
  url?: string | null;
}

// Type pour un vote parlementaire
export interface AssemblyVote {
  id: string;
  title?: string | null;
  description?: string | null;
  date?: string | null;
  status?: string | null;
  vote_type?: string | null;
  result?: 'adopted' | 'rejected' | 'pending' | null;
  votes_for?: number;
  votes_against?: number;
  votes_abstain?: number;
  total_votes?: number;
  law_project?: string | null;
  session?: string | null;
  deputy_votes?: AssemblyDeputyVote[];
  /** Champs réels renvoyés par l'API (assembly_vote) */
  name?: string | null;
  slug?: string | null;
  desc?: string | null;
  /** Documents liés (M2M assembly_vote_documents), aplatis côté serveur */
  documents?: Document[];
}

// Type pour le vote d'un député
export interface AssemblyDeputyVote {
  deputy?: AssemblyDeputy | null;
  vote: 'for' | 'against' | 'abstain';
}
