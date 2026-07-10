# Stack Analytics — Vie Publique Sénégal

> Référence technique de tous les outils de mesure actifs sur le site.
> Mise à jour : 2026-07-10.

---

## Vue d'ensemble

| Outil | Rôle | Variable env | Statut |
|---|---|---|---|
| Google Analytics 4 | Trafic, pages vues, conversions | `GTAG_ID` | ✅ Actif |
| Microsoft Clarity | Sessions enregistrées, heatmaps | `CLARITY_PROJECT_ID` | ✅ Actif |
| Facebook Pixel | Audiences pub Facebook/Instagram | `FACEBOOK_PIXEL_ID` | ✅ Actif |
| Firebase Analytics | Suivi push notifications | `NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | ✅ Actif |
| GA4 Measurement Protocol | Tracking PDF côté serveur | `NUXT_GA4_API_SECRET` | ⏳ Décidé, non implémenté |
| @nuxtjs/web-vitals (RUM) | Web Vitals en production | — | ❌ Désactivé (incompatible Nuxt 4) |

---

## Google Analytics 4

**Module** : `nuxt-gtag` — configuré dans `nuxt.config.ts` section `gtag`.

```env
GTAG_ID=G-XXXXXXXXXX
```

- Chargé uniquement si `GTAG_ID` est défini (désactivé en local par défaut).
- Collecte automatiquement : pages vues, scroll, clics sortants, téléchargements.
- **Événements personnalisés** : voir `app/composables/useAnalytics.ts` (quiz).

### Événements custom actuels

| Événement | Où | Paramètres |
|---|---|---|
| `start_quiz` | Page quiz | — |
| `finish_quiz` | Page quiz | — |

### Intégration Clarity → GA4

Clarity est connecté au property GA4 `vie-publique.sn`. Les sessions Clarity sont
accessibles depuis les rapports GA4 via le lien de session dans les dimensions Clarity.

---

## Microsoft Clarity

**Project ID** : `vom4k1024j`  
**Dashboard** : `clarity.microsoft.com/projects/view/vom4k1024j`

```env
CLARITY_PROJECT_ID=vom4k1024j
```

- Script injecté en inline dans `<head>` via `nuxt.config.ts` (`app.head.script`).
- Chargé uniquement si `CLARITY_PROJECT_ID` est défini.
- **CSP** : `script-src` et `connect-src` ouverts vers `clarity.ms`.

### Ce que Clarity capture

- **Enregistrements de sessions** : vidéo anonymisée de chaque visite
- **Heatmaps** : clics, scroll, zones chaudes par page
- **Rage clicks** : clics répétés (frustration utilisateur)
- **Dead clicks** : clics sur éléments non-interactifs
- **Copilot IA** : résumés automatiques des comportements détectés

### Paramètres recommandés à configurer

- **Masques** (Clarity → Paramètres → Masque en cours) : vérifier que les champs
  sensibles (formulaires de don, contact) sont bien masqués par défaut.
- **Blocage d'IP** : bloquer les IPs de l'équipe pour ne pas polluer les sessions.

---

## Facebook Pixel

```env
FACEBOOK_PIXEL_ID=XXXXXXXXXXXXXXX
```

- Chargé via `runtimeConfig.public.fbPixelId`.
- Utilisé pour les audiences de retargeting Facebook/Instagram.

---

## Firebase Analytics

Intégré via le SDK Firebase client (push notifications).  
Le `NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID` lie Firebase au property GA4.

---

## Tracking PDF (côté serveur) — non implémenté

Les PDF servis par `/docs/[...path]` ne déclenchent pas de pageview GA (pas de HTML chargé).  
**Décision prise** : implémenter via GA4 Measurement Protocol depuis le proxy serveur.

→ Voir `docs/analytics/tracking-pdf-decision.md` pour le détail technique et les pièges.

**Pré-requis implémentation** :
```env
NUXT_GA4_MEASUREMENT_ID=G-XXXXXXXXXX  # même que GTAG_ID
NUXT_GA4_API_SECRET=                   # Admin GA4 → Data Streams → Measurement Protocol API secrets
```

---

## Web Vitals / RUM

`@nuxtjs/web-vitals` est temporairement **désactivé** (incompatible Nuxt 4).  
Pas de mesure Core Web Vitals en production côté RUM.  
Suivi actuel : Google Search Console (données terrain CrUX, 28 jours de délai).

---

## Outils de vérification externe

| Outil | Usage | Accès |
|---|---|---|
| Google Search Console | Indexation, impressions, CTR | search.google.com/search-console |
| Bing Webmaster Tools | Indexation Bing, Clarity intégré | bing.com/webmasters |
| PageSpeed Insights | CWV à la demande | pagespeed.web.dev |
