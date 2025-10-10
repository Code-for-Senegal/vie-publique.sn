import { defineEventHandler, createError } from "h3";
import { getCmsClient } from "../utils/cms-client";
import { readItems } from "@directus/sdk";

export default defineEventHandler(async (_event) => {
  try {
    const directus = getCmsClient();
    // Exécution parallèle des requêtes pour optimiser les performances
    const response = await directus.request(
      readItems("dash_council_ministers", {
        fields: [
          "id",
          "title",
          "type",
          "status",
          "description",
          "ministry",
          "date_created",
          "date_updated",
        ],
      }),
    );
    const result = {
      data: response || [],
    };
    return result;
  } catch (error) {
    console.error("Erreur lors de la récupération des produits:", error);

    throw createError({
      statusCode: error.status || 500,
      message: "Erreur lors de la récupération des produits",
      cause: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
});
