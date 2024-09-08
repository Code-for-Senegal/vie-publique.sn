import aides from "~/assets/data/fadp.json";
import type { AidePresse } from "~/types/aide-presse-type";

export default defineEventHandler((): AidePresse[] => {
  return aides;
});
