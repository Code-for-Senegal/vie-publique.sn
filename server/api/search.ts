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
    const words = searchTerm.split(' ').filter((w) => w.length > 0);
    const wordCount = words.length;
    const hasQuotes = searchTerm.includes('"');
    const isShortQuery = wordCount <= 2;
    // Filtrer les mots vides français pour mieux évaluer la vraie complexité de la requête
    const stopWords = new Set([
      'de',
      'du',
      'la',
      'le',
      'les',
      'des',
      'un',
      'une',
      'et',
      'en',
      'au',
      'aux',
      'à',
      'l',
    ]);
    const significantWords = words.filter((w) => !stopWords.has(w.toLowerCase()));
    const isPhrasalSearch = hasQuotes || wordCount > 2;

    // Adapter les poids selon le type de recherche
    // Pour les recherches courtes (1-2 mots significatifs), prioriser le titre
    // Pour les phrases/requêtes longues, augmenter le poids du contenu car les documents
    // les plus pertinents ont souvent la phrase dans leur contenu (ex: JO avec "code de la route")
    let queryWeights: string;
    if (isShortQuery && significantWords.length <= 2) {
      queryWeights = '100,20,5'; // Requêtes courtes : titre dominant
    } else if (isPhrasalSearch || significantWords.length >= 3) {
      queryWeights = '60,50,10'; // Phrases/expressions : contenu presque aussi important que titre
    } else {
      queryWeights = '80,30,5'; // Par défaut
    }

    const searchParams: any = {
      q: searchTerm,
      query_by: 'title,content_text,tags',
      query_by_weights: queryWeights, // Poids adaptés selon le type de recherche
      sort_by: '_text_match:desc,priority:desc,date_published:desc', // Tri par pertinence, puis priorité (documents > news), puis date
      // max_score (défaut) : utilise le MEILLEUR score réel parmi tous les champs
      // Contrairement à max_weight qui privilégie le champ avec le poids le plus élevé
      // même si le match y est faible (ex: "la" dans un titre → poids titre élevé)
      text_match_type: 'max_score',
      highlight_fields: 'title,content_text', // Highlight sur le texte brut
      highlight_start_tag: '<mark>',
      highlight_end_tag: '</mark>',
      highlight_affix_num_tokens: 5, // Contexte autour des mots trouvés
      per_page: limit,
      page: page,
      prioritize_exact_match: true, // Prioriser les correspondances exactes
      prioritize_token_position: false, // Désactivé : les stop words ("la", "de") matchent tôt dans les titres et biaisent le scoring
      prioritize_num_matching_fields: false, // Désactivé : les stop words matchent dans tous les champs et gonflent artificiellement fields_matched
      typo_tokens_threshold: isPhrasalSearch ? 3 : 2, // Plus de tolérance pour les phrases longues
      drop_tokens_threshold: isPhrasalSearch ? 1 : 2, // Plus strict pour les phrases (ne pas ignorer de mots)
      // Optimisation : ne récupérer que les champs nécessaires.
      // content_text est volontairement exclu (documents entiers = payload ×3) :
      // l'extrait affiché vient du snippet highlight retourné par Typesense.
      // url/summary/source_id : champs v2 (absents de l'index v1, ignorés par Typesense).
      include_fields:
        'id,source_id,title,type,category,date_published,cover_image,slug,url,summary',
      facet_by: 'type', // Activer les facettes pour compter par type
      max_facet_values: 10,
    };

    // Ajouter les filtres par type si spécifiés.
    // Whitelist UI → valeur `type` dans l'index (v2 multi-types ; sur l'index v1 seuls
    // document/news existent, les autres filtres donnent simplement 0 résultat).
    const TYPE_FILTER_MAP: Record<string, string> = {
      document: 'document',
      actualite: 'news', // alias UI historique
      news: 'news',
      dossier: 'dossier',
      depute: 'depute',
      question: 'question',
      vote: 'vote',
      personnalite: 'personnalite',
      institution: 'institution',
      podcast: 'podcast',
    };
    if (types && types.trim() !== '') {
      const typeValues = types
        .split(',')
        .map((t) => TYPE_FILTER_MAP[t.trim()])
        .filter(Boolean);
      if (typeValues.length > 0) {
        searchParams.filter_by = `type:=[${typeValues.join(',')}]`;
      }
    }

    const response: any = await $fetch(searchUrl, {
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

      // Index v2 : l'URL publique est précalculée à l'indexation (scripts/search-reindex.mjs)
      if (article.url) {
        return { ...hit, formattedUrl: article.url };
      }

      // Index v1 (legacy) : reconstruction de l'URL à partir du type/catégorie
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
      if (documentType === 'document' || documentType === 'documents') {
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
  } catch (error: any) {
    const statusCode = error?.statusCode || error?.status || error?.response?.status || 500;
    const typesenseMessage = error?.data?.message || error?.message || 'Erreur inconnue';
    console.error('Erreur lors de la recherche Typesense:', {
      statusCode,
      message: typesenseMessage,
      details: error?.data || error?.response?._data,
    });

    // SEC-9 : ne pas exposer le détail Typesense au client (il reste dans les logs serveur)
    throw createError({
      statusCode,
      message:
        process.env.NODE_ENV === 'development'
          ? `Erreur lors de la recherche: ${typesenseMessage}`
          : 'Erreur lors de la recherche',
      cause: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
});
