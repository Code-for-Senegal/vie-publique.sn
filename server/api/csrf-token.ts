import { defineEventHandler, getCookie, setCookie } from "h3";
import { randomBytes } from "node:crypto";

export default defineEventHandler(async (event) => {
  // Récupérer le token existant ou en générer un nouveau
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

  return {
    token: csrfToken,
  };
});
