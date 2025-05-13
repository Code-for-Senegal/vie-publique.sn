import { defineEventHandler, getCookie, setCookie, createError } from "h3";
import { randomBytes } from "node:crypto";

// Liste des méthodes HTTP qui nécessitent une protection CSRF
const CSRF_METHODS = ["POST", "PUT", "DELETE", "PATCH"];

export default defineEventHandler(async (event) => {
  const method = event.method;

  // Vérifier si la méthode nécessite une protection CSRF
  if (!CSRF_METHODS.includes(method)) {
    return;
  }

  // Générer un nouveau token CSRF si nécessaire
  let csrfToken = getCookie(event, "csrf-token");
  if (!csrfToken) {
    csrfToken = randomBytes(32).toString("hex");
    setCookie(event, "csrf-token", csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });
  }

  // Vérifier le token CSRF pour les requêtes non-GET
  if (method !== "GET") {
    const requestToken = event.headers.get("x-csrf-token");

    if (!requestToken || requestToken !== csrfToken) {
      throw createError({
        statusCode: 403,
        message: "Invalid CSRF token",
      });
    }
  }
});
