import governmentMembers from "~/assets/data/nominations.json";
import type { GovernmentMember } from "~/types/government-member";
// DEPRECATED - to delete
export default defineEventHandler((): GovernmentMember[] => {
  return governmentMembers.sort(
    (a, b) =>
      new Date(b.nominationDate).getTime() -
      new Date(a.nominationDate).getTime(),
  );
});
