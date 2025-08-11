import { createDirectus, staticToken, rest, realtime } from "@directus/sdk";

let client: any = null;

function getDirectusClient() {
  if (!client) {
    const directusUrl = process.env.CMS_API_URL || "https://cms.vie-publique.sn";
    const directusToken = process.env.CMS_API_KEY;

    if (!directusToken) {
      throw new Error("CMS_API_KEY environment variable is required");
    }

    client = createDirectus(directusUrl)
      .with(staticToken(directusToken))
      .with(rest())
      .with(realtime());
  }
  
  return client;
}

export const directus = new Proxy({}, {
  get(target, prop) {
    return getDirectusClient()[prop];
  }
});
