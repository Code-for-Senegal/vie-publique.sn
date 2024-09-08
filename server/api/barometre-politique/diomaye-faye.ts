// /server/api/barometre-politique/diomaye-faye.ts
import promesses from "~/assets/data/barometre-diomaye.json";
import type { Promesse, PromesseStats } from "~/types/promesse";

function calculateStats(promesses: Promesse[]): PromesseStats {
  const stats: PromesseStats = {
    total: promesses.length,
    tenues: 0,
    non_tenues: 0,
    en_cours: 0,
    non_evaluees: 0,
    inevaluables: 0,
  };

  promesses.forEach((promesse) => {
    switch (promesse.status.toLowerCase()) {
      case "tenue":
        stats.tenues++;
        break;
      case "non tenue":
        stats.non_tenues++;
        break;
      case "en cours":
        stats.en_cours++;
        break;
      case "inévaluable":
        stats.inevaluables++;
        break;
      default:
        stats.non_evaluees++;
    }
  });

  return stats;
}

export default defineEventHandler(() => {
  const stats = calculateStats(promesses);
  return {
    promesses,
    stats,
  };
});
