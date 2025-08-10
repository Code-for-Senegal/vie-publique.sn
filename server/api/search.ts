import { defineEventHandler, createError, getQuery } from "h3";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    let searchTerm = query.q as string;
    const types = query.types as string;
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 20;

    // Permettre une recherche vide avec seulement des filtres
    if (!searchTerm || searchTerm.trim() === "") {
      if (!types || types.trim() === "") {
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
      searchTerm = "*";
    }

    const config = useRuntimeConfig();
    const typesenseApiKey = config.typesenseApiKey;
    const typesenseUrl = config.typesenseUrl;

    if (!typesenseApiKey) {
      throw createError({
        statusCode: 500,
        message: "Configuration Typesense manquante",
      });
    }

    const searchUrl = `${typesenseUrl}/collections/vpdata/documents/search`;
    
    // Construire les paramètres de recherche
    const searchParams: any = {
      q: searchTerm,
      query_by: "title,content_html",
      highlight_fields: "title,content_html",
      highlight_start_tag: "<mark>",
      highlight_end_tag: "</mark>",
      per_page: limit,
      page: page,
    };

    // Ajouter les filtres par type si spécifiés
    if (types && types.trim() !== "") {
      const typesList = types.split(',').map(t => t.trim()).filter(Boolean);
      if (typesList.length > 0) {
        // Construire le filtre pour Typesense
        // Format: type:=[document,actualite] ou category.slug:=[actualites,documents]
        const typeFilters = typesList.map(type => {
          if (type === 'document') {
            return 'type:=document';
          } else if (type === 'actualite') {
            return 'type:!=document'; // Tous sauf documents
          }
          return null;
        }).filter(Boolean);
        
        if (typeFilters.length > 0) {
          searchParams.filter_by = typeFilters.join(' || ');
        }
      }
    }

    const response = await $fetch(searchUrl, {
      method: "GET",
      headers: {
        "x-typesense-api-key": typesenseApiKey,
        "Content-Type": "application/json",
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
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, "")
          : "actualite");

      const categorySlug = article.category?.slug;
      const documentType = article.type || "news";
      let formattedUrl = "/actualites";

      // Handle different types
      if (documentType === "document") {
        formattedUrl = `/documents/${id}/${slug}`;
      } else {
        // Handle news articles
        if (categorySlug === "conseil-des-ministres") {
          formattedUrl = `/conseil-des-ministres/${id}/${slug}`;
        } else if (categorySlug === "assemblee-nationale") {
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

    return {
      data: formattedData,
      total: response.found || 0,
      totalIndexed: response.out_of || response.found || 0,
      query: searchTerm,
      types: types,
      page: page,
    };
  } catch (error) {
    console.error("Erreur lors de la recherche Typesense:", error);

    throw createError({
      statusCode: error.status || 500,
      message: "Erreur lors de la recherche",
      cause: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
});
