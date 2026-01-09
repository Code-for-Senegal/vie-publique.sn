import { defineEventHandler, createError, getQuery } from 'h3';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    let searchTerm = query.q as string;
    const types = query.types as string;
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 20;

    // Permettre une recherche vide avec seulement des filtres
    if (!searchTerm || searchTerm.trim() === '') {
      if (!types || types.trim() === '') {
        return {
          data: [],
          total: 0,
          totalIndexed: 0,
          query: searchTerm,
          types: types,
          page: page,
        };
      }
      // Si on a des types mais pas de recherche, utiliser une recherche générale
      searchTerm = '*';
    }

    const config = useRuntimeConfig();
    const typesenseApiKey = config.typesenseApiKey;
    const typesenseUrl = config.typesenseUrl;
    const typesenseCollection = config.typesenseCollection || 'vie-publique-senegal';

    if (!typesenseApiKey) {
      throw createError({
        statusCode: 500,
        message: 'Configuration Typesense manquante',
      });
    }

    const searchUrl = `${typesenseUrl}/collections/${typesenseCollection}/documents/search`;

    // Détection du type de recherche pour adapter la stratégie
    const isPhrasalSearch = searchTerm.includes('"') || searchTerm.split(' ').length > 2;
    const isShortQuery = searchTerm.split(' ').length <= 2;

    // Adapter les poids selon le type de recherche
    // Pour les recherches courtes ou de titres (ex: "loi de finance"), prioriser fortement le titre
    // Pour les recherches longues ou phrasales, équilibrer titre et contenu
    const queryWeights = isShortQuery ? '100,10,5' : '50,20,10';

    const searchParams: any = {
      q: searchTerm,
      query_by: 'title,content_text,tags',
      query_by_weights: queryWeights, // Poids adaptés selon le type de recherche
      sort_by: '_text_match:desc,date_published:desc', // Tri par pertinence puis par date
      highlight_fields: 'title,content_text', // Highlight sur le texte brut
      highlight_start_tag: '<mark>',
      highlight_end_tag: '</mark>',
      highlight_affix_num_tokens: 5, // Contexte autour des mots trouvés
      per_page: limit,
      page: page,
      prioritize_exact_match: true, // Prioriser les correspondances exactes
      typo_tokens_threshold: isPhrasalSearch ? 3 : 2, // Plus de tolérance pour les phrases longues
      drop_tokens_threshold: 2, // Ne pas ignorer les mots courts
      // Optimisation : ne récupérer que les champs nécessaires
      include_fields: 'id,title,content_text,type,category,date_published,cover_image,slug',
      exclude_fields: 'content_html,raw_content,metadata', // Exclure les champs lourds
      facet_by: 'type', // Activer les facettes pour compter par type
      max_facet_values: 10,
    };

    // Ajouter les filtres par type si spécifiés
    if (types && types.trim() !== '') {
      const typesList = types
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      if (typesList.length > 0) {
        // Construire le filtre pour Typesense
        // Format: type:=[document,actualite] ou category.slug:=[actualites,documents]
        const typeFilters = typesList
          .map((type) => {
            if (type === 'document') {
              return 'type:=document';
            } else if (type === 'actualite') {
              return 'type:!=document'; // Tous sauf documents
            }
            return null;
          })
          .filter(Boolean);

        if (typeFilters.length > 0) {
          searchParams.filter_by = typeFilters.join(' || ');
        }
      }
    }

    const response = await $fetch(searchUrl, {
      method: 'GET',
      headers: {
        'x-typesense-api-key': typesenseApiKey,
        'Content-Type': 'application/json',
      },
      params: searchParams,
    });

    const formattedData = (response.hits || []).map((hit: any) => {
      const article = hit.document;
      if (!article) return hit;

      const id = article.id;
      const slug =
        article.slug ||
        (article.title
          ? article.title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '')
          : 'actualite');

      const categorySlug = article.category?.slug;
      const documentType = article.type || 'news';
      let formattedUrl = '/actualites';

      // Handle different types
      if (documentType === 'documents') {
        formattedUrl = `/documents/${id}/${slug}`;
      } else {
        // Handle news articles
        if (categorySlug === 'conseil-des-ministres') {
          formattedUrl = `/conseil-des-ministres/${id}/${slug}`;
        } else if (categorySlug === 'assemblee-nationale') {
          formattedUrl = `/assemblee-nationale/actualites/${id}/${slug}`;
        } else {
          formattedUrl = `/actualites/${id}/${slug}`;
        }
      }

      return {
        ...hit,
        formattedUrl,
      };
    });

    // Extraire les comptages par type des facettes
    const typeCounts: Record<string, number> = {};
    if (response.facet_counts && response.facet_counts.length > 0) {
      const typeFacet = response.facet_counts.find((f: any) => f.field_name === 'type');
      if (typeFacet && typeFacet.counts) {
        typeFacet.counts.forEach((count: any) => {
          typeCounts[count.value] = count.count;
        });
      }
    }

    return {
      data: formattedData,
      total: response.found || 0,
      totalIndexed: response.out_of || response.found || 0,
      query: searchTerm,
      types: types,
      page: page,
      typeCounts: typeCounts, // Ajouter les comptages par type
    };
  } catch (error) {
    console.error('Erreur lors de la recherche Typesense:', error);

    throw createError({
      statusCode: error.status || 500,
      message: 'Erreur lors de la recherche',
      cause: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
});
