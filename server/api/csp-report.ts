import { writeFile, appendFile } from "node:fs/promises";
import { join } from "node:path";
import { defineEventHandler, readBody } from "h3";

// Fonction pour formater la date
const formatDate = (date: Date) => {
  return date.toISOString().replace("T", " ").replace("Z", "");
};

// Fonction pour créer le message de log
const createLogMessage = (violation: any) => {
  const timestamp = formatDate(new Date());
  return `[${timestamp}] CSP Violation:
    Blocked URI: ${violation["csp-report"]["blocked-uri"]}
    Violated Directive: ${violation["csp-report"]["violated-directive"]}
    Original Policy: ${violation["csp-report"]["original-policy"]}
    Document URI: ${violation["csp-report"]["document-uri"]}
    Referrer: ${violation["csp-report"]["referrer"] || "N/A"}
    User Agent: ${violation["csp-report"]["user-agent"] || "N/A"}
    ------------------------
`;
};

export default defineEventHandler(async (event) => {
  try {
    // Lire le corps de la requête
    const body = await readBody(event);

    // Vérifier si c'est un rapport de violation CSP
    if (body["csp-report"]) {
      const logMessage = createLogMessage(body);

      // Chemin du fichier de log
      const logPath = join(process.cwd(), "logs", "csp-violations.log");

      // Créer le dossier logs s'il n'existe pas
      try {
        await appendFile(logPath, logMessage, "utf-8");
      } catch (error: any) {
        if (error.code === "ENOENT") {
          // Si le dossier n'existe pas, créer le fichier
          await writeFile(logPath, logMessage, "utf-8");
        } else {
          throw error;
        }
      }

      // Envoyer une réponse 204 (No Content) pour indiquer que le rapport a été reçu
      return { status: "success" };
    }

    // Si ce n'est pas un rapport CSP valide, renvoyer une erreur 400
    return {
      status: "error",
      message: "Invalid CSP report format",
    };
  } catch (error) {
    console.error("Error processing CSP report:", error);

    // En cas d'erreur, renvoyer une erreur 500
    return {
      status: "error",
      message: "Internal server error",
    };
  }
});
