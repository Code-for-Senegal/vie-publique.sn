import promesses from "~/assets/data/rapports-liste.json";
// import { Question } from "~/types/question";

export default defineEventHandler((): any[] => {
  return promesses;
});
