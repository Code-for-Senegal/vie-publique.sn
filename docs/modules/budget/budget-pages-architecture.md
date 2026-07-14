# 🏗️ Architecture des Pages Budget

> Documentation complète de la structure et des fonctionnalités de toutes les pages budget

**Dernière mise à jour** : 2025-11-05

---

## 📋 Vue d'ensemble

Le système budget est organisé en **pages dédiées** pour optimiser le **SEO**, l'**UX** et la **navigation profonde** (deep linking).

### Principe architectural

**Approche hybride** : Pages dédiées + Dashboard centralisé

- ✅ **Pages SEO-friendly** : URLs propres, indexables, partageables
- ✅ **Dashboard synthétique** : Vue d'ensemble rapide avec onglets
- ✅ **Réutilisation des composants** : DRY (Don't Repeat Yourself)

---

## 🗺️ Arborescence complète

```
/budget                              # Landing page principale
├── /glossaire                       # Glossaire des termes budgétaires
├── /ministeres                      # Liste complète des ministères
└── /institutions                    # Liste complète des institutions

/budget-senegal                      # Dashboard interactif (synthèse)
└── /[slug]                          # Page détail ministère/institution
```

### URLs publiques

| URL | Page | SEO Priorité |
|-----|------|--------------|
| `/budget` | Landing page | **Haute** |
| `/budget/glossaire` | Glossaire | **Haute** |
| `/budget/ministeres` | Ministères | **Très haute** |
| `/budget/institutions` | Institutions | **Très haute** |
| `/budget-senegal` | Dashboard | **Moyenne** |
| `/budget-senegal/ministere-sante` | Détail entité | **Haute** |

---

## 📄 Pages détaillées

### 1. `/budget` - Landing Page

**Rôle** : Point d'entrée principal, présentation générale du budget

**Fichier** : `app/pages/budget/index.vue`

**Design** : Sobre, efficace, hiérarchie visuelle claire

#### Sections (dans l'ordre)

1. **Hero Section** (sobre, sans CTA)
   - Titre : "Budget de l'État du Sénégal"
   - Description : Transparence des finances publiques
   - **Pas de boutons** : scroll naturel vers le contenu

2. **Dashboard Card** (⭐ Star, 1 ligne complète)
   - **Design** : Border primary, gradient background, hover effect
   - **Layout** : Flex (icon + texte à gauche, stats + CTA à droite)
   - **Stats intégrées** : Recettes 2025 (visible desktop uniquement)
   - **CTA** : Bouton "Explorer" → `/budget-senegal`
   - **Cliquable** : Toute la card est un lien
   - **Source** : `/api/budget/compare` (année en cours)

3. **Ressources** (3 cards, grid 3 colonnes)
   - **Ministères** → `/budget/ministeres`
     - Icône : building-office (bleu)
     - Description : Budgets détaillés par ministère avec filtres

   - **Institutions** → `/budget/institutions`
     - Icône : building-library (violet)
     - Description : Budgets Assemblée, Présidence, etc.

   - **Documents** → `/documents/budget`
     - Icône : document-text (orange)
     - Description : PLF, LFI, LFR et documents officiels

4. **Glossaire** (1 card, pleine largeur)
   - **Design** : Card horizontale avec icône à gauche, flèche à droite (desktop)
   - Icône : book-open (vert)
   - **Lien** : → `/budget/glossaire`
   - Description : Comprenez les termes et concepts essentiels

5. **Comprendre le Budget** (Section articles)
   - **Titre + Description** : "Articles et analyses pour mieux comprendre..."
   - **Composant** : `BudgetBudgetArticles`
   - **Layout** :
     - **Desktop** : Grid 3 colonnes (vertical, même style que HomeNews)
     - **Mobile** : Format HomeNews (horizontal compact, image à gauche)
   - **Source** : `/api/news?category=budget&limit=3`
   - **Lien** : "Voir tous les articles sur le budget" → `/actualites?category=budget`

#### Composants utilisés

- `BudgetBudgetArticles` : Affichage responsive des articles budget

#### Principes de design

✅ **Hiérarchie claire** : Dashboard en premier (action principale)
✅ **Pas de redondance** : Chaque lien apparaît une seule fois
✅ **Mobile-first** : Layout adaptatif, articles style HomeNews
✅ **Sobre** : Pas de CTA multiples, scroll naturel
✅ **Contextuel** : Stats intégrées dans Dashboard Card

#### SEO

```typescript
title: "Budget de l'État du Sénégal | Transparence des finances publiques"
description: "Découvrez le budget de l'État du Sénégal : dashboard interactif, budgets par ministère et institution, documents officiels et articles pour comprendre les finances publiques."
```

---

### 2. `/budget/glossaire` - Glossaire Budgétaire

**Rôle** : Éduquer les citoyens sur les termes budgétaires

**Fichier** : `app/pages/budget/glossaire/index.vue`

#### Fonctionnalités

1. **Affichage accordéon**
   - Utilise `UAccordion` de Nuxt UI
   - Un terme par ligne, expandable
   - Icône `i-heroicons-information-circle`

2. **Recherche en temps réel**
   - Barre de recherche avec `UInput`
   - Filtre dans les **termes** ET les **définitions**
   - Mise à jour instantanée de la liste

3. **Compteur de résultats**
   - Affiche : "X terme(s) trouvé(s)"
   - Message si aucun résultat

4. **États gérés**
   - Loading spinner pendant le chargement
   - Message d'erreur si échec API
   - Message si aucun terme disponible

#### Data Source

- **API** : `/api/budget/glossary`
- **Fichier JSON** : `server/data/budget-glossary.json`
- **Cache** : 24h (données statiques)

**Structure des données** :

```json
{
  "terms": [
    {
      "id": 1,
      "term": "ADMINISTRATEUR DE CREDIT",
      "definition": "Agent de l'ordre administratif..."
    }
  ],
  "total": 8
}
```

**Termes actuels** : 8 (à compléter avec tous les termes du site officiel)

#### SEO

```typescript
title: "Glossaire Budgétaire | Budget du Sénégal"
description: "Découvrez les termes et définitions essentiels pour comprendre le budget de l'État du Sénégal : administrateur de crédit, annualité budgétaire, autorisation d'engagement..."
```

---

### 3. `/budget/ministeres` - Liste des Ministères

**Rôle** : Afficher tous les budgets des ministères avec filtres avancés

**Fichier** : `app/pages/budget/ministeres/index.vue`

#### Fonctionnalités

1. **Breadcrumb**
   - Budget > Ministères
   - Navigation claire

2. **Header avec actions**
   - Titre : "Budgets des Ministères"
   - Description : "Répartition budgétaire par ministère pour l'année {année}"
   - Bouton "Voir les Institutions" → `/budget/institutions`
   - Bouton "Dashboard complet" → `/budget-senegal`

3. **Filtres avancés**
   - **Sélecteur année** : Dropdown avec toutes les années disponibles
     - Source : `/api/budget/years`
     - Défaut : Année en cours

   - **Sélecteur version** : Dropdown PLF/LFI/LFR
     - Source : `/api/budget/global?year={année}`
     - Défaut : "Dernière version" (null)
     - Options : "LFI 2025 (LFI)", "LFR 2024 (LFR)", etc.

   - **Recherche** : Input texte
     - Recherche dans : Nom entité, Label, Code section
     - Filtre côté client (réactif)

4. **Stats en temps réel** (3 cartes)
   - Nombre de ministères filtrés
   - Budget total (en Mrd FCFA)
   - Budget moyen (en Mrd FCFA)

5. **Tableau des ministères**
   - **Composant** : `BudgetBudget2TableMinistryV2`
   - Colonnes : Nom, Code, Montant, Poids (%)
   - Tri : Par montant (ascendant/descendant)
   - Clic sur ligne → `/budget-senegal/{slug}` (page détail)

6. **États gérés**
   - Loading : Spinner + texte "Chargement des budgets..."
   - Error : Alert rouge avec message d'erreur
   - No results : Message si aucun résultat (recherche vide ou pas de données)

#### Data Source

- **API** : `/api/budget/ministries`
- **Params** : `year`, `version`, `level=ministry`
- **Watch** : Réactif aux changements de filtres

#### SEO

```typescript
title: "Budgets des Ministères du Sénégal | Répartition par ministère"
description: "Découvrez la répartition détaillée des budgets par ministère au Sénégal : montants alloués, évolutions et comparaisons pour une transparence totale des finances publiques."
```

**Structured Data** :

```json
{
  "@context": "https://schema.org",
  "@type": "GovernmentService",
  "name": "Budgets des Ministères du Sénégal",
  "provider": {
    "@type": "GovernmentOrganization",
    "name": "République du Sénégal"
  },
  "areaServed": {
    "@type": "Country",
    "name": "Sénégal"
  }
}
```

---

### 4. `/budget/institutions` - Liste des Institutions

**Rôle** : Afficher tous les budgets des institutions (Assemblée, Présidence, etc.)

**Fichier** : `app/pages/budget/institutions/index.vue`

#### Fonctionnalités

**Identiques à la page Ministères**, avec les différences suivantes :

1. **Titre** : "Budgets des Institutions"
2. **Description** : "Répartition budgétaire par institution pour l'année {année}"
3. **Bouton** : "Voir les Ministères" → `/budget/ministeres`
4. **API param** : `level=institution` (au lieu de `ministry`)
5. **Icône** : `i-heroicons-building-library` (au lieu de `building-office`)

#### Institutions typiques

- Assemblée nationale
- Présidence de la République
- Primature
- Conseil constitutionnel
- Conseil économique, social et environnemental (CESE)
- Cour des Comptes
- Haut Conseil des Collectivités Territoriales (HCCT)

#### Data Source

- **API** : `/api/budget/ministries`
- **Params** : `year`, `version`, `level=institution`

#### SEO

```typescript
title: "Budgets des Institutions du Sénégal | Répartition par institution"
description: "Découvrez la répartition détaillée des budgets par institution au Sénégal : Assemblée nationale, Présidence, Conseil constitutionnel et autres institutions. Transparence totale des finances publiques."
```

---

### 5. `/budget-senegal` - Dashboard Interactif

**Rôle** : Vue d'ensemble synthétique avec graphiques et tableaux

**Fichier** : `app/pages/budget-senegal/index.vue`

#### Sections (Onglets)

**Navigation par boutons simples** (pas `UTabs` pour éviter bugs prod)

1. **Résumé** (Tab par défaut)
   - KPIs avec variations (4 cartes)
   - Tableaux recettes/dépenses avec comparaison N-1
   - Graphiques d'évolution multi-années (D3.js)
   - Besoins de financement (cercles de progression)
   - Service de la dette (cercles de progression)

2. **Ministères** (Tableau)
   - Affiche top ministères
   - Lien "Voir tous les ministères" → `/budget/ministeres`

3. **Institutions** (Tableau)
   - Affiche toutes les institutions
   - Lien "Voir toutes les institutions" → `/budget/institutions`

4. **Documents**
   - Liste des documents budgétaires (PDFs)
   - PLF, LFI, LFR, annexes, etc.

#### Fonctionnalités clés

- **Filtres globaux** : Année + Version
- **Comparaison automatique** : Avec année N-1 (meilleure version)
- **Variations** : Badges vert/rouge/gris sur tous les indicateurs
- **Graphiques D3.js** : Évolution recettes, dépenses, financement, dette
- **Persistence** : Tab actif sauvé dans `sessionStorage`

#### Textes descriptifs

Ajoutés après chaque total pour éduquer :

- **Recettes** : "Les recettes représentent l'ensemble des ressources financières collectées par l'État..."
- **Dépenses** : "Les dépenses publiques regroupent toutes les dépenses de l'État..."
- **Financement** : "Les besoins de financement correspondent à l'écart entre les dépenses totales..."
- **Dette** : "Le service de la dette représente les montants que l'État doit payer chaque année..."

#### Composants utilisés

- `Budget2OverviewCard` : Cartes KPI avec variations
- `Budget2TableRevenueExpense` : Tableaux recettes/dépenses
- `Budget2TableMinistryV2` : Tableaux ministères/institutions
- `BudgetEvolutionLineChart` : Graphiques D3.js
- `BudgetRessourcesCircleProgress` : Graphes circulaires

#### SEO

```typescript
title: "Budget du Sénégal {année} | Dashboard interactif"
description: "Explorez le budget de l'État du Sénégal {année} : recettes, dépenses, financement, dette. Données officielles, graphiques interactifs et comparaisons."
```

---

### 6. `/budget-senegal/[slug]` - Détail Ministère/Institution

**Rôle** : Afficher le budget détaillé d'une entité (ministère ou institution)

**Fichier** : `app/pages/budget-senegal/[slug].vue`

**Statut** : ✅ **EXISTANTE** (déjà implémentée)

#### Fonctionnalités

1. **Vue d'ensemble**
   - Nom de l'entité
   - Budget total pour l'année
   - Badge de variation vs année précédente

2. **Graphique d'évolution**
   - Évolution du budget par version (PLF → LFI → LFR)
   - Visualisation des ajustements budgétaires

3. **Tableau des programmes**
   - Liste des programmes avec montants
   - Détails des crédits de paiement

4. **Navigation**
   - Bouton retour → `/budget-senegal`
   - Liens vers ministères/institutions

#### Composable

- **`useBudgetEntity(slug)`** : Gère le fetch et les données de l'entité

#### SEO

```typescript
title: "Budget {Nom ministère} {année} | Budget du Sénégal"
description: "Budget détaillé du {Nom ministère} pour l'année {année} : montants alloués, programmes, évolution et comparaisons."
```

---

## 🔄 Navigation et Liens

### Flux de navigation recommandé

```
Landing (/budget)
  ├─→ Dashboard (/budget-senegal)
  │     ├─→ Détail entité (/budget-senegal/[slug])
  │     └─→ Retour dashboard
  │
  ├─→ Ministères (/budget/ministeres)
  │     ├─→ Détail ministère (/budget-senegal/[slug])
  │     ├─→ Institutions (/budget/institutions)
  │     └─→ Dashboard (/budget-senegal)
  │
  ├─→ Institutions (/budget/institutions)
  │     ├─→ Détail institution (/budget-senegal/[slug])
  │     ├─→ Ministères (/budget/ministeres)
  │     └─→ Dashboard (/budget-senegal)
  │
  └─→ Glossaire (/budget/glossaire)
        └─→ Retour budget (/budget)
```

### Liens inter-pages

| Page actuelle | Liens de navigation |
|---------------|---------------------|
| `/budget` | → Dashboard, Glossaire, Ministères, Institutions |
| `/budget/glossaire` | ← Budget |
| `/budget/ministeres` | ← Budget, → Institutions, Dashboard, Détail |
| `/budget/institutions` | ← Budget, → Ministères, Dashboard, Détail |
| `/budget-senegal` | ← Menu, → Détail, Ministères, Institutions |
| `/budget-senegal/[slug]` | ← Dashboard |

---

## 🎨 Composants réutilisés

### Composants de tableau

| Composant | Utilisé dans | Rôle |
|-----------|--------------|------|
| `MinistryTable` | Dashboard (wrapper) | Wrapper avec gestion loading/error |
| `Budget2TableMinistryV2` | Ministères, Institutions, Dashboard | Tableau avec tri et affichage |
| `Budget2TableRevenueExpense` | Dashboard | Tableaux recettes/dépenses |

### Composants visuels

| Composant | Utilisé dans | Rôle |
|-----------|--------------|------|
| `Budget2OverviewCard` | Dashboard | Cartes KPI avec variations |
| `BudgetEvolutionLineChart` | Dashboard | Graphiques D3.js (évolution) |
| `BudgetRessourcesCircleProgress` | Dashboard | Graphes circulaires (financement, dette) |
| `BudgetBudgetArticles` | Landing page | Articles budget responsive |

### Composables

| Composable | Utilisé dans | Rôle |
|------------|--------------|------|
| `useBudget()` | Dashboard | Logique métier budget (calculs, variations) |
| `useBudgetEntity(slug)` | Page détail | Fetch données entité spécifique |

---

## 🔍 SEO et Indexation

### Priorités d'indexation

| Page | Priorité | Fréquence de mise à jour |
|------|----------|--------------------------|
| `/budget` | **0.9** | Mensuelle |
| `/budget/ministeres` | **1.0** | Annuelle (+ LFI/LFR) |
| `/budget/institutions` | **1.0** | Annuelle (+ LFI/LFR) |
| `/budget/glossaire` | **0.7** | Rarement |
| `/budget-senegal` | **0.6** | Annuelle |
| `/budget-senegal/[slug]` | **0.8** | Annuelle |

### Mots-clés cibles

**Page Ministères** :
- budget ministères sénégal
- répartition budget sénégal par ministère
- budget ministère santé sénégal
- finances publiques sénégal ministères

**Page Institutions** :
- budget assemblée nationale sénégal
- budget présidence république sénégal
- institutions sénégal budget
- conseil constitutionnel budget

**Landing page** :
- budget sénégal 2025
- loi de finances sénégal
- transparence budget sénégal
- finances publiques sénégal

### Structured Data

Toutes les pages budget incluent :

1. **Breadcrumb** (Schema.org)
2. **GovernmentService** (pages Ministères/Institutions)
3. **Dataset** (dashboard, données budgétaires)

---

## 📊 APIs utilisées

| Endpoint | Params | Usage |
|----------|--------|-------|
| `/api/budget/years` | - | Liste des années disponibles |
| `/api/budget/global` | `year`, `version?` | Données globales + versions |
| `/api/budget/compare` | `year`, `version?`, `compareYear?` | Comparaison N vs N-1 |
| `/api/budget/ministries` | `year`, `version?`, `level` | Ministères ou institutions |
| `/api/budget/glossary` | - | Termes du glossaire |
| `/api/budget/evolution` | - | Évolution multi-années |
| `/api/news` | `category=budget`, `limit` | Articles budget |

---

## 🚀 Prochaines améliorations

### Court terme

- [ ] Ajouter tous les termes du glossaire (actuellement 8/~50)
- [ ] Vérifier existence catégorie "budget" dans CMS
- [ ] Ajouter filtres avancés (tranche de budget, recherche multi-critères)
- [ ] Export CSV/Excel des tableaux

### Moyen terme

- [ ] Graphiques comparatifs ministères (top 10 en barres)
- [ ] Page "Évolution historique" avec graphiques multi-années
- [ ] Annotations sur graphiques (événements majeurs)
- [ ] Mode comparaison 2 ministères côte à côte

### Long terme

- [ ] API publique pour développeurs
- [ ] Widget embedable pour sites tiers
- [ ] Alertes email sur nouveaux budgets
- [ ] Visualisations avancées (Sankey, Treemap)

---

## 📝 Checklist maintenance

### À chaque nouvelle année budgétaire

- [ ] Vérifier données dans CMS (budget_year, budget_version)
- [ ] Tester filtres année sur toutes les pages
- [ ] Mettre à jour descriptions SEO avec nouvelle année
- [ ] Vérifier graphiques d'évolution (nouvelle année ajoutée)
- [ ] Publier articles "Comprendre le budget {année}"

### À chaque nouvelle version (LFI, LFR)

- [ ] Vérifier sélecteur de version
- [ ] Tester comparaison N vs N-1
- [ ] Vérifier calculs de variations
- [ ] Mettre à jour documents (onglet Documents)

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
```

### Variables d'environnement

```bash
# .env
CMS_API_URL=https://cms.vie-publique.sn
NUXT_PUBLIC_SITE_URL=https://www.vie-publique.sn
```

⚠️ **Important** : Pas de trailing slash pour éviter double-slash.

---

**Auteur** : Documentation générée le 2025-11-05
**Version** : 1.0
**Maintenance** : Mettre à jour à chaque ajout de page ou fonctionnalité majeure
