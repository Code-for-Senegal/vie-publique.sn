// types/election.ts

/**
 * Types pour les élections législatives
 */

export interface ElectionCoalition {
  name: string;
  color: string;
}

export interface ElectionConstituency {
  name: string;
}

export interface ElectionList {
  name: string;
  type: string;
  coalition: ElectionCoalition;
  constituency?: ElectionConstituency;
}

export interface ElectionCandidate {
  id: number;
  first_name: string;
  last_name: string;
  profession: string;
  photo?: string;
  gender: "M" | "F";
  birthplace: string;
  birthdate: string;
  biography?: string;
  is_elected?: boolean;
  electoral_list: ElectionList;
}

export interface ElectionPv {
  id: string;
  departement?: string;
  commune?: string;
  repDiplomatique?: string;
  localite?: string;
  bureau: string;
  photo: string;
  results?: any;
}
