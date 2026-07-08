# Architecture API Directus — migration terminée ✅ (archive)

> **Ce document (guide de migration, oct. 2025) est obsolète et a été vidé de son contenu périmé.**
> La migration qu'il décrivait est **terminée** : 100 % des accès CMS passent désormais par des
> server routes Nitro cachées, credentials côté serveur uniquement.
>
> 👉 **Référence vivante de l'architecture d'accès aux données** :
> [`../guidelines/guideline-api.md`](../guidelines/guideline-api.md) (pattern 3 couches, SSR,
> cache, ajout d'une nouvelle collection).

## Règles de sécurité appliquées (résumé)

Ces règles sont **en vigueur** dans le code — les garder à l'esprit pour toute nouvelle feature :

1. **Credentials CMS côté serveur uniquement.** `CMS_API_URL` / `CMS_API_KEY` sont dans
   `runtimeConfig` (privé), **jamais** dans `runtimeConfig.public` → jamais envoyés au navigateur.
   *(Vérifié : `nuxt.config.ts` — clés hors du bloc `public:`.)*
2. **Aucun appel Directus direct depuis le client.** Tout passe par `server/api/*`
   (SDK Directus + `staticToken`) ; jamais de `$fetch` client avec un header `Authorization: Bearer`.
3. **Token CMS = rôle read-only** limité aux collections publiques (`web-vie-publique-access-policies`).
   Les tokens à droits d'écriture (n8n, intégrations) sont distincts et à portée minimale.

> Détail sécurité applicative : [`audit-complet-2026-07.md`](./audit-complet-2026-07.md) (SEC-*).
> Sécurité infra + plan de remédiation : [`../infra/`](../infra/).
