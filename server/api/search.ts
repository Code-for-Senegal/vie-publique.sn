import { defineEventHandler, createError, getQuery } from "h3";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const searchTerm = query.q as string;

    if (!searchTerm || searchTerm.trim() === "") {
      return {
        data: [],
        total: 0,
        query: searchTerm,
      };
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

    const searchUrl = `${typesenseUrl}/collections/news/documents/search`;

    const response = await $fetch(searchUrl, {
      method: "GET",
      headers: {
        "x-typesense-api-key": typesenseApiKey,
        "Content-Type": "application/json",
      },
      params: {
        q: searchTerm,
        query_by: "title,content_text",
        highlight_fields: "title,content_text",
        highlight_start_tag: "<mark>",
        highlight_end_tag: "</mark>",
        per_page: 20,
        page: query.page || 1,
      },
    });

    return {
      data: response.hits || [],
      total: response.found || 0,
      query: searchTerm,
      page: query.page || 1,
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
