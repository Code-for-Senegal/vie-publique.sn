import { createDirectus, staticToken, rest, realtime } from "@directus/sdk";

const directusUrl = process.env.CMS_API_URL || "https://cms.vie-publique.sn";
const directusToken = process.env.CMS_API_KEY;

if (!directusToken) {
  throw new Error("CMS_API_KEY environment variable is required");
}

const client = createDirectus(directusUrl)
  .with(staticToken(directusToken))
  .with(rest())
  .with(realtime());

export const directus = client;
