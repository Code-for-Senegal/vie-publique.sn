import type { DirectusClient, RestClient } from '@directus/sdk';
import { createDirectus, rest, staticToken } from '@directus/sdk';

let localCmsClient: DirectusClient<any> & RestClient<any>;

/**
 * Client Directus local pour le Dashboard Électoral.
 * Tente de se connecter au CMS local ou repli sur prod si absent.
 */
export const getLocalCmsClient = () => {
  const config = useRuntimeConfig();
  
  // Priorités de recherche de l'URL du CMS
  const apiUrl = 
    config.cmsLocalApiUrl ||                   // Config spécifique dashboard
    config.public?.sunuElectionApiUrl ||       // Config publique élection
    config.cmsApiUrl ||                        // Config CMS globale
    'https://cms.vie-publique.sn';             // Production (fallback ultime)

  const apiKey = 
    config.cmsLocalApiKey || 
    config.public?.sunuElectionApiKey || 
    config.cmsApiKey;

  if (!localCmsClient) {
    console.log(`[CMS-LOCAL] Attaching to: ${apiUrl}`);
    try {
      localCmsClient = createDirectus(apiUrl)
        .with(rest())
        .with(staticToken(apiKey));
    } catch (e) {
      console.error(`[CMS-LOCAL] CRITICAL: Invalid URL ${apiUrl}`);
      localCmsClient = createDirectus('https://cms.vie-publique.sn')
        .with(rest())
        .with(staticToken(apiKey));
    }
  }

  return localCmsClient;
};
