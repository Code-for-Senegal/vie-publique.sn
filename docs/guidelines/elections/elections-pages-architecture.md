# 🏗️ Architecture des Pages Élections

> Documentation complète de la structure et des fonctionnalités de toutes les pages du dashboard électoral

**Dernière mise à jour** : 2026-01-05

---

## 📋 Vue d'ensemble

Le système électoral est organisé en **pages dédiées** pour optimiser le **SEO**, l'**UX** et la **navigation profonde** (deep linking).

### Principe architectural

**Approche centralisée + Pages thématiques**

- ✅ **Landing page attractive** : Point d'entrée avec élection en vedette
- ✅ **Dashboard centralisé** : Vue d'ensemble avec filtres et onglets
- ✅ **Pages thématiques** : Guide, Législation, Carte
- ✅ **Réutilisation des composants** : DRY (Don't Repeat Yourself)

---

## 🗺️ Arborescence complète

```
/elections-senegal                      # Landing page principale
├── /dashboard                          # Dashboard interactif (avec filtres et onglets)
├── /guide-electoral                    # Guide de l'électeur (tutoriels vidéo)
├── /legislation                        # Législation électorale (documents PDF)
└── /carte-electorale                   # Carte électorale interactive

# Pages historiques (Législatives 2024 - archives)
/elections/legislatives
├── /[id]                               # Détail d'un candidat
├── /carte-electorale
│   ├── /index                          # Vue globale
│   ├── /bureaux-temoins                # Bureaux témoins
│   ├── /nationale/[department]         # Détail département
│   └── /diaspora/[country]             # Détail pays diaspora
├── /guide-electoral                    # Guide électoral (archive)
├── /statistiques                       # Statistiques électorales
├── /taux-participation                 # Taux de participation
└── /resultats
    ├── /carte                          # Résultats cartographiques
    ├── /classement                     # Classement des coalitions
    ├── /deputes                        # Liste des députés élus
    ├── /global                         # Résultats globaux
    ├── /proces-verbal                  # Procès-verbaux
    └── /tendances                      # Tendances électorales
```

### URLs publiques

| URL | Page | SEO Priorité |
|-----|------|--------------|
| `/elections-senegal` | Landing page | **Très haute** |
| `/elections-senegal/dashboard` | Dashboard | **Très haute** |
| `/elections-senegal/guide-electoral` | Guide électoral | **Haute** |
| `/elections-senegal/legislation` | Législation | **Haute** |
| `/elections-senegal/carte-electorale` | Carte électorale | **Haute** |

---

## 📄 Pages détaillées

### 1. `/elections-senegal` - Landing Page

**Rôle** : Point d'entrée principal, présentation de l'élection en vedette

**Fichier** : [app/pages/elections-senegal/index.vue](../../../app/pages/elections-senegal/index.vue)

**Design** : Moderne, sobre, cards avec stats en temps réel

#### Sections (dans l'ordre)

1. **Featured Election Card** (1 ligne complète)
   - **Détection automatique** de l'élection à mettre en avant :
     1. En cours (priorité absolue)
     2. Terminée (la plus récente) - **PAR DÉFAUT**
     3. Programmée (la plus proche)
   - **Layout** : Flex (Info à gauche, Stats au centre, Description à droite)
   - **Mini Stats** (3 cards) :
     - **Calendrier** : Statut de l'élection (En Cours, Terminée, Programmée)
     - **Résultats** : Taux de traitement des PV (%)
     - **Participation** : Taux de participation (%)
   - **CTA** : Lien vers le dashboard complet avec filtres pré-remplis
   - **Source** : Composable `useElectoralDashboard()` → `config.value.elections`

2. **Quick Access Grid** (3 cards)
   - **Guide Électoral** → `/elections-senegal/guide-electoral`
     - Icône : book-open (bleu)
     - Description : Comment voter ?

   - **Législation** → `/elections-senegal/legislation`
     - Icône : scale (vert)
     - Description : Textes de lois et décrets

   - **Carte Électorale** → `/elections-senegal/carte-electorale`
     - Icône : map (violet)
     - Description : Bureaux de vote

3. **Comprendre le processus** (3 articles)
   - **Layout** : Grid 3 colonnes (desktop), verticale (mobile)
   - **Design** : Cards avec images Unsplash, overlay gradient, icônes
   - **Articles** :
     - "Comment voter au Sénégal ?" → `/elections-senegal/guide-electoral`
     - "Le nouveau Code Electoral" → `/elections-senegal/legislation`
     - "La Carte des bureaux" → `/elections-senegal/carte-electorale`

4. **Footer simplifié**
   - Note : Sources officielles (DGE, Conseil Constitutionnel)

#### Composants utilisés

- `useElectoralDashboard()` : Récupération de la configuration et élection en vedette
- `UIcon` : Icônes Heroicons
- `UButton` : Boutons Nuxt UI

#### SEO

```typescript
title: "Élections au Sénégal | Plateforme d'Information Électorale"
description: "Accédez à toutes les informations sur les élections au Sénégal : guide électoral, législation, cartographie et résultats."
```

---

### 2. `/elections-senegal/dashboard` - Dashboard Interactif

**Rôle** : Vue d'ensemble complète avec filtres et onglets

**Fichier** : [app/pages/elections-senegal/dashboard.vue](../../../app/pages/elections-senegal/dashboard.vue)

**Design** : Dashboard moderne avec filtres globaux et onglets thématiques

#### Filtres globaux (en haut)

1. **Sélecteur d'année**
   - Dropdown avec toutes les années disponibles
   - Source : `config.value.elections` (années uniques)
   - Défaut : Année de l'élection en vedette

2. **Sélecteur de type d'élection**
   - Dropdown avec types : Présidentielle, Législatives, Locales
   - Défaut : Type de l'élection en vedette

3. **Sélecteur de circonscription** (uniquement pour élections locales)
   - Dropdown avec toutes les circonscriptions
   - Source : `useElectoralConstituencies()`
   - Filtre les listes électorales et statistiques

4. **Sélecteur de coalition** (optionnel)
   - Dropdown avec toutes les coalitions
   - Source : `useElectoralCoalitions()`
   - Filtre les candidats et listes

#### Onglets (navigation horizontale)

**Navigation par boutons simples** (pas `UTabs` pour éviter bugs)

1. **Résultats** (Tab par défaut)
   - **Stats principales** (cards) :
     - Participation (%)
     - Sièges à pourvoir
     - Coalitions en lice
     - Taux de traitement PV (%)
   - **Graphiques** :
     - Répartition des sièges par coalition (Pie Chart)
     - Évolution de la participation par heure (Line Chart)
   - **Tableau des coalitions** :
     - Colonnes : Nom, Voix, Sièges, % Voix
     - Tri : Par sièges (descendant)

2. **Listes** (Listes électorales)
   - **Filtres** :
     - Type de liste (Nationale, Départementale, Locale)
     - Coalition
     - Circonscription (pour élections locales)
   - **Tableau des listes** :
     - Colonnes : Nom, Coalition, Type, Circonscription, Candidats
     - Clic sur ligne → Détail de la liste (modale ou page)

3. **Candidats**
   - **Affichage** :
     - Grid de cards avec photo, nom, profession, liste
     - Clic sur card → Profil détaillé (modale)

4. **Statistiques**
   - **Sélecteur de type de statistique** :
     - Profession des candidats
     - Répartition par sexe
     - Répartition par âge
   - **Graphiques** :
     - Profession : Bar Chart horizontal
     - Sexe : Pie Chart
     - Âge : Histogram (tranches d'âge)
   - **Source** : `useElectoralProfessions()`, `useElectoralStatsList()`

5. **Guide** (Guide électoral)
   - **Composant réutilisé** : `ElectionsDashboardGuideElectoralVideos`
   - **Filtres** :
     - Type d'élection (Présidentielle, Législatives, Locales)
     - Langue (Français, Wolof, Pulaar, etc.)
   - **Affichage** :
     - Grid de vidéos YouTube avec titre et description
     - Player YouTube intégré

6. **Documents** (Législation)
   - **Filtres** :
     - Type d'élection
     - Année
   - **Affichage** :
     - Liste de documents PDF avec titre, type, année
     - Clic → Téléchargement ou ouverture dans nouvel onglet

#### Composants utilisés

- `ElectionResultatsStats.vue` : Stats principales (cards)
- `useElectoralDashboard()` : Logique métier dashboard (filtres, élection active)
- `useElectoralCoalitions()` : Fetch coalitions
- `useElectoralConstituencies()` : Fetch circonscriptions
- `useElectoralProfessions()` : Fetch statistiques professions
- `useElectoralStatsList()` : Fetch statistiques départementales

#### SEO

```typescript
title: "Dashboard Électoral {année} | Élections {type} Sénégal"
description: "Explorez les résultats des élections {type} {année} au Sénégal : coalitions, listes, candidats, statistiques et guides."
```

---

### 3. `/elections-senegal/guide-electoral` - Guide de l'Électeur

**Rôle** : Tutoriels vidéo pour expliquer le processus électoral

**Fichier** : [app/pages/elections-senegal/guide-electoral.vue](../../../app/pages/elections-senegal/guide-electoral.vue)

**Design** : Page simple avec focus sur les vidéos

#### Sections

1. **Breadcrumb**
   - Retour à l'accueil Élections

2. **Header**
   - Titre : "Guide de l'Électeur"
   - Description : "Apprenez comment voter, découvrez les étapes du scrutin..."

3. **Vidéos** (réutilisation composant)
   - **Composant** : `ElectionsDashboardGuideElectoralVideos`
   - **Filtres** :
     - Type d'élection
     - Langue
   - **Affichage** :
     - Grid responsive (3 colonnes desktop, 1 colonne mobile)
     - Chaque vidéo : Thumbnail YouTube, titre, description
     - Clic → Player YouTube (iframe ou modale)

#### Data Source

- **API** : `/api/elections/dashboard/guide/videos`
- **Collection** : `guide_electorale`
- **Filtres** : `type_election`, `langue`

#### SEO

```typescript
title: "Guide Électoral | Élections Sénégal"
description: "Vidéos tutoriels et explications sur le processus de vote au Sénégal."
```

---

### 4. `/elections-senegal/legislation` - Législation Électorale

**Rôle** : Documents PDF (code électoral, décrets, guides)

**Fichier** : [app/pages/elections-senegal/legislation.vue](../../../app/pages/elections-senegal/legislation.vue)

**Design** : Page avec filtres et liste de documents

#### Sections

1. **Breadcrumb**
   - Retour à l'accueil Élections

2. **Header**
   - Titre : "Législation Électorale"
   - Description : "Textes de lois, décrets et guides officiels"

3. **Filtres**
   - **Type d'élection** : Dropdown (Présidentielle, Législatives, Locales, Tous)
   - **Année** : Dropdown (toutes les années disponibles)

4. **Liste des documents**
   - **Affichage** :
     - Cards avec icône PDF, titre, type, année
     - Badge pour type d'élection
     - Taille du fichier
   - **Tri** : Par année (descendant) puis par type
   - **Clic** : Téléchargement ou ouverture dans nouvel onglet

#### Data Source

- **API** : `/api/elections/with-documents`
- **Collection** : `documents` (collection existante, champ `election_id` ajouté)
- **Filtres** : `type_election`, `year`

#### Composable

- `useElectoralDocuments()` : Gère le fetch et les filtres

#### SEO

```typescript
title: "Législation Électorale | Élections Sénégal"
description: "Textes de lois, code électoral, décrets et guides officiels pour les élections au Sénégal."
```

---

### 5. `/elections-senegal/carte-electorale` - Carte Électorale Interactive

**Rôle** : Visualisation cartographique des bureaux de vote

**Fichier** : [app/pages/elections-senegal/carte-electorale.vue](../../../app/pages/elections-senegal/carte-electorale.vue)

**Design** : Carte interactive (leaflet) + sidebar

#### Sections

1. **Breadcrumb**
   - Retour à l'accueil Élections

2. **Header**
   - Titre : "Carte Électorale du Sénégal"
   - Description : "Localisez votre bureau de vote"

3. **Carte interactive** (vue principale)
   - **Affichage** :
     - Carte du Sénégal (ou monde pour diaspora)
     - Markers pour bureaux de vote
     - Couleurs par coalition gagnante
   - **Interactions** :
     - Zoom/pan
     - Clic sur marker → Popup avec infos bureau
     - Heatmap de participation (optionnel)

4. **Sidebar** (filtres et stats)
   - **Filtres** :
     - Département (pour national)
     - Pays (pour diaspora)
   - **Stats** :
     - Participation moyenne
     - Coalition gagnante majoritaire
     - Nombre de bureaux affichés

#### Data Source

- **API** :
  - `/api/elections/map/national` (pour départements)
  - `/api/elections/map/diaspora` (pour pays)
- **Collections** :
  - `election_map_national`
  - `election_map_diaspora`
  - `Bureau_vote`

#### SEO

```typescript
title: "Carte Électorale | Élections Sénégal"
description: "Carte interactive des bureaux de vote au Sénégal et dans la diaspora."
```

---

## 🔄 Navigation et Liens

### Flux de navigation recommandé

```
Landing (/elections-senegal)
  ├─→ Dashboard (/elections-senegal/dashboard)
  │     ├─→ Onglets (Résultats, Listes, Candidats, Stats, Guide, Documents)
  │     └─→ Retour Landing
  │
  ├─→ Guide Électoral (/elections-senegal/guide-electoral)
  │     └─→ Retour Landing
  │
  ├─→ Législation (/elections-senegal/legislation)
  │     └─→ Retour Landing
  │
  └─→ Carte Électorale (/elections-senegal/carte-electorale)
        └─→ Retour Landing
```

### Liens inter-pages

| Page actuelle | Liens de navigation |
|---------------|---------------------|
| `/elections-senegal` | → Dashboard, Guide, Législation, Carte |
| `/elections-senegal/dashboard` | ← Landing, Onglets internes |
| `/elections-senegal/guide-electoral` | ← Landing |
| `/elections-senegal/legislation` | ← Landing |
| `/elections-senegal/carte-electorale` | ← Landing |

---

## 🎨 Composants réutilisés

### Composants de contenu

| Composant | Utilisé dans | Rôle |
|-----------|--------------|------|
| `ElectionsDashboardGuideElectoralVideos` | Dashboard (onglet Guide), Guide Électoral | Affichage des vidéos YouTube |
| `ElectionsDashboardDocumentsTab` | Dashboard (onglet Documents) | Liste des documents PDF |
| `ElectionsDashboardCoalitionsTab` | Dashboard (onglet Résultats) | Tableau des coalitions |
| `ElectionsDashboardStatsTab` | Dashboard (onglet Statistiques) | Graphiques statistiques |

### Composants visuels

| Composant | Utilisé dans | Rôle |
|-----------|--------------|------|
| `ElectionResultatsStats` | Dashboard | Cards de stats principales |
| `UIcon` | Toutes les pages | Icônes Heroicons |
| `UButton` | Toutes les pages | Boutons Nuxt UI |
| `UCard` | Toutes les pages | Cards Nuxt UI |

### Composables

| Composable | Utilisé dans | Rôle |
|------------|--------------|------|
| `useElectoralDashboard()` | Landing, Dashboard | Logique métier dashboard (filtres, élection active) |
| `useElectoralCoalitions()` | Dashboard | Fetch coalitions |
| `useElectoralConstituencies()` | Dashboard | Fetch circonscriptions |
| `useElectoralProfessions()` | Dashboard | Fetch statistiques professions |
| `useElectoralStatsList()` | Dashboard | Fetch statistiques départementales |

---

## 🔍 SEO et Indexation

### Priorités d'indexation

| Page | Priorité | Fréquence de mise à jour |
|------|----------|--------------------------|
| `/elections-senegal` | **1.0** | Quotidienne (pendant campagne) |
| `/elections-senegal/dashboard` | **1.0** | Quotidienne (pendant campagne) |
| `/elections-senegal/guide-electoral` | **0.8** | Rarement |
| `/elections-senegal/legislation` | **0.8** | Annuelle |
| `/elections-senegal/carte-electorale` | **0.7** | Annuelle |

### Mots-clés cibles

**Landing page** :
- élections sénégal 2024
- résultats élections sénégal
- vote sénégal
- législatives sénégal
- présidentielle sénégal

**Dashboard** :
- résultats élections législatives sénégal
- coalitions sénégal
- candidats législatives sénégal
- statistiques élections sénégal

**Guide Électoral** :
- comment voter sénégal
- guide électeur sénégal
- processus vote sénégal
- tutoriel vote sénégal

**Législation** :
- code électoral sénégal
- loi électorale sénégal
- législation électorale sénégal
- décrets électoraux sénégal

**Carte Électorale** :
- bureaux de vote sénégal
- carte électorale sénégal
- trouver bureau de vote sénégal
- localisation bureau vote sénégal

### Structured Data

Toutes les pages élections incluent :

1. **Breadcrumb** (Schema.org)
2. **Event** (pour élections programmées/en cours)
3. **Dataset** (pour résultats électoraux)

**Exemple (Landing page)** :

```json
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "Élections Législatives 2024",
  "startDate": "2024-11-17",
  "location": {
    "@type": "Country",
    "name": "Sénégal"
  },
  "organizer": {
    "@type": "GovernmentOrganization",
    "name": "Direction Générale des Élections (DGE)"
  }
}
```

---

## 📊 APIs utilisées

| Endpoint | Params | Usage |
|----------|--------|-------|
| `/api/elections/dashboard/config` | - | Configuration dashboard (années, types, élections) |
| `/api/elections/dashboard/coalitions` | `year`, `type`, `ranking?` | Liste des coalitions |
| `/api/elections/dashboard/constituencies` | `year`, `type` | Liste des circonscriptions |
| `/api/elections/dashboard/lists` | `year`, `type`, `constituency_id?` | Listes électorales |
| `/api/elections/dashboard/stats/professions` | `year`, `type` | Statistiques par profession |
| `/api/elections/dashboard/stats/lists` | `year`, `type` | Statistiques départementales |
| `/api/elections/dashboard/guide/videos` | `type_election?`, `langue?` | Guides vidéos |
| `/api/elections/dashboard/coalition-videos` | `coalition_id` | Vidéos d'une coalition |
| `/api/elections/with-documents` | `year?`, `type?` | Élections avec documents liés |
| `/api/elections/map/national` | `year`, `type` | Données cartographiques nationales |
| `/api/elections/map/diaspora` | `year`, `type` | Données cartographiques diaspora |

---

## 🚀 Prochaines améliorations

### Court terme

- [ ] Ajouter la recherche de candidats par nom
- [ ] Implémenter les profils détaillés des candidats (pages dynamiques `/candidats/[id]`)
- [ ] Ajouter les filtres avancés (tranche d'âge, profession, circonscription)
- [ ] Export CSV/Excel des tableaux

### Moyen terme

- [ ] Notifications push pour résultats en temps réel
- [ ] Comparaison côte à côte de candidats
- [ ] Timeline des événements électoraux
- [ ] Mode sombre complet

---


## 🛠️ Développement

### Commandes utiles

```bash
# Développement
npm run dev

# Build production
npm run build

# Preview
npm run preview

# Linter
npm run lint:fix

# Format
npm run format
```

### Variables d'environnement

```bash
# .env
CMS_API_URL=https://cms.vie-publique.sn
CMS_API_URL_ASSETS=https://cms.vie-publique.sn
NUXT_PUBLIC_SITE_URL=https://vie-publique.sn
```

⚠️ **Important** : Pas de trailing slash pour éviter double-slash.

---

## 🆘 Troubleshooting

### Les filtres ne fonctionnent pas

**Vérifications** :
1. Les query params sont bien synchronisés avec l'URL
2. Les composables réactifs (`watch`) fonctionnent
3. Les données sont bien rechargées après changement de filtre

### Les données ne s'affichent pas

**Vérifications** :
1. L'API retourne bien des données (tester avec curl ou Postman)
2. Les permissions Directus sont correctes (lecture publique)
3. Les relations sont bien configurées (FK correctes)
4. Le cache API est vidé (redémarrer le serveur)

### Erreurs de performance

**Solutions** :
1. Implémenter la pagination (limit + offset)
2. Activer le cache API (SSR)
3. Lazy loading des composants lourds
4. Optimiser les images (format WebP)

---

**Auteur** : Vie Publique Sénégal
**Version** : 1.0
