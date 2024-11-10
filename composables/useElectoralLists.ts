import type { Candidate } from "~/types/candidate";

interface ElectoralList {
  name: string;
  type: "national" | "departmental" | "diaspora";
  is_substitute: boolean;
  candidates: Candidate[];
  constituency: { name: string } | null;
}

export const useElectoralLists = (coalitionId: string) => {
  const config = useRuntimeConfig();

  return useAsyncData(
    `electoral-lists-${coalitionId}`,
    () =>
      $fetch<{ data: ElectoralList[] }>(
        `${config.public.cmsApiUrl}/items/election_electoral_lists`,
        {
          params: {
            filter: { coalition: coalitionId },
            limit: 400,
            fields:
              "name,type,is_substitute,candidates.first_name,candidates.last_name,candidates.profession,candidates.gender,candidates.position,candidates.photo,candidates.biography,candidates.voter_number,constituency.name",
          },
          headers: {
            Authorization: `Bearer ${config.public.cmsApiKey}`,
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
