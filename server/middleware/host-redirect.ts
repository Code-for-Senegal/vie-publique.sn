/**
 * Redirection 301 PERMANENTE de l'hôte apex vers l'hôte canonique www.
 *
 * Le réglage « Direction: Redirect to www. » de Coolify génère une redirection
 * Traefik TEMPORAIRE (302/307) que Bing/Google ne consolident pas : les deux
 * hôtes restent indexés (cf. docs/audits/audit-complet-2026-07.md — BING-1).
 * Ce middleware fait la redirection en 301 côté app. Pour qu'il reçoive les
 * requêtes apex, mettre la Direction Coolify sur « Allow www & non-www ».
 */
const APEX_HOST = 'vie-publique.sn';
const CANONICAL_ORIGIN = 'https://www.vie-publique.sn';

export default defineEventHandler((event) => {
  const host = getRequestHeader(event, 'host');
  if (host !== APEX_HOST) return;
  return sendRedirect(event, `${CANONICAL_ORIGIN}${event.path}`, 301);
});
