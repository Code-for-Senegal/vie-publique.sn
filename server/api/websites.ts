import Papa from "papaparse";

export default defineEventHandler(async (event) => {
  const csvUrl =
    // "https://raw.githubusercontent.com/senegalouvert/annuaire-sites-publics-senegal/master/data/annuaire.csv";
    "https://raw.githubusercontent.com/malicktech/annuaire-sites-publics-senegal/master/data/annuaire.csv";

  // Télécharge le CSV
  const csvData = await $fetch(csvUrl);

  // Parse le CSV avec PapaParse
  const { data } = Papa.parse(csvData, {
    header: true, // Utilise la première ligne du CSV comme noms de champs
    skipEmptyLines: true,
  });

  // Nettoyer les URLs en supprimant le slash final
  const cleanedData = data.map((item: any) => {
    if (item.url.endsWith("/")) {
      item.url = item.url.slice(0, -1); // Enlever le slash à la fin
    }
    return item;
  });

  return cleanedData; // Renvoie les données nettoyées en JSON
});
