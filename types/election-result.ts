// types/election.ts

export interface CandidateResult {
  coalitionId: number;
  nom: string;
  nombreVotes: number;
  pourcentage: number;
}

export interface DepartmentResult {
  totalElecteursInscrits: number;
  totalSuffragesExprimes: number;
  totalVotesHorsBureauOrigine: number;
  totalBulletinsNuls: number;
  totalVotesExprimes: number;
  tauxParticipation: number;
  region: string;
  departement: string;
  resultatsCandidats: CandidateResult[];
  totalBureaux: number;
  totalBureauxTraites: number;
  pourcentageBureauTraité: number;
}
