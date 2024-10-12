import type { Coalition } from "~/types/coalition";

export const useCoalitions = () => {
  //   const runtimeConfig = useRuntimeConfig();
  //   const cmsApiUrl = ref(runtimeConfig.public.cmsApiUrl);
  //   const cmsApiKey = ref(runtimeConfig.public.cmsApiKey);
  //   const url = `${cmsApiUrl.value}/items/election_coalition?sort=list_order`;
  console.log("useCoalitions");

  return useAsyncData(
    "coalitions",
    () =>
      $fetch<{ data: Coalition[] }>(
        "https://cms.vie-publique.sn/items/election_coalition?sort=list_order",
        {
          headers: {
            Authorization: "Bearer UEKE4VSBPluwM9sUtUH0E-9bsL2Mnge1",
          },
        },
      ),
    {
      transform: (response) => response.data,
      server: true,
      lazy: false,
    },
  );
};
