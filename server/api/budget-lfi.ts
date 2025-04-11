import data from "~/assets/data/budget/budget-2024-lfi.json";
// import { GovernmentMember } from "~/types/government-member";

export default defineEventHandler((): any => {
  return data;
});
