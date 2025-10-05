import { createDirectus, rest, staticToken } from "@directus/sdk";
import type { DirectusClient, RestClient } from "@directus/sdk";

let directusClient: DirectusClient<any> & RestClient<any>;

export const getDirectusClient = () => {
  const config = useRuntimeConfig();

  if (!directusClient) {
    directusClient = createDirectus(config.cmsApiUrl)
      .with(rest())
      .with(staticToken(config.cmsApiKey));
  }

  return directusClient;
};
