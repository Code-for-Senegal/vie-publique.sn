# Décision — Tracking des consultations PDF (accès direct)

> **Statut : DÉCIDÉE — non implémentée.** Date : 2026-06-30.
> Auteur : équipe technique. Implémentation à planifier ultérieurement.

## Problème

Quand quelqu'un partage un **lien PDF direct** (`vie-publique.sn/docs/<id>/<slug>.pdf`),
le visiteur voit/télécharge le fichier **sans jamais charger une page HTML avec Google
Analytics**. Aucun script de tracking ne s'exécute → ces consultations sont **invisibles**
dans les stats actuelles (GA est 100 % côté client : `nuxt-gtag` + Firebase).

C'est un problème classique pour tout site hébergeant des PDF en accès direct.

## Ce que notre architecture a déjà (≠ analyse générique)

Contrairement à un site qui exposerait des liens CMS bruts, **tous nos PDF passent déjà
par un proxy serveur Nuxt** :

- `app/composables/useCmsFile.ts` → transforme tout fichier CMS en URL interne `/docs/{id}/{slug}.pdf`.
- `server/api/docs/[...path].ts` → **stream** le fichier depuis le CMS (`$fetch.raw`).
- Les liens partagés sont donc `vie-publique.sn/docs/...`, **jamais** `cms.vie-publique.sn/...`.

➡️ **L'« endpoint intermédiaire » (la solution la plus propre) existe déjà.**
Pas besoin de créer une route `/telecharger/xxx` ni de modifier les liens.
Le proxy `/docs/[...path]` ne fait actuellement **aucun logging**.

## Décision

**Approche 1 — tracking côté serveur via le proxy existant**, par envoi GA4
**Measurement Protocol** (`POST https://www.google-analytics.com/mp/collect`,
auth `measurement_id` + `api_secret`) depuis `server/api/docs/[...path].ts`.

Options écartées :

| Option | Pourquoi écartée |
|---|---|
| Logs nginx/CDN → GoAccess/Matomo (import logs) | Inférieur : on a déjà un point d'interception **applicatif** (on connaît l'ID doc, le slug, le referer). Parser de l'infra serait un recul. |
| Nouvelle route `/telecharger/xxx` | Inutile — `/docs/[...path]` **est** déjà cet endpoint. |
| Approche 2 — tout en viewer PDF.js, fichier brut masqué (URL signée) | Trop lourd / contre-productif : le viewer (`PdfViewerInline/Modal`) **fetch lui-même** `/docs/...pdf`, l'og:image SEO et le bouton « Ouvrir » l'utilisent aussi. Masquer l'URL casserait viewer + SEO pour un gain marginal. |

## Pièges à traiter à l'implémentation (le vrai travail est ici)

1. **Double comptage.** Ouvrir la *page* document déclenche un fetch PDF.js vers `/docs/...pdf`
   **en plus** du pageview GA client. → distinguer le **fetch du viewer interne** (à ignorer)
   du **vrai accès au lien partagé**. Discriminant possible : `Sec-Fetch-Dest`, `referer`,
   ou un param explicite `?dl=1` sur les boutons « Télécharger ».
2. **Cache.** La route renvoie `Cache-Control: public, max-age=86400` → navigateur + CDN
   servent les hits suivants sans toucher le serveur (sous-comptage). Choisir : baisser le
   cache, ou accepter « 1 vue par fenêtre de cache ».
3. **Bots/crawlers** (`facebookexternalhit`, `Googlebot`…) tapent la route → filtrer par
   User-Agent, sinon stats gonflées.
4. **Range requests.** PDF.js charge souvent par morceaux (HTTP 206) → ne compter qu'une
   fois par session/fichier, pas par requête.
5. **Fiabilité.** L'appel GA4 doit être **fire-and-forget** : ne jamais attendre la réponse
   Google avant de servir le PDF, ne jamais faire échouer le téléchargement si GA est down.

## Pré-requis implémentation

- 2 secrets GA4 : `NUXT_GA4_MEASUREMENT_ID` + `NUXT_GA4_API_SECRET` (Admin GA4 →
  Data Streams → Measurement Protocol API secrets).
- Point d'insertion : `server/api/docs/[...path].ts`, après `getRouterParam`, avant le proxy.
- Lie ce sujet à la question plus large « GA server-side » (le Measurement Protocol **est**
  du GA4 côté serveur — ce besoin est sa première justification concrète).

## Suite

Note à renvoyer au collègue. Implémentation à planifier (non commencée).
