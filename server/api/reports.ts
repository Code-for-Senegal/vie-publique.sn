import reports from "~/assets/data/rapports-liste.json"; // Assurez-vous que le chemin d'accès au fichier JSON est correct.

export default defineEventHandler((): any[] => {
  return reports;
});
