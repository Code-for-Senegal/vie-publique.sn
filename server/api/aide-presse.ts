import aides from "~/assets/data/medias-fadp.json";
import type { AidePresse } from "~/types/aide-presse-type";

export default defineEventHandler((): AidePresse[] => {
  return aides;
});
