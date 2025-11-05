import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface GlossaryTerm {
  id: number;
  term: string;
  definition: string;
}

export default defineCachedEventHandler(
  async () => {
    // Lire le fichier JSON depuis server/data/
    const filePath = resolve(process.cwd(), 'server/data/budget-glossary.json');
    const fileContent = readFileSync(filePath, 'utf-8');
    const glossaryData: GlossaryTerm[] = JSON.parse(fileContent);

    return {
      terms: glossaryData,
      total: glossaryData.length,
    };
  },
  {
    maxAge: 60 * 60 * 24, // Cache 24h (données statiques)
    getKey: () => 'budget-glossary',
  }
);
