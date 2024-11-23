import type { ElectionStatsList } from "~/types/election-stats-profession";

export const useElectionStatsList = () => {
  console.debug("useElectionStatsList");
  const config = useRuntimeConfig();

  const apiUrl = `${config.public.cmsApiUrl}/items/election_electoral_lists?aggregate[count]=id&groupBy[]=coalition&sort=-count.id&filter[is_substitute]=false&filter[type][_in]=departmental,diaspora`;

  return useAsyncData(
    `useElectionStatsList`,
    () =>
      $fetch<{ data: ElectionStatsList[] }>(apiUrl, {
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
