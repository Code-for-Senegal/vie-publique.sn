import { writeFile, appendFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
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

      // En production, utiliser console.log au lieu d'écrire dans un fichier
      if (process.env.NODE_ENV === 'production') {
        console.log('CSP Violation:', JSON.stringify(body["csp-report"], null, 2));
      } else {
        // En développement, écrire dans un fichier
        const logPath = join(process.cwd(), "logs", "csp-violations.log");
        
        try {
          // Créer le dossier logs s'il n'existe pas
          await mkdir(dirname(logPath), { recursive: true });
          await appendFile(logPath, logMessage, "utf-8");
        } catch (error: any) {
          // Fallback vers console.log si l'écriture échoue
          console.log('CSP Violation (file write failed):', JSON.stringify(body["csp-report"], null, 2));
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
