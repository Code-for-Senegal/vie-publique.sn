import journaux from "~/assets/data/journaux-officiels.json";
import { Journal } from "~/types/journal";

export default defineEventHandler((): Journal[] => {
  return journaux;
});
