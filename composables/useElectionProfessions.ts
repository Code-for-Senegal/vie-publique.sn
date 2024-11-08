import type { ElectionStatsProfession } from "~/types/election-stats-profession";

export const useElectionProfessions = (coalitionId?: string) => {
  console.debug("useElectionProfessions");
  const config = useRuntimeConfig();

  const apiUrl = `${config.public.cmsApiUrl}/items/election_candidates?aggregate[count]=id&groupBy[]=profession&sort=-count.id`;

  return useAsyncData(
    `candidatesProfessions${coalitionId ? `-${coalitionId}` : ""}`,
    () =>
      $fetch<{ data: ElectionStatsProfession[] }>(apiUrl, {
        headers: {
          Authorization: `Bearer ${config.public.cmsApiKey}`,
        },
      }),
    {
      transform: (response) => response.data,
      server: true,
      lazy: false,
    },
  );
};
