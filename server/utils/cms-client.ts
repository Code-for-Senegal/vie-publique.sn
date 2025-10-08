import { createDirectus, rest, staticToken } from "@directus/sdk";
import type { DirectusClient, RestClient } from "@directus/sdk";

let cmsClient: DirectusClient<any> & RestClient<any>;

export const getCmsClient = () => {
  const config = useRuntimeConfig();

  if (!cmsClient) {
    cmsClient = createDirectus(config.cmsApiUrl)
      .with(rest())
      .with(staticToken(config.cmsApiKey));
  }

  return cmsClient;
};
