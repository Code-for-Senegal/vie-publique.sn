interface Candidate {
  first_name: string;
  last_name: string;
  profession: string;
  gender: string;
  position: number;
  photo: string | null;
  voter_number: string;
}

interface ElectoralList {
  name: string;
  type: "national" | "departmental";
  is_substitute: boolean;
  candidates: Candidate[];
  constituency: { name: string } | null;
}

// import type { ElectoralList } from '~/types/election'  // Assurez-vous d'avoir défini ce type

export const useElectoralLists = (coalitionId: string) => {
  console.log("useElectoralLists");
  return useAsyncData(
    `electoral-lists-${coalitionId}`,
    () =>
      $fetch<{ data: ElectoralList[] }>(
        `https://cms.vie-publique.sn/items/election_electoral_lists`,
        {
          params: {
            filter: { coalition: coalitionId },
          },
          headers: {
            Authorization: "Bearer UEKE4VSBPluwM9sUtUH0E-9bsL2Mnge1",
          },
        },
      ),
    {
      transform: (response) => response.data,
      server: true, // Exécution côté serveur pour le rendu initial
      lazy: false, // Exécution immédiate
    },
  );
};
