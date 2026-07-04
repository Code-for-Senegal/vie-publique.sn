# Analyse de la Structure des URLs - Vie Publique Sénégal

**Date de génération** : 2025-12-12
**Version** : 1.0.0

---

## 📊 Vue d'ensemble

Ce document recense **toutes les URLs** du projet, leur type, leur fonction et leur optimisation SEO.

### Statistiques

- **Pages Nuxt** : ~107 pages (+7 nouvelles pages en décembre 2024)
- **Routes API** : ~86 endpoints (+1 endpoint gouvernement)
- **Routes Proxy** : 2 (`/cms`, `/docs`)
- **Redirections** : 13 redirects configurés (+3 nouveaux)
- **Nouvelles fonctionnalités** : Génération automatique de slug, page gouvernement, migration Nuxt Content → Vue

---

## 🌐 1. PAGES PUBLIQUES (Pages Nuxt)

### 1.1 Page d'accueil

| URL | Type | SEO | Description |
|-----|------|-----|-------------|
| `/` | Statique | ⭐⭐⭐ | Page d'accueil |

---

### 1.2 Institutions & Gouvernance

#### Assemblée Nationale

| URL | Type | SEO | Description |
|-----|------|-----|-------------|
| `/assemblee-nationale` | Statique | ⭐⭐⭐ | Hub Assemblée Nationale |
| `/assemblee-nationale/deputes` | Annuaire | ⭐⭐⭐ | Liste des députés |
| `/assemblee-nationale/deputes/[id]/[name]` | Détail | ⭐⭐⭐ | Profil député (avec slug SEO) |
| `/assemblee-nationale/groupes` | Annuaire | ⭐⭐⭐ | Groupes parlementaires |
| `/assemblee-nationale/groupes/[id]/[name]` | Détail | ⭐⭐⭐ | Détail groupe (avec slug SEO) |
| `/assemblee-nationale/commissions` | Annuaire | ⭐⭐⭐ | Commissions parlementaires |
| `/assemblee-nationale/commissions/[id]` | Détail | ⭐⭐ | Détail commission (sans slug) |
| `/assemblee-nationale/votes` | Annuaire | ⭐⭐⭐ | Votes parlementaires |
| `/assemblee-nationale/votes/[id]` | Détail | ⭐⭐ | Détail vote (sans slug) |
| `/assemblee-nationale/questions` | Annuaire | ⭐⭐⭐ | Questions parlementaires |
| `/assemblee-nationale/questions/[id]` | Détail | ⭐⭐ | Détail question (sans slug) |
| `/assemblee-nationale/bureau` | Statique | ⭐⭐⭐ | Bureau de l'Assemblée |
| `/assemblee-nationale/actualites` | Liste | ⭐⭐⭐ | Actualités AN |
| `/assemblee-nationale/actualites/[id]/[slug]` | Détail | ⭐⭐⭐ | Actualité AN (avec slug SEO) |

#### État & Administration

| URL | Type | SEO | Description |
|-----|------|-----|-------------|
| `/etat-senegal` | Hub | ⭐⭐⭐ | Hub État du Sénégal |
| `/etat-senegal/organisation` | Visualisation | ⭐⭐⭐ | Organigramme de l'État |
| `/etat-senegal/annuaire` | Annuaire | ⭐⭐⭐ | Annuaire des entités |
| `/etat-senegal/annuaire/[slug]` | Détail | ⭐⭐⭐ | Détail entité (avec slug SEO) |

#### Conseil des Ministres

| URL | Type | SEO | Description |
|-----|------|-----|-------------|
| `/conseil-des-ministres` | Liste | ⭐⭐⭐ | Liste des conseils |
| `/conseil-des-ministres/[id]/[slug]` | Détail | ⭐⭐⭐ | Détail conseil (avec slug SEO) |

---

### 1.3 Budget & Finances

| URL | Type | SEO | Description |
|-----|------|-----|-------------|
| `/budget` | Hub | ⭐⭐ | ❌ Générique, peu SEO |
| `/budget/ministeres` | Dashboard | ⭐⭐⭐ | Budgets des ministères |
| `/budget/institutions` | Dashboard | ⭐⭐⭐ | Budgets des institutions |
| `/budget/glossaire` | Statique | ⭐⭐⭐ | Glossaire budgétaire |
| `/budget-senegal` | Dashboard | ⭐⭐⭐ | Budget national du Sénégal |
| `/budget-senegal/[slug]` | Détail | ⭐⭐⭐ | Budget par année/entité |

**⚠️ Problème** : Doublon `/budget` vs `/budget-senegal`

---

### 1.4 Élections

| URL | Type | SEO | Description |
|-----|------|-----|-------------|
| `/elections` | Hub | ⭐⭐ | ❌ Générique |
| `/elections/legislatives` | Dashboard | ⭐⭐⭐ | Élections législatives |
| `/elections/legislatives/[id]` | Détail | ⭐⭐ | Détail coalition (sans slug) |
| `/elections/legislatives/resultats` | Dashboard | ⭐⭐⭐ | Résultats électoraux |
| `/elections/legislatives/resultats/global` | Dashboard | ⭐⭐⭐ | Résultats globaux |
| `/elections/legislatives/resultats/carte` | Carte | ⭐⭐⭐ | Carte électorale |
| `/elections/legislatives/resultats/tendances` | Dashboard | ⭐⭐⭐ | Tendances |
| `/elections/legislatives/resultats/classement` | Classement | ⭐⭐⭐ | Classement coalitions |
| `/elections/legislatives/resultats/deputes` | Liste | ⭐⭐⭐ | Députés élus |
| `/elections/legislatives/resultats/proces-verbal` | Visualisation | ⭐⭐⭐ | PV officiels |
| `/elections/legislatives/carte-electorale` | Carte | ⭐⭐⭐ | Carte interactive |
| `/elections/legislatives/carte-electorale/nationale/[department]` | Détail | ⭐⭐⭐ | Résultats par département |
| `/elections/legislatives/carte-electorale/diaspora/[country]` | Détail | ⭐⭐⭐ | Résultats diaspora |
| `/elections/legislatives/carte-electorale/bureaux-temoins` | Dashboard | ⭐⭐⭐ | Bureaux témoins |
| `/elections/legislatives/taux-participation` | Dashboard | ⭐⭐⭐ | Taux de participation |
| `/elections/legislatives/statistiques` | Dashboard | ⭐⭐⭐ | Statistiques électorales |
| `/elections/legislatives/guide-electoral` | Statique | ⭐⭐⭐ | Guide électoral |

---

### 1.5 Documents & Publications

| URL | Type | SEO | Description |
|-----|------|-----|-------------|
| `/documents` | Hub | ⭐⭐ | ❌ Générique |
| `/documents/public` | Annuaire | ⭐⭐⭐ | Documents publics |
| `/documents/[id]/[slug]` | Détail | ⭐⭐⭐ | Document (avec slug SEO) |
| `/documents/budget` | Annuaire | ⭐⭐⭐ | Documents budgétaires |
| `/documents/codes` | Annuaire | ⭐⭐⭐ | Codes juridiques |
| `/documents/journal-officiel` | Annuaire | ⭐⭐⭐ | Journaux officiels |
| `/documents/rapports-audit` | Annuaire | ⭐⭐⭐ | Rapports d'audit |
| `/documents/strategies` | Annuaire | ⭐⭐⭐ | Documents stratégiques |
| `/journal-officiel-senegal` | Liste | ⭐⭐⭐ | Liste des JO |
| `/journal-officiel-senegal/[slug]` | Détail | ⭐⭐⭐ | JO par date (avec slug SEO) |

---

### 1.6 Actualités & Publications

| URL | Type | SEO | Description |
|-----|------|-----|-------------|
| `/actualites` | Liste | ⭐⭐⭐ | Actualités générales |
| `/actualites/[id]/[slug]` | Détail | ⭐⭐⭐ | Article (avec slug SEO) |
| `/publications` | Hub | ⭐⭐ | ❌ Générique |
| `/publications/actualites` | Liste | ⭐⭐⭐ | Publications |
| `/publications/enquetes` | Annuaire | ⭐⭐⭐ | Enquêtes |
| `/publications/institutions` | Annuaire | ⭐⭐⭐ | Publications institutionnelles |
| `/publications/recrutement` | Annuaire | ⭐⭐⭐ | Offres de recrutement |
| `/publications/[...slug]` | Catch-all | ⭐⭐ | Publications variées |

---

### 1.7 Annuaires & Médias

| URL | Type | SEO | Description |
|-----|------|-----|-------------|
| `/annuaires` | Hub | ⭐⭐⭐ | Hub des annuaires |
| `/medias` | Annuaire | ⭐⭐⭐ | Médias reconnus |
| `/medias/[id]/[slug]` | Détail | ⭐⭐⭐ | Détail média (avec slug SEO) |
| `/medias/aide-presse` | Statique | ⭐⭐⭐ | Aide à la presse |
| `/annuaire-sites-publics-senegal` | Annuaire | ⭐⭐⭐ | Sites publics |

---

### 1.8 Nominations & Personnalités

| URL | Type | SEO | Description |
|-----|------|-----|-------------|
| `/gouvernement-senegal` | Annuaire | ⭐⭐⭐⭐⭐ | **NOUVEAU** - Gouvernement actuel (PM, Ministres, Secrétaires) |
| `/nomination-senegal` | Liste | ⭐⭐⭐ | Toutes les nominations officielles |
| `/personnalites/[id]/[slug]` | Détail | ⭐⭐⭐⭐⭐ | **NOUVEAU** - Page canonique pour tous les portraits (ID+slug) |
| `/portraits/[slug]` | Détail | ⭐⭐ | ⚠️ DEPRECATED - Redirigé vers `/personnalites` |
| `/individuals-cited` | Liste | ⭐⭐ | ❌ En anglais |
| `/individuals-cited/[slug]` | Détail | ⭐⭐ | ❌ En anglais |

**✅ Améliorations** :
- Nouvelle page `/gouvernement-senegal` SEO-optimisée avec Schema.org GovernmentOrganization
- Structure `/personnalites/[id]/[slug]` avec ID pour performance, slug pour SEO
- `/personnalites` devient la page canonique pour TOUS les portraits
- Génération automatique de slug depuis le nom si absent dans Directus
- Affichage bio HTML avec `v-html` et classes prose
- Smart back button avec paramètre `?ref=gouvernement`

**⚠️ Problème** : Incohérence linguistique FR/EN sur `individuals-cited`

---

### 1.9 Justice & Scandales

| URL | Type | SEO | Description |
|-----|------|-----|-------------|
| `/justice` | Hub | ⭐⭐⭐ | Hub Justice |
| `/justice/magistrature` | Annuaire | ⭐⭐⭐ | Magistrature |

**⚠️ Problème** : Incohérence linguistique FR/EN

---

### 1.10 Baromètre Politique

| URL | Type | SEO | Description |
|-----|------|-----|-------------|
| `/barometre-politique` | Hub | ⭐⭐⭐ | Baromètre politique |
| `/barometre-politique/diomaye-faye` | Dashboard | ⭐⭐⭐ | Promesses Diomaye Faye |
| `/barometre-politique/diomaye-faye/promesse/[label]` | Détail | ⭐⭐⭐ | Détail promesse |

---

### 1.11 Rapports

| URL | Type | SEO | Description |
|-----|------|-----|-------------|
| `/rapport-senegal` | Liste | ⭐⭐⭐ | Rapports officiels |
| `/rapport-senegal/[slug]` | Détail | ⭐⭐⭐ | Rapport (avec slug SEO) |

---

### 1.12 Utilitaires & Pages système

| URL | Type | SEO | Description |
|-----|------|-----|-------------|
| `/recherche` | Moteur | ⭐⭐⭐ | Recherche globale |
| `/contact` | Formulaire | ⭐⭐⭐ | Contact |
| `/newsletter` | Formulaire | ⭐⭐⭐ | Newsletter |
| `/quiz` | Interactif | ⭐⭐⭐ | Quiz civique |
| `/menu` | Navigation | ⭐⭐ | Menu mobile |
| `/maintenance` | Système | ⭐ | Page maintenance |

---

### 1.13 À propos & Institutionnel

| URL | Type | SEO | Description |
|-----|------|-----|-------------|
| `/a-propos/qui-sommes-nous` | Statique | ⭐⭐⭐⭐⭐ | **NOUVEAU** - Présentation Vie Publique (migré de Nuxt Content) |
| `/a-propos/travailler-avec-nous` | Statique | ⭐⭐⭐⭐ | **NOUVEAU** - Partenariat & contact (migré de Nuxt Content) |
| `/a-propos/charte-dons` | Statique | ⭐⭐⭐⭐ | **NOUVEAU** - Charte des dons (migré de Nuxt Content) |
| `/a-propos/confidentialite` | Statique | ⭐⭐⭐⭐ | **NOUVEAU** - Politique de confidentialité (ex `/about/privacy`) |
| `/a-propos/barometre-politique` | Statique | ⭐⭐⭐ | **NOUVEAU** - Méthodologie baromètre (noindex) |
| `/a-propos/recrutement` | Statique | ⭐⭐⭐ | Recrutement |
| `/about/[slug]` | Statique | ⭐⭐ | ⚠️ DEPRECATED - Redirigé vers `/a-propos` |

**✅ Améliorations** :
- Migration complète de Nuxt Content vers pages Vue
- URLs françaises cohérentes
- SEO optimisé avec Schema.org Organization
- Redirects automatiques depuis `/about/*`

**⚠️ Problème résolu** : Les pages `/about` redirigent maintenant vers `/a-propos`

---

### 1.14 Dons & Paiements

| URL | Type | SEO | Description |
|-----|------|-----|-------------|
| `/don/bictorys` | Formulaire | ⭐⭐ | Don via Bictorys |
| `/don/paydunya` | Formulaire | ⭐⭐ | Don via Paydunya |
| `/don/success` | Confirmation | ⭐ | Succès paiement |
| `/don/cancel` | Confirmation | ⭐ | Annulation paiement |

---

### 1.15 Dashboard & Admin

| URL | Type | SEO | Description |
|-----|------|-----|-------------|
| `/dashboard/conseil-ministre` | Dashboard | ⭐ | Dashboard admin |

---

### 1.16 Chat & IA

| URL | Type | SEO | Description |
|-----|------|-----|-------------|
| `/chatbot` | Interactif | ⭐⭐ | Chatbot |
| `/chat-bot` | Interactif | ⭐⭐ | Chatbot (doublon ?) |
| `/chat-bot/[id]` | Détail | ⭐ | Session chatbot |

**⚠️ Problème** : Doublon `/chatbot` vs `/chat-bot`

---

## 🔌 2. ROUTES API SERVEUR (`/api/*`)

### 2.1 Assemblée Nationale

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/assembly/deputies` | GET | Liste des députés |
| `/api/assembly/deputies/[id]` | GET | Détail député |
| `/api/assembly/deputies/[id]/commissions` | GET | Commissions d'un député |
| `/api/assembly/deputies/[id]/questions` | GET | Questions d'un député |
| `/api/assembly/groups` | GET | Groupes parlementaires |
| `/api/assembly/groups/[id]` | GET | Détail groupe |
| `/api/assembly/commissions` | GET | Commissions |
| `/api/assembly/commissions/[id]` | GET | Détail commission |
| `/api/assembly/votes` | GET | Votes |
| `/api/assembly/votes/[id]` | GET | Détail vote |
| `/api/assembly/questions` | GET | Questions parlementaires |
| `/api/assembly/questions/[id]` | GET | Détail question |
| `/api/assembly/questions/latest` | GET | Dernières questions |
| `/api/assembly/office` | GET | Bureau de l'AN |

---

### 2.2 Budget

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/budget/global` | GET | Budget global |
| `/api/budget/evolution` | GET | Évolution budgétaire |
| `/api/budget/years` | GET | Années disponibles |
| `/api/budget/ministries` | GET | Budgets des ministères |
| `/api/budget/entity/[slug]` | GET | Budget d'une entité |
| `/api/budget/compare` | GET | Comparaison budgets |
| `/api/budget/glossary` | GET | Glossaire budgétaire |

---

### 2.3 Élections

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/elections/coalitions` | GET | Coalitions |
| `/api/elections/coalitions/[id]` | GET | Détail coalition |
| `/api/elections/lists/[coalitionId]` | GET | Listes électorales |
| `/api/elections/candidates/elected` | GET | Députés élus |
| `/api/elections/participation` | GET | Taux de participation |
| `/api/elections/results/departments` | GET | Résultats par département |
| `/api/elections/map/national` | GET | Carte nationale |
| `/api/elections/map/department-stats` | GET | Stats départements |
| `/api/elections/map/department-details/[department]` | GET | Détail département |
| `/api/elections/diaspora/countries` | GET | Pays diaspora |
| `/api/elections/diaspora/country-stats/[country]` | GET | Stats pays |
| `/api/elections/diaspora/country-details/[country]` | GET | Détail pays |
| `/api/elections/bureaux-temoins` | GET | Bureaux témoins |
| `/api/elections/pvs/[source]` | GET | Procès-verbaux |
| `/api/elections/stats/lists` | GET | Stats listes |
| `/api/elections/stats/professions` | GET | Stats professions |

---

### 2.4 Documents & Actualités

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/documents` | GET | Liste documents |
| `/api/documents/[id]` | GET | Détail document |
| `/api/documents/featured` | GET | Documents à la une |
| `/api/news` | GET | Actualités |
| `/api/news/[id]` | GET | Détail actualité |
| `/api/journaux-officiels` | GET | Journaux officiels |

---

### 2.5 Nominations, Gouvernement & Médias

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/government/current` | GET | **NOUVEAU** - Gouvernement actuel (Ministres en fonction) |
| `/api/nominations` | GET | Toutes les nominations |
| `/api/nominations/[id]` | GET | Détail nomination (utilisé pour `/personnalites/[id]/[slug]`) |
| `/api/nominations/stats` | GET | Statistiques nominations |
| `/api/nominations-magistrature` | GET | Nominations magistrature |
| `/api/medias` | GET | Médias reconnus |
| `/api/medias/[id]` | GET | Détail média |
| `/api/medias/stats` | GET | Stats médias |
| `/api/aide-presse` | GET | Aide à la presse |

---

### 2.6 État & Organisation

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/state/entities` | GET | Entités de l'État |
| `/api/state/entities/[slug]` | GET | Détail entité |
| `/api/state/stats` | GET | Statistiques État |
| `/api/state/tree` | GET | Arbre organisation |
| `/api/etat-organisation` | GET | Organisation État (legacy?) |

---

### 2.7 Baromètre & Rapports

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/barometre-politique/diomaye-faye` | GET | Promesses Diomaye |
| `/api/reports` | GET | Rapports |

---

### 2.8 Utilitaires

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/search` | GET | Recherche globale |
| `/api/partners` | GET | Partenaires |
| `/api/websites` | GET | Sites publics |
| `/api/quiz-image` | GET | Quiz images |
| `/api/quiz-text` | GET | Quiz texte |
| `/api/carte` | GET | Carte |
| `/api/carte/result` | GET | Résultat carte |

---

### 2.9 Paiements & Newsletter

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/donate/init-payment` | POST | Initialiser paiement |
| `/api/donate/paydunya/init-payment` | POST | Paiement Paydunya |
| `/api/donate/paydunya/callback` | POST | Callback Paydunya |
| `/api/donate/webhook` | POST | Webhook paiements |
| `/api/newsletter/subscribe` | POST | Inscription newsletter |

---

### 2.10 Système & Sécurité

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/health` | GET | Health check |
| `/api/csrf-token` | GET | Token CSRF |
| `/api/csp-report` | POST | Rapport CSP |
| `/api/features/flags` | GET | Feature flags |
| `/api/chat` | POST | Chat IA |
| `/api/councyl-minister` | GET | Conseil ministre (typo?) |

---

### 2.11 Proxy Assets (LEGACY)

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/medias/[...path]` | GET | ⚠️ LEGACY - Proxy images |
| `/api/docs/[...path]` | GET | Proxy documents |

**Note** : Ces routes existent toujours mais les nouveaux assets utilisent `/cms/` et `/docs/`

---

## 🔀 3. ROUTES PROXY (Nitro routeRules)

| Route | Cible | Cache | Description |
|-------|-------|-------|-------------|
| `/cms/**` | `cms.vie-publique.sn/assets/**` | 1 an (immutable) | Images & médias CMS |
| `/docs/**` | `cms.vie-publique.sn/assets/**` | 24h | Documents CMS (PDF, etc.) |
| `/api/**` | - | no-cache | Headers API |

---

## ✨ 4. NOUVELLES FONCTIONNALITÉS (Décembre 2024)

### 4.1 Page Gouvernement du Sénégal 🆕

**URL** : `/gouvernement-senegal`

**Fonctionnalités** :
- ✅ Liste complète du gouvernement actuel
- ✅ Premier Ministre en vedette
- ✅ Ministres avec photos et fonctions
- ✅ Secrétaires d'État
- ✅ Statistiques (total, parité homme/femme)
- ✅ Filtrage automatique (uniquement nominations actives)
- ✅ Schema.org `GovernmentOrganization` pour SEO
- ✅ Liens vers fiches portraits individuelles

**SEO optimisé pour** :
- "gouvernement sénégal 2024"
- "ministres sénégal"
- "premier ministre sénégal"
- "Ousmane Sonko"
- "composition gouvernement sénégal"

---

### 4.2 Restructuration des Portraits 🆕

**Ancienne structure** : `/portraits/[slug]`
- ❌ Basé uniquement sur slug (lent, requête BDD)
- ❌ Risque de collision si 2 personnes ont le même nom

**Nouvelle structure** : `/personnalites/[id]/[slug]`
- ✅ Requête par ID (ultra rapide)
- ✅ Slug SEO pour Google
- ✅ Pas de collision possible
- ✅ Schema.org `Person` pour rich snippets
- ✅ Integration avec content markdown (biographies)

**Exemples** :
```
/personnalites/123/ousmane-sonko
/personnalites/456/mary-teuw-niane
/personnalites/789/yacine-fall
```

**Redirect automatique** :
- `/portraits/*` → `/personnalites/*` (legacy)

**Backend** :
- Utilise `useNominations({ id })` composable
- Affichage bio HTML avec `v-html="nomination.bio"` et classes Tailwind `prose`
- Smart back button avec paramètre `?ref=gouvernement`

---

### 4.3 Génération Automatique de Slug 🆕

**Fonction** : `server/utils/slug.ts` → `generateSlugFromName()`

**Fonctionnalité** :
- Génère automatiquement un slug SEO depuis le nom complet
- Utilisé pour les ministres sans slug dans Directus
- Normalise les accents et caractères spéciaux

**Algorithme** :
```typescript
export function generateSlugFromName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')  // Décompose les accents
    .replace(/[\u0300-\u036f]/g, '')  // Supprime les accents
    .replace(/[^a-z0-9]+/g, '-')  // Remplace non-alphanumériques par -
    .replace(/^-+|-+$/g, '')  // Supprime - au début/fin
}
```

**Exemples** :
```
"Ousmane Sonko" → "ousmane-sonko"
"Mary Teuw Niane" → "mary-teuw-niane"
"Yacine Fall" → "yacine-fall"
```

**Utilisé dans** :
- `/api/government/current` (ligne 82)
- `/api/nominations/[id]` (si besoin)

---

### 4.4 API Gouvernement Actuel 🆕

**Endpoint** : `/api/government/current`

**Fonctionnalités** :
- Filtre automatique : Type "Ministre", "Premier Ministre", "Secrétaire d'État"
- Filtre temporel : `endDate` null ou future
- Tri : Premier Ministre en premier, puis alphabétique
- Regroupement par type
- Statistiques : total, parité, par type
- Cache 6 heures (gouvernement change rarement)

**Response** :
```json
{
  "government": {
    "primeMinister": {...},
    "ministers": [...],
    "secretariesOfState": [...]
  },
  "stats": {
    "total": 41,
    "ministers": 35,
    "secretariesOfState": 5,
    "women": 18,
    "men": 23
  },
  "lastUpdate": "2024-12-12"
}
```

---

## 🔄 5. REDIRECTIONS CONFIGURÉES

| Ancien | Nouveau | Type | Note |
|--------|---------|------|------|
| `/reports` | `/rapport-senegal` | Permanent | - |
| `/budget-etat-senegal` | `/budget-senegal` | Permanent | - |
| `/about/us` | `/a-propos/qui-sommes-nous` | Permanent | - |
| `/about/privacy` | `/a-propos/confidentialite` | Permanent | **NOUVEAU** |
| `/about/barometre` | `/a-propos/barometre-politique` | Permanent | **NOUVEAU** |
| `/publications/recrutement` | `/a-propos/recrutement` | Permanent | - |
| `/medias/liste-officielle` | `/medias` | Permanent | - |
| `/code-senegal` | `/documents/codes` | Permanent | - |
| `/budget-senegal/2024` | `/budget-senegal` | Permanent | - |
| `/budget-senegal/2025` | `/budget-senegal` | Permanent | - |
| `/portraits/*` | `/personnalites/*` | Regex | Legacy portraits |
| `/conseil-des-ministres/conseil-des-ministres-*` | `/conseil-des-ministres` | Regex | - |
| `/nomination-senegal/conseil-des-ministres-*` | `/nomination-senegal` | Regex | - |

---

## ⚠️ 6. PROBLÈMES DÉTECTÉS

### 5.1 Incohérences linguistiques

| Problème | URLs | Recommandation |
|----------|------|----------------|
| Mélange FR/EN | `/individuals-cited`, `/about` | **Tout en français** : `/personnes-citees`, `/scandales-financiers`, `/a-propos` |

### 5.2 Doublons & Confusion

| Problème | URLs | Recommandation |
|----------|------|----------------|
| Budget | `/budget` vs `/budget-senegal` | **Garder** `/budget-senegal` uniquement |
| Chatbot | `/chatbot` vs `/chat-bot` | **Unifier** en `/chatbot` |
| About | `/a-propos` vs `/about` | **Supprimer** `/about` |

### 5.3 URLs génériques (peu SEO)

| URL | Score SEO | Amélioration suggérée |
|-----|-----------|----------------------|
| `/budget` | ⭐⭐ | → `/budget-senegal` |
| `/elections` | ⭐⭐ | → `/elections-senegal` |
| `/documents` | ⭐⭐ | → `/documents-publics-senegal` |
| `/publications` | ⭐⭐ | → `/publications-officielles` |
| `/justice` | ⭐⭐ | → `/justice-senegal` |

### 5.4 Pages sans slug SEO

| URL | Problème | Solution |
|-----|----------|----------|
| `/assemblee-nationale/commissions/[id]` | Pas de slug | Ajouter `[id]/[slug]` |
| `/assemblee-nationale/votes/[id]` | Pas de slug | Ajouter `[id]/[slug]` |
| `/assemblee-nationale/questions/[id]` | Pas de slug | Ajouter `[id]/[slug]` |
| `/elections/legislatives/[id]` | Pas de slug | Ajouter `[id]/[slug]` |


---

## 🎯 6. RECOMMANDATIONS SEO

### 6.1 URLs à Améliorer (Priorité HAUTE)

#### 1. Renommer les URLs en anglais

```
❌ /individuals-cited → ✅ /personnes-citees
❌ /about → ✅ /a-propos
```

#### 2. Supprimer les doublons

```
❌ /budget → ✅ Rediriger vers /budget-senegal
❌ /chatbot ET /chat-bot → ✅ Unifier en /chatbot
```

#### 3. Ajouter des slugs SEO

```
❌ /assemblee-nationale/votes/[id]
✅ /assemblee-nationale/votes/[id]/[slug-vote]

❌ /elections/legislatives/[id]
✅ /elections/legislatives/[id]/[nom-coalition]
```

### 6.2 Structure Idéale (Cohérence)

#### Hub → Sous-sections → Détails

```
/assemblee-nationale (hub)
  ├─ /deputes (liste)
  │   └─ /[id]/[nom] (détail avec slug)
  ├─ /votes (liste)
  │   └─ /[id]/[slug] (détail avec slug)
  └─ /commissions (liste)
      └─ /[id]/[slug] (détail avec slug)
```

### 6.3 Mots-clés dans les URLs

**Bonnes pratiques appliquées** :
- ✅ `/budget-senegal` (pays dans l'URL)
- ✅ `/assemblee-nationale` (institution explicite)
- ✅ `/journal-officiel-senegal` (pays + type)

**À améliorer** :
- ⚠️ `/documents` → `/documents-publics-senegal`
- ⚠️ `/elections` → `/elections-senegal`

### 6.4 URLs courtes vs descriptives

**Équilibre optimal** :

| Type | Longueur max | Exemple |
|------|-------------|---------|
| Hub | 2-3 mots | `/budget-senegal` ✅ |
| Liste | 3-4 mots | `/assemblee-nationale/deputes` ✅ |
| Détail | 4-6 mots | `/assemblee-nationale/deputes/[id]/[nom-prenom]` ✅ |

---

## 📈 7. SCORE SEO PAR SECTION

| Section | Score Global | Commentaire |
|---------|--------------|-------------|
| Assemblée Nationale | ⭐⭐⭐⭐ | Excellente structure, manque slugs sur votes/questions |
| Budget | ⭐⭐⭐ | Bon, mais doublon `/budget` à supprimer |
| Élections | ⭐⭐⭐⭐ | Très bien organisé |
| Documents | ⭐⭐⭐ | Bon, URL générique à améliorer |
| Médias & Annuaires | ⭐⭐⭐⭐⭐ | Parfait |
| Justice & Scandales | ⭐⭐ | ❌ URLs en anglais |
| État & Organisation | ⭐⭐⭐⭐ | Très bien |
| Nominations | ⭐⭐⭐⭐ | Excellent |
| Baromètre | ⭐⭐⭐⭐⭐ | Parfait |

**Score moyen** : ⭐⭐⭐⭐ (3.5/5)

---

## 🚀 8. PLAN D'ACTION

### Phase 1 : Corrections critiques (1-2 semaines)

1. **Franciser les URLs**
   - [ ] Créer redirects pour `/individuals-cited` → `/personnes-citees`
   - [ ] Créer redirects pour `/about` → `/a-propos`

2. **Supprimer doublons**
   - [ ] Rediriger `/budget` → `/budget-senegal`
   - [ ] Unifier `/chat-bot` → `/chatbot`

### Phase 2 : Optimisations SEO (2-4 semaines)

3. **Ajouter slugs manquants**
   - [ ] `/assemblee-nationale/votes/[id]/[slug]`
   - [ ] `/assemblee-nationale/questions/[id]/[slug]`
   - [ ] `/assemblee-nationale/commissions/[id]/[slug]`

4. **Améliorer URLs génériques**
   - [ ] `/documents` → `/documents-publics`
   - [ ] `/elections` → `/elections-senegal`

### Phase 3 : Monitoring (continu)

5. **Suivre l'impact SEO**
   - [ ] Google Search Console : Position des URLs
   - [ ] Trafic organique par URL
   - [ ] Taux de clic (CTR) des URLs optimisées

---

## 📝 Conclusion

Le projet a une **excellente base** avec :
- ✅ Structure cohérente et logique
- ✅ Slugs SEO sur la majorité des pages détails
- ✅ URLs descriptives avec mots-clés pays

**Points d'amélioration** :
- ⚠️ Uniformiser la langue (tout en français)
- ⚠️ Compléter les slugs manquants
- ⚠️ Supprimer les doublons

Avec ces corrections, le site atteindrait un **score SEO de 4.5/5** sur la structure des URLs.

# slug /[id]/[slug]

SEO - Aucun impact négatif 🎯
Google ignore l'ID et se concentre sur le slug :
❌ FAUX : /articles/123 (mauvais SEO)
✅ BON  : /articles/123/budget-senegal-2025 (excellent SEO)

Avantages de /[id]/[slug]
✅ Requête rapide	Lookup direct par ID (index primaire)
✅ Slug flexible	Peut changer sans casser les liens
✅ SEO parfait	Google lit le slug, ignore l'ID
✅ URLs uniques	Pas de collision même si 2 slugs identiques
✅ Backlinks stables	L'ID garantit l'unicité

/[id]/[slug] ✅ RECOMMANDÉ

# slug path-senegal ou path uniquement

 OUI, gardez -senegal ! Voici pourquoi :

 Même si votre domaine est .sn, ajouter "senegal" dans l'URL a un impact positif :
❌ vie-publique.sn/budget
✅ vie-publique.sn/budget-senegal

Google comprend : "Budget + Sénégal" (signal géo renforcé)

Domaine : vie-publique.sn
Problèmes potentiels avec URLs génériques :
❌ vie-publique.sn/budget
   → Quel pays ? (pas clair sans contexte)
   → Concurrence avec "vie-publique.fr" (site français officiel)
   → Moins de poids SEO pour "budget sénégal"

   Différenciation nécessaire car même nom de domaine

# checklsit

✅ /budget-senegal
✅ /elections-senegal
✅ /journal-officiel-senegal
✅ /nomination-senegal
❓ /assemblee-nationale
❓ /conseil-des-ministres
/etat-senegal
❓ /medias


Métriques à suivre
Après déploiement, surveiller dans Google Search Console :
Impressions : "gouvernement sénégal"
Clics : "ministres sénégal 2024"
CTR : Pages /gouvernement-senegal et /personnalites/*
Position moyenne des nouvelles URLs

"personnalités sénégalaises" est plus recherché que "portraits"

---

## 📝 Changelog

### 2025-12-12 - Migration et Optimisations SEO

#### Nouvelles Pages
- ✅ `/gouvernement-senegal` - Gouvernement actuel avec statistiques
- ✅ `/personnalites/[id]/[slug]` - Page canonique portraits (remplace `/nomination-senegal/[id]/[slug]`)
- ✅ `/a-propos/qui-sommes-nous` - Migration depuis Nuxt Content
- ✅ `/a-propos/travailler-avec-nous` - Migration depuis Nuxt Content
- ✅ `/a-propos/charte-dons` - Migration depuis Nuxt Content
- ✅ `/a-propos/confidentialite` - Migration depuis `/about/privacy`
- ✅ `/a-propos/barometre-politique` - Migration depuis `/about/barometre` (noindex)

#### Nouveaux Endpoints API
- ✅ `/api/government/current` - Récupération gouvernement actuel avec filtres temporels

#### Nouvelles Fonctionnalités
- ✅ Génération automatique de slug depuis le nom (`server/utils/slug.ts`)
- ✅ Affichage bio HTML avec `v-html` et classes Tailwind `prose`
- ✅ Smart back button avec paramètre `?ref=gouvernement`
- ✅ Composable `useGovernment()` suivant les guidelines du projet

#### Redirections Ajoutées
- ✅ `/about/privacy` → `/a-propos/confidentialite` (301)
- ✅ `/about/barometre` → `/a-propos/barometre-politique` (301)

#### Corrections
- ✅ Fix feature flags - Suppression `await` dans `useFeatureFlags.ts`
- ✅ Fix photos nomination list - Utilisation `useCmsImage()` helper
- ✅ Fix bio portraits - Ajout `v-html` avec fallback

#### SEO
- ✅ Schema.org `GovernmentOrganization` pour `/gouvernement-senegal`
- ✅ Schema.org `Person` pour `/personnalites/[id]/[slug]`
- ✅ Schema.org `Organization` pour `/a-propos/qui-sommes-nous`
- ✅ Meta tags optimisés pour toutes les nouvelles pages
