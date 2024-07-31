import governmentMembers from "~/assets/data/nominations.json";
import { GovernmentMember } from "~/types/government-member";

export default defineEventHandler((): GovernmentMember[] => {
  return governmentMembers
  .filter((member: GovernmentMember) => member.nominationDate === "2024-07-18")
  .sort(
    (a, b) =>
      new Date(b.nominationDate).getTime() -
      new Date(a.nominationDate).getTime()
  );
});
