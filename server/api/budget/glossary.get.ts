import { readItems } from '@directus/sdk';

interface GlossaryTerm {
  id: number;
  slug: string;
  term: string;
  category: string;
  aliases?: string[] | null;
  definition_short: string;
  definition_long?: string | null;
  unit?: string | null;
}

export default defineCachedEventHandler(
  async () => {
    try {
      const directus = getCmsClient();

      // Récupérer tous les termes du glossaire (recherche/filtrage côté client)
      const terms = await directus.request(
        readItems('budget_glossary', {
          fields: [
            'id',
            'slug',
            'term',
            'category',
            'aliases',
            'definition_short',
            'definition_long',
            'unit',
          ],
          filter: {
            status: { _eq: 'published' },
          },
          sort: ['term'], // Tri alphabétique
          limit: -1, // Tous les termes
        }),
      );

      return {
        terms: terms || [],
        total: terms?.length || 0,
      };
    } catch (error: any) {
      console.error('Erreur récupération glossaire budget:', error);

      throw createError({
        statusCode: 500,
        statusMessage: 'Erreur lors de la récupération du glossaire budgétaire',
      });
    }
  },
  {
    maxAge: process.env.NODE_ENV === 'production' ? 5 * 60 : 0, // 24h en prod, pas de cache en dev
    name: 'budget-glossary',
    getKey: () => 'budget-glossary-all',
  },
);
