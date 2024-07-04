import governmentMembers from "~/assets/data/government-members.json"; // Assurez-vous que le chemin d'accès au fichier JSON est correct.
import { GovernmentMember } from "~/types/government-member";

export default defineEventHandler((): GovernmentMember[] => {
  return governmentMembers.sort(
    (a, b) =>
      new Date(b.nominationDate).getTime() -
      new Date(a.nominationDate).getTime()
  );
});
