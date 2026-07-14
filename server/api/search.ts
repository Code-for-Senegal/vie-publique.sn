import { defineEventHandler, createError, getQuery } from 'h3';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    let searchTerm = query.q as string;
    const types = query.types as string;
    const categories = query.categories as string; // sous-types de documents (facette category)
    const year = parseInt(query.year as string) || null; // filtre par année de publication
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

    // Adapter les poids selon le type de recherche (title, summary, content_text, tags).
    // summary (~300 car., rédigé au CMS ou début du texte) est un signal intermédiaire :
    // un match y pèse plus que dans le corps (un JO de 200 pages « mentionne » tout)
    // mais moins que dans le titre.
    // Pour les recherches courtes (1-2 mots significatifs), prioriser le titre.
    // Pour les phrases/requêtes longues, augmenter le poids du contenu car les documents
    // les plus pertinents ont souvent la phrase dans leur contenu (ex: JO avec "code de la route")
    let queryWeights: string;
    if (isShortQuery && significantWords.length <= 2) {
      queryWeights = '100,40,20,5'; // Requêtes courtes : titre dominant
    } else if (isPhrasalSearch || significantWords.length >= 3) {
      queryWeights = '60,55,50,10'; // Phrases/expressions : contenu presque aussi important que titre
    } else {
      queryWeights = '80,45,30,5'; // Par défaut
    }

    // Les paramètres de scoring communs (query_by, text_match_type, prioritize_*)
    // viennent de TYPESENSE_QUERY_DEFAULTS (server/utils/typesense.ts) — partagés
    // avec la recherche de la liste documents.
    const searchParams: any = {
      q: searchTerm,
      query_by_weights: queryWeights, // Poids adaptés selon le type de recherche
      sort_by: '_text_match:desc,priority:desc,date_published:desc', // Tri par pertinence, puis priorité (documents > news), puis date
      highlight_fields: 'title,summary,content_text', // Highlight sur le texte brut
      highlight_start_tag: '<mark>',
      highlight_end_tag: '</mark>',
      highlight_affix_num_tokens: 5, // Contexte autour des mots trouvés
      per_page: limit,
      page: page,
      typo_tokens_threshold: isPhrasalSearch ? 3 : 2, // Plus de tolérance pour les phrases longues
      drop_tokens_threshold: isPhrasalSearch ? 1 : 2, // Plus strict pour les phrases (ne pas ignorer de mots)
      // Optimisation : ne récupérer que les champs nécessaires.
      // content_text est volontairement exclu (documents entiers = payload ×3) :
      // l'extrait affiché vient du snippet highlight retourné par Typesense.
      // url/summary/source_id : champs v2 (absents de l'index v1, ignorés par Typesense).
      include_fields:
        'id,source_id,title,type,category,date_published,cover_image,slug,url,summary',
      facet_by: 'type,category', // Facettes : compteurs par type + par sous-type (category)
      max_facet_values: 40, // ~29 sous-types de documents + libellés des autres types
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
    const filterClauses: string[] = [];
    if (types && types.trim() !== '') {
      const typeValues = types
        .split(',')
        .map((t) => TYPE_FILTER_MAP[t.trim()])
        .filter(Boolean);
      if (typeValues.length > 0) {
        filterClauses.push(`type:=[${typeValues.join(',')}]`);
      }
    }
    // Filtre par sous-type (libellés FR de la facette category, ex. "Journal Officiel,Loi").
    // Valeurs avec espaces/accents → backticks Typesense ; on retire backticks/virgules de
    // l'entrée (caractères de syntaxe filter_by) pour éviter toute injection de filtre.
    if (categories && categories.trim() !== '') {
      const categoryValues = categories
        .split(',')
        .map((c) => c.replace(/[`,]/g, '').trim())
        .filter(Boolean)
        .map((c) => `\`${c}\``);
      if (categoryValues.length > 0) {
        filterClauses.push(`category:=[${categoryValues.join(',')}]`);
      }
    }
    // Filtre par année de publication (date_published = epoch secondes, triable/facetable)
    if (year && year >= 1900 && year <= 2100) {
      const start = Date.UTC(year, 0, 1) / 1000;
      const end = Date.UTC(year + 1, 0, 1) / 1000;
      filterClauses.push(`date_published:>=${start} && date_published:<${end}`);
    }
    if (filterClauses.length > 0) {
      searchParams.filter_by = filterClauses.join(' && ');
    }

    const response: any = await searchTypesense(searchParams);

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

    // Extraire les comptages par type et par sous-type (category) des facettes
    const typeCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};
    if (response.facet_counts && response.facet_counts.length > 0) {
      const typeFacet = response.facet_counts.find((f: any) => f.field_name === 'type');
      if (typeFacet && typeFacet.counts) {
        typeFacet.counts.forEach((count: any) => {
          typeCounts[count.value] = count.count;
        });
      }
      const categoryFacet = response.facet_counts.find((f: any) => f.field_name === 'category');
      if (categoryFacet && categoryFacet.counts) {
        categoryFacet.counts.forEach((count: any) => {
          categoryCounts[count.value] = count.count;
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
      typeCounts: typeCounts, // Comptages par type (facette)
      categoryCounts: categoryCounts, // Comptages par sous-type (facette category)
    };
  } catch (error: any) {
    const statusCode = error?.statusCode || error?.status || error?.response?.status || 500;
    const typesenseMessage = error?.data?.message || error?.message || 'Erreur inconnue';
    reportServerError(error, 'api/search', {
      statusCode,
      message: typesenseMessage,
      details: error?.data || error?.response?._data,
      query: getQuery(event).q,
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
