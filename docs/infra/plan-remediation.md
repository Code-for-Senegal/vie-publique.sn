# Plan de remédiation sécurité — Vie-Publique.sn

> **Checklist maître** fusionnant l'audit **applicatif** ([`../audit/audit-complet-2026-07.md`](../audit/audit-complet-2026-07.md), SEC-1..10)
> et l'audit **infra** ([`securite-infra-2026-07.md`](./securite-infra-2026-07.md), INFRA-1..13).
> Cadre : **défense en profondeur** + **séparation données/app** (principes du webinaire).
>
> **Créé le** : 5 juillet 2026. Cocher au fil de l'eau. Les « fenêtres » sont indicatives, à dater par l'équipe.
>
> **⚠️ Repo public** : IPs, URLs d'admin et secrets restent dans **Vaultwarden**, pas ici.

---

## 🟥 Vague 1 — Fermer les portes grandes ouvertes (fenêtre : semaine du 07/07)

> Effet immédiat, surtout de la config. C'est ce qui empêche une compromission « en un clic ».

- [ ] **INFRA-11** — Activer la **2FA Coolify** (Profile → Two-Factor) sur prod ET test. *(le plus urgent : sans ça, un seul mot de passe = tout le serveur)*
- [ ] **INFRA-10** — SSH : `PermitRootLogin no` + `PasswordAuthentication no` (garder une clé sudo de secours ; le terminal web Hostinger reste l'accès hors-bande). Puis **firewall** : n'ouvrir que 80/443, fermer 22 au public (ou IP allowlist), 9000/9001/5432/6379 et ports panels.
- [ ] **INFRA-1** — Retirer **Adminer** du `docker-compose` prod (le garder local/test à la demande). Admin DB ponctuelle via tunnel SSH.
- [ ] **INFRA-2** — Supprimer le mapping de ports **MinIO** `9000/9001` du compose (Directus y accède en interne). Vérifier que `directus-bucket` n'est pas en lecture anonyme.
- [ ] **INFRA-4** — Vérifier si **CyberPanel** est utilisé → si non, le **désactiver/désinstaller**. Mettre Coolify/Kuma/n8n/MinIO console derrière **IP allowlist** (middleware Traefik) ou VPN.
- [ ] **INFRA-3** — Forcer **HTTPS** sur Directus (`https://cms.vie-publique.sn`) + redirection 301 + HSTS.
- [ ] **INFRA-7** — Directus prod : `LOG_LEVEL=debug` → `info`.
- [ ] **SEC-1** — 🔴 **Webhook Bictorys** : implémenter la vérification **HMAC** avant tout traitement (`config.bictorysWebhookSecret`), rejeter 401 si invalide. `server/api/donate/webhook.post.ts`.

## 🟧 Vague 2 — Anti-abus applicatif + résilience (fenêtre : 2ᵉ quinzaine juillet)

- [ ] **SEC-4** — Vérifier **Turnstile côté serveur** (`siteverify`) sur les formulaires publics ; ajouter `checkRateLimit()` + `isValidEmail()` sur newsletter ; réponse générique (pas de 409 qui révèle l'inscription).
- [ ] **SEC-7** — `donate/init-payment` : rate limit + **bornes min/max** sur `amount` + validation email + corriger les URLs de redirection placeholder `https://client.co/...`.
- [ ] **SEC-3** — Activer la **CSRF nuxt-security** (`security: { csrf: true }`), exempter webhooks/callbacks, migrer les `$fetch` de formulaires vers `useCsrfFetch()`, supprimer les 3 morceaux CSRF maison.
- [ ] **SEC-5** — **DOMPurify** sur la sortie `marked` du ChatBot avant `v-html`. `app/components/ChatBot.vue`.
- [ ] **INFRA-13** — Inventorier les **tokens Directus write** (n8n & intégrations) dans Vaultwarden ; réduire chaque token à la **portée minimale** ; **protéger n8n** (2FA + IP allowlist) ; révoquer l'inutilisé.
- [ ] **INFRA-5** — **Sauvegardes** : `pg_dump` quotidien (cron/n8n) + rétention 7/30j + copie **offsite chiffrée** + **test de restore** documenté.
- [ ] **INFRA-11 (suite)** — Directus = SSO Google (pas de 2FA native) → **exiger la 2FA sur chaque compte Google** autorisé au CMS + sécuriser/désactiver le compte admin à mot de passe résiduel.

## 🟨 Vague 3 — Chantiers structurants, alignés webinaire (août → septembre)

- [ ] **INFRA-6** — Passer les domaines derrière **Cloudflare** (proxy : masque l'IP origine, WAF, DDoS, rate-limit edge sur `/admin` & formulaires). ⚠️ Ensuite **verrouiller le firewall origine sur les IPs Cloudflare** sinon contournable.
- [ ] **INFRA-9** — Migrer le stockage assets **MinIO → Cloudflare R2** (driver S3, changement d'`ENDPOINT`/clés + `mc mirror`/rclone des objets), puis retirer MinIO du compose. *(résout aussi INFRA-2, allège INFRA-5 — sépare les données de l'app)*
- [ ] **INFRA-8** — Isoler **archives.sn / kaddu.org** de la prod VP (VM séparée comme n8n) ou, a minima, `deploy.resources.limits` par conteneur. *(réduit le blast radius)*
- [ ] **SEC-6** — Durcir la **CSP** (viser les nonces, retirer `unsafe-inline`/`unsafe-eval`, restreindre `img-src`) ou documenter la dette.
- [ ] **SEC-10** — `npm audit fix` (non-force) ; supprimer `@ai-sdk/vue` ; suivre `@grpc/grpc-js` (firebase-admin).

## 🟩 Suivi continu (hygiène)

- [ ] **INFRA-12** — Formaliser une cadence de MAJ : patchs OS auto (`dnf-automatic`), revue mensuelle Directus/Coolify, veille CVE des images du compose. Noter la date de dernière MAJ par VPS.
- [ ] **INFRA-10 (suite)** — Installer **fail2ban** (SSH + endpoints auth).
- [ ] **Supervision** — Étendre Uptime Kuma ou déployer le plan Prometheus/Grafana ([`../monitoring/supervision-infra.md`](../monitoring/supervision-infra.md)) ; conserver les logs Traefik pour investigation.
- [ ] **SEC-8** — Proxies legacy `[...path].ts` : `encodeURIComponent`, rejeter `..`, whitelister extensions, streamer au lieu de bufferer.
- [x] **SEC-9** — Messages d'erreur génériques côté client (search Typesense, webhooks) — *fait 2026-07 via `reportServerError()`/Sentry*. Reste : `rate-limit.ts` : ne pas se fier au 1er `x-forwarded-for`.
- [ ] **Tokens** — Rotation périodique du token front read-only + des tokens write.

---

## Suivi de progression

| Vague | Items | Faits |
| --- | --- | --- |
| V1 — Portes ouvertes | 8 | 0 |
| V2 — Anti-abus + résilience | 7 | 0 |
| V3 — Structurants | 5 | 0 |
| Suivi continu | 6 | 0 |

> **Ce plan est la source unique de vérité pour le statut d'exécution** (priorisation + cases à cocher).
> Les docs source (`audit-complet-2026-07.md` pour les SEC, `securite-infra-2026-07.md` pour les INFRA)
> gardent le **détail / rationale** de chaque finding — ne pas y dédoubler le suivi (risque de divergence).

## Périmètre / sources revues (05/07/2026)

Toutes les docs `docs/` + l'historique git ont été croisés. Aucun autre audit sécurité que
[`../audit/audit-complet-2026-07.md`](../audit/audit-complet-2026-07.md) (SEC-1..10) n'existe.
Le point sécu de [`../audit/architecture-api-directus.md`](../audit/architecture-api-directus.md)
(« CMS_API_KEY exposée côté client ») est **vérifié résolu** : clé/URL CMS en config serveur, absentes
du bloc `runtimeConfig.public` (`nuxt.config.ts`). Ce doc de migration est périmé sur ce point.
