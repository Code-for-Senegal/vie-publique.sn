# Sentry — Monitoring d'erreurs

> **Statut** : implémenté (2026-07) — actif uniquement si `NUXT_PUBLIC_SENTRY_DSN` est défini.
> **Périmètre** : capture d'**erreurs uniquement** (client + serveur). Pas de tracing de
> performance, pas de session replay — décision assumée (poids client, quota gratuit), à
> réévaluer si besoin.

## 1. Pourquoi Sentry sur ce projet

| Douleur constatée                                                                                                                                                                                        | Ce que Sentry apporte                                                                                             |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Erreurs client invisibles en SSR** : bugs TDZ / hydratation où le SSR renvoie 200 et `curl` ne voit rien, mais la page plante dans le navigateur (classe de bugs documentée dans CLAUDE.md, règle SEO) | Capture automatique côté navigateur avec URL + stack trace, sans attendre qu'un utilisateur signale               |
| **Dégradations silencieuses côté serveur** : les handlers CMS « dégradent proprement » (donnée omise, jamais de 500) → une panne CMS ou un token Directus cassé peut passer inaperçu des jours           | `reportServerError()` dans les blocs catch : la dégradation reste propre pour l'utilisateur, l'erreur est visible |
| **SEC-9 (audit 2026-07)** : divulgation de messages d'erreur au client (`search.ts`, `donate/webhook`)                                                                                                   | Le fix devient : message générique au client + détails dans Sentry via `reportServerError()`                      |
| **Webhook de paiement** (`donate/webhook.post.ts`) : une erreur silencieuse y coûte de la confiance                                                                                                      | Alerte e-mail sur toute exception                                                                                 |

Alternative étudiée : **GlitchTip** (compatible SDK Sentry, open source, auto-hébergeable sur le
Coolify existant). Le SDK étant le même, migrer = changer le DSN. On démarre sur Sentry cloud
(tier gratuit ~5 000 événements/mois) ; bascule GlitchTip possible sans toucher au code si le
quota ou la souveraineté des données devient un sujet.

**Périmètre du monitoring global** (qui surveille quoi) :

| Outil                                                               | Couvre                                                                 |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **Sentry** (ce doc)                                                 | Erreurs applicatives : JS client (hydratation, TDZ…), exceptions Nitro |
| **Uptime Kuma** — <https://kuma.vpsn.cloud> (VM séparée de la prod) | Disponibilité : front, CMS Directus, Typesense, outils internes        |
| **GA4 / Clarity**                                                   | Analytics d'audience et comportement (pas du monitoring technique)     |

## 2. Architecture de l'intégration

- **Module** : `@sentry/nuxt` (v10.x), déclaré dans `nuxt.config.ts` → `modules: ['@sentry/nuxt/module']`.
- **[sentry.client.config.ts](../../sentry.client.config.ts)** (racine) : init navigateur.
  Lit le DSN via `useRuntimeConfig().public.sentry.dsn` → **configurable au runtime** (Coolify),
  pas besoin de rebuild pour activer/désactiver.
- **[sentry.server.config.ts](../../sentry.server.config.ts)** (racine) : init Nitro.
  ⚠️ Lit `process.env.NUXT_PUBLIC_SENTRY_DSN` directement (`useRuntimeConfig()` n'est pas
  disponible à ce stade du boot — c'est documenté par Sentry, ne pas « corriger »).
- **Injection serveur** : option `autoInjectServerSentry: 'top-level-import'` dans
  `nuxt.config.ts` → l'init est injecté en tête du bundle Nitro au build. **Aucun changement**
  de la commande de démarrage (`node .output/server/index.mjs`) ni du Dockerfile.
  (L'alternative officielle `node --import ./.output/server/sentry.server.config.mjs …` donnerait
  un tracing plus complet, inutile ici puisqu'on ne fait pas de tracing.)
- **Source maps** : upload **désactivé** (`sourceMapsUploadOptions.enabled: false`).
  Les stack traces prod sont donc minifiées côté client. Pour les lisibiliser un jour :
  créer un auth token Sentry (scope `project:releases`), le passer en `SENTRY_AUTH_TOKEN` au
  build, et passer `enabled: true` + `org`/`project` dans `sourceMapsUploadOptions`.
- **CSP** : `connect-src` autorise `https://*.ingest.sentry.io`, `https://*.ingest.us.sentry.io`
  et `https://*.ingest.de.sentry.io` (nuxt-security, prod uniquement). Si les événements
  n'arrivent pas en prod, vérifier d'abord la console navigateur pour un blocage CSP.
- **Helper serveur** : [server/utils/report-error.ts](../../server/utils/report-error.ts)
  (`reportServerError`) — voir §4.

## 3. Activation (à faire une fois)

1. Créer un projet **Nuxt** sur [sentry.io](https://sentry.io) (org de l'association).
2. Copier le DSN (Settings → SDK Setup → Client Keys) et le définir dans l'environnement
   de prod (Coolify) :

   ```bash
   NUXT_PUBLIC_SENTRY_DSN=https://<key>@o<orgId>.ingest.<region>.sentry.io/<projectId>
   ```

3. Redéployer. Sans cette variable, **Sentry est totalement inactif** (les `Sentry.init` ne sont
   pas appelés) — le code peut donc vivre sur toutes les branches sans effet de bord.
4. Vérifier : provoquer une erreur test (ex. dans la console navigateur d'une page prod,
   `throw new Error('sentry-test-client')`) et confirmer sa remontée dans le dashboard.
5. Configurer les **alertes** Sentry (e-mail sur nouvelle issue, seuil de fréquence) — par défaut
   Sentry alerte sur chaque nouvelle issue, c'est le bon réglage pour notre volume.

> Le DSN n'est **pas un secret** au sens strict (il est visible dans le bundle client), mais ne
> pas le committer : il reste une config d'environnement (`.env` / Coolify).

## 4. Conventions d'usage

### Côté serveur : `reportServerError()` dans les catch

Le pattern « dégrader proprement » du projet (CLAUDE.md) reste inchangé — on lui ajoute juste la
visibilité :

```typescript
try {
  const data = await cmsClient.request(/* … */);
} catch (error) {
  // La dégradation reste propre (donnée omise / fallback), MAIS l'erreur est signalée
  reportServerError(error, 'api/documents/related', { documentId: id });
  return []; // fallback
}
```

- `scope` : chemin court et stable de l'endroit (`'api/search'`, `'utils/rss'`) — devient un tag
  filtrable dans Sentry.
- `context` : données de diagnostic (id, slug, params). **Jamais de secrets** (tokens, clés).
- Auto-importé (utilitaire `server/utils/`), fonctionne DSN absent (console seule) — donc
  utilisable partout sans précaution.
- **SEC-9** : dans les handlers qui renvoyaient `error.message` au client, remplacer par
  `reportServerError(error, scope)` + message générique dans la réponse.

### Côté client : rien à faire

Les erreurs non catchées (Vue, unhandled rejections) remontent automatiquement. Sont **exclues**
volontairement (`ignoreErrors` / `denyUrls` dans `sentry.client.config.ts`) :

- les erreurs de chargement de chunks post-déploiement (déjà auto-gérées par reload —
  `app/plugins/chunk-error-handler.client.ts`) ;
- le bruit réseau pur (`Failed to fetch`…) : connectivité mobile instable, pas un bug ;
- les erreurs venant des scripts tiers (GTM, Clarity, Twitter, Facebook).

Pour capturer manuellement un cas métier : `import * as Sentry from '@sentry/nuxt'` puis
`Sentry.captureException(error)`.

## 5. Garde-fous / pièges

- **Ne pas activer replay ni tracing sans décision** : `replayIntegration` ajoute ~50 ko au
  bundle et brûle le quota ; `tracesSampleRate > 0` multiplie les événements. Le périmètre actuel
  (erreurs seules) est un choix, pas un oubli.
- **Dev local** : le monitoring serveur ne fonctionne pas en `npm run dev` (limite documentée du
  module). Tester côté serveur = build + start, ou vérifier en prod.
- **Quota gratuit** : ~5 000 événements/mois. Si une erreur en boucle le sature, Sentry
  échantillonne — penser à résoudre ou ignorer l'issue dans le dashboard rapidement.
- **Vitest** : les configs Sentry ne sont pas chargées par les tests (fichiers conventionnels du
  module Nuxt uniquement) — rien à mocker.

## 6. Historique

- 2026-07 : intégration initiale (erreurs client + serveur, upload source maps désactivé).
  Remplace l'ébauche `docs/tmp/monitoring.md` (supprimée) : la piste Firebase App Check /
  Firebase Performance n'a pas été retenue — redondant avec GA4/Clarity côté analytics,
  et pas de monitoring d'erreurs SSR.
