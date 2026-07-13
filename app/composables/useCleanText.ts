/**
 * Nettoyage de texte CMS pour les meta / JSON-LD.
 *
 * L'implémentation vit dans `shared/clean-text.ts` (source de vérité partagée
 * avec le serveur — flux RSS notamment) ; ce fichier ne fait que ré-exporter
 * pour conserver l'auto-import côté app (`cleanCmsText`, `truncateText`).
 */
import { cleanCmsText, truncateText } from '#shared/clean-text';

export { cleanCmsText, truncateText };

export const useCleanText = () => ({ cleanCmsText, truncateText });
