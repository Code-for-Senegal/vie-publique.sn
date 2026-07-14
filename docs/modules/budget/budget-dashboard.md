# 📊 Dashboard Budget - Améliorations et Nouvelles Fonctionnalités

> Documentation des améliorations apportées au dashboard budget `/budget-senegal`

## 🎯 Vue d'ensemble

Le nouveau dashboard budget offre une interface complète pour explorer le budget de l'État du Sénégal avec :
- **Comparaison automatique** entre années budgétaires
- **Navigation par onglets** (Résumé, Ministères, Institutions, Documents)
- **Système de variations** affichant l'évolution par rapport à l'année précédente
- **Tableaux détaillés** pour les ministères et institutions
- **Landing page `/budget`** avec section "Comprendre le budget" (articles blog)

---

## 🏗️ Architecture Technique

### Structure des pages

```
app/pages/
  ├── budget/
  │   └── index.vue                # Landing page générale budget (à créer)
  └── budget-senegal/
      ├── index.vue                # Dashboard budget interactif
      └── [slug].vue               # Page détail ministère/institution (existante)
```

### Structure des composants

```
app/pages/budget-senegal/
  └── index.vue                    # Dashboard budget interactif

app/components/
  ├── Budget/
  │   ├── Budget2OverviewCard.vue           # Cartes KPI avec variations
  │   ├── Budget2TableRevenueExpense.vue    # Tableaux recettes/dépenses avec variations
  │   ├── Budget2TableMinistryV2.vue        # Tableau ministères/institutions
  │   └── BudgetRessourcesCircleProgress.vue # Graphes circulaires
  └── MinistryTable.vue                      # Wrapper pour tableaux budget entités

app/composables/
  └── useBudget.ts                 # Logique métier et calculs de variations

server/api/budget/
  ├── global.get.ts               # Données globales du budget
  ├── years.get.ts                # Liste des années disponibles
  ├── compare.get.ts              # Données de comparaison année N-1
  └── ministries.get.ts           # Budgets ministères/institutions (NOUVEAU)
```

---

## 🆕 Nouvelles Fonctionnalités

### 1. Système de Comparaison Automatique

**Fonctionnement** :
- Compare automatiquement avec la meilleure version disponible de l'année N-1
- Ordre de priorité : `LFR > LFI > PLF`
- Calcule les variations en pourcentage pour tous les indicateurs
- Affiche les variations en badges gris neutres sur les totaux

**API utilisée** : `/api/budget/compare`

```typescript
// Paramètres
{
  year: 2026,           // Année courante
  version: 5,           // Version courante (optionnel)
  compareYear: 2025     // Année de comparaison (optionnel, défaut: N-1)
}

// Réponse
{
  year: 2026,
  version: 5,
  compareYear: 2025,
  compareVersion: 4,
  compareVersionLabel: "LFR",
  hasComparison: true,
  current: { /* données année courante */ },
  compare: { /* données année de comparaison */ }
}
```

**Composable `useBudget.ts`** :

```typescript
// Calcul de variation
const calculateVariation = (current: number, previous: number): string => {
  if (previous === 0) return "N/A";
  const variation = ((current - previous) / previous) * 100;
  const sign = variation > 0 ? "+" : "";
  return `${sign}${variation.toFixed(1)}%`;
};

// Couleur avec logique inversée pour le déficit
const getVariationColor = (variation: string, indicatorCode: string) => {
  if (variation === "N/A" || variation === "0%") return 'gray';

  const isPositive = variation.startsWith('+');
  const isDeficit = indicatorCode === 'deficit_total' || indicatorCode === 'deficit_pct_gdp';

  // Pour le déficit : baisse = vert, hausse = rouge
  if (isDeficit) {
    return isPositive ? 'red' : 'green';
  }

  return isPositive ? 'green' : 'red';
};
```

**Gestion spéciale des pourcentages** :
- Pour les indicateurs en % (taux de croissance, déficit/PIB), affiche la valeur de comparaison directement
- Format : `"5.2% en 2025"` au lieu de `"+34.6%"`

---

### 2. Navigation par Onglets

**Remplacement des UTabs** :
- Les `UTabs` de Nuxt UI causaient des problèmes en production
- Remplacé par des boutons simples avec affichage conditionnel (`v-show`)

**Implémentation** :

```vue
<!-- Boutons style tabs -->
<div class="mb-6 border-b border-gray-200 dark:border-gray-700">
  <div class="flex items-center justify-center gap-1">
    <button
      @click="activeTab = 'overview'"
      :class="[
        'px-4 py-2 text-sm font-medium transition-colors',
        activeTab === 'overview'
          ? 'border-b-2 border-gray-900 text-gray-900 dark:border-gray-100 dark:text-gray-100'
          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
      ]"
    >
      Résumé
    </button>
    <!-- Autres boutons... -->
  </div>
</div>

<!-- Contenu conditionnel -->
<div v-show="activeTab === 'overview'">
  <!-- Contenu Résumé -->
</div>
```

**Persistence de l'onglet actif** :

```typescript
// Sauvegarde dans sessionStorage
const activeTab = ref('overview');

if (import.meta.client) {
  const savedTab = sessionStorage.getItem('budget-active-tab');
  if (savedTab) {
    activeTab.value = savedTab;
  }
}

watch(activeTab, (newTab) => {
  if (import.meta.client) {
    sessionStorage.setItem('budget-active-tab', newTab);
  }
});
```

**Onglets disponibles** :
1. **Résumé** : KPIs, recettes, dépenses, financement, dette
2. **Ministères** : Tableau des budgets ministériels
3. **Institutions** : Tableau des budgets des institutions
4. **Documents** : Documents budgétaires associés

---

### 3. Tableaux Ministères et Institutions

**Nouvel endpoint API** : `/api/budget/ministries`

```typescript
// Paramètres
{
  year: 2026,
  version: 5,           // Optionnel
  level: 'ministry'     // 'ministry' ou 'institution'
}

// Réponse
{
  year: 2026,
  version: 5,
  level: "ministry",
  ministries: [
    {
      id: 1,
      year: 2026,
      label: "Total section 59",
      version: 5,
      level: "ministry",
      code: "59",
      amount_cp: "113.72000",
      unit: "mds_fcfa",
      entity: {
        name: "Ministère de la Formation Professionnelle",
        id: 2875
      }
    },
    // ...
  ]
}
```

**Authentification** :
- Utilise `getCmsClient()` au lieu de `createDirectus().with(rest())`
- Gère automatiquement le token d'authentification Directus

**Composant réutilisable** : `MinistryTable.vue`

```vue
<!-- Utilisation pour ministères -->
<MinistryTable
  :year="year"
  :version="version"
  level="ministry"
/>

<!-- Utilisation pour institutions -->
<MinistryTable
  :year="year"
  :version="version"
  level="institution"
/>
```

**Fonctionnalités du tableau** :
- Tri ascendant/descendant par montant
- Calcul automatique du poids dans le budget total
- Affichage du nom de l'entité depuis `state_entity`
- Responsive avec colonnes adaptatives

---

### 4. Affichage des Variations

**Types de badges** :

1. **Badges sur KPIs individuels** (cartes)
   - Couleur conditionnelle : vert (hausse), rouge (baisse), gris (neutre)
   - Exception : déficit inversé (baisse = vert, hausse = rouge)
   - Taille : `text-xs px-2 py-0.5`

2. **Badges sur totaux** (recettes, dépenses, financement, dette)
   - Toujours gris neutre
   - Position : alignés sur la baseline du texte (`items-baseline`)
   - Taille : `text-xs px-2 py-0.5`

3. **Badges sur lignes de tableaux**
   - Flèches ↑/↓ au lieu de +/-
   - Couleur conditionnelle selon la variation
   - Format : `↑ 5.2%` ou `↓ 3.1%`

**Composant Budget2OverviewCard.vue** :

```vue
<UBadge
  v-if="showVariationBadge && variation_percentage && variation_percentage !== 'N/A'"
  variant="solid"
  :class="[
    'rounded-full border-none px-1 text-center text-xs font-medium tracking-wide sm:px-2 sm:text-sm',
    {
      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400': variation_color === 'green',
      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400': variation_color === 'red',
      'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300': variation_color === 'gray',
    }
  ]"
>
  {{ variation_percentage }}
</UBadge>
```

---

## 🎨 Améliorations UI/UX

### 1. Style des onglets
- Border bottom simple pour l'onglet actif
- Pas de background, juste le trait
- Couleurs grises uniquement (pas de marron/primary)

### 2. Taille des badges de variation
- Réduits pour ne pas dominer visuellement
- Alignés sur la baseline pour cohérence avec le texte

### 3. Graphes circulaires
- Grid responsive : `grid-cols-2 md:grid-cols-3 lg:grid-cols-6`
- Texte tronqué avec `line-clamp-2` pour éviter débordement
- Centrage automatique avec `mx-auto`

### 4. Tableaux
- Headers avec fond gris : `bg-gray-100 dark:bg-gray-700`
- Bordures entre lignes pour meilleure lisibilité
- Tri cliquable sur colonnes de montant

---

## 📂 Structure des Données

### Collection `budget_line`

```typescript
interface BudgetLine {
  id: number;
  year: number;              // Année budgétaire
  version: number;           // ID de budget_version
  entity: {                  // Relation vers state_entity
    id: number;
    name: string;
  };
  level: 'ministry' | 'institution' | 'program' | 'project';
  code: string;              // Code section/programme
  label: string;             // Label officiel
  amount_cp: string;         // Montant en crédits de paiement
  unit: string;              // Unité (mds_fcfa)
  parent?: number;           // Pour hiérarchie (optionnel)
}
```

### Hiérarchie prévue

```
ministry (level='ministry' ou level='institution' )
  └── program (level='program', parent=ministry.id)
      └── project (level='project', parent=program.id)
```

---

## 🚀 Prochaines Étapes

### 1. Ajout des variations sur tableaux Ministères/Institutions ✅ **RÉALISÉ**

**Statut** : Implémenté avec système de comparaison flexible

**Implémentation** :

#### API `/api/budget/ministries`

Ajout de paramètres `compareYear` et `compareVersion` :

```typescript
// Paramètres
{
  year: 2026,
  version: 5,
  level: 'ministry',
  compareYear: 2025,      // Nouvelle
  compareVersion: 4       // Nouvelle
}

// Réponse avec variations
{
  year: 2026,
  version: 5,
  level: "ministry",
  ministries: [
    {
      id: 1,
      entity: { name: "Ministère X", id: 2875, logo: "...", public_slug: "..." },
      amount_cp: "113.72",
      variation_percentage: "+5.2%",
      variation_color: "green",
      previous_amount: 108.00
    }
  ]
}
```

**Calcul des variations** : Effectué côté serveur dans l'API

```typescript
// Matching par ID d'entité (gestion object vs number)
const itemEntityId = typeof item.entity === 'object' ? item.entity.id : item.entity;
const compareItem = compareItems.find((c: any) => {
  const compareEntityId = typeof c.entity === 'object' ? c.entity.id : c.entity;
  return compareEntityId === itemEntityId;
});

if (compareItem && compareItem.amount_cp) {
  const currentAmount = parseFloat(item.amount_cp);
  const previousAmount = parseFloat(compareItem.amount_cp);

  if (previousAmount > 0) {
    const variation = ((currentAmount - previousAmount) / previousAmount) * 100;
    variation_percentage = `${variation >= 0 ? '+' : ''}${variation.toFixed(1)}%`;
    variation_color = variation >= 0 ? 'green' : 'red';
  }
}
```

**Fix important - Entity ID matching** :
- Items courants ont `entity` comme objet `{id, name, logo, public_slug}`
- Items de comparaison ont `entity` comme nombre (ID uniquement)
- Solution : Extraction de l'ID des deux côtés avant comparaison

**Cache** : Clé de cache mise à jour pour inclure les paramètres de comparaison :

```typescript
getKey: (event) => {
  const query = getQuery(event);
  const compareKey = query.compareYear && query.compareVersion
    ? `-vs-${query.compareYear}-${query.compareVersion}`
    : '';
  return `budget-ministries-${query.year || 2025}-${query.version || 'latest'}-${query.level || 'ministry'}${compareKey}`;
}
```

#### Pages avec Select de Comparaison

**Pages mises à jour** :
- `/budget/ministeres/index.vue`
- `/budget/institutions/index.vue`

**Fonctionnalités** :

1. **Select de comparaison** avec icône `arrows-right-left`
2. **Options filtrées** : Uniquement versions antérieures à la sélection actuelle
3. **Option "Aucune comparaison"** par défaut
4. **Réinitialisation automatique** quand on change la version principale

```vue
<!-- Select de comparaison -->
<USelect
  v-model="selectedCompareYearVersion"
  :options="compareYearVersionOptions"
  option-attribute="label"
  value-attribute="value"
  placeholder="Comparer avec..."
>
  <template #leading>
    <UIcon name="i-heroicons-arrows-right-left" class="h-4 w-4" />
  </template>
</USelect>
```

**Options de comparaison** :

```typescript
const compareYearVersionOptions = computed(() => {
  const currentOption = yearVersionOptions.value.find(
    (opt) => opt.year === selectedYear.value && opt.versionId === selectedVersion.value
  );

  if (!currentOption) return [];

  const currentDate = new Date(currentOption.date);

  // Filtrer uniquement les versions antérieures
  const olderOptions = yearVersionOptions.value.filter((opt) => {
    const optionDate = new Date(opt.date);
    return optionDate < currentDate;
  });

  return [
    { label: 'Aucune comparaison', value: 'none', year: 0, versionId: null, date: '' },
    ...olderOptions,
  ];
});
```

#### Composant `Budget2TableMinistryV2.vue`

**Améliorations UI** :

1. **Badge de variation** placé sur une ligne séparée après la barre de progression
2. **Alignement à droite** du badge
3. **Suppression de la colonne "Variation"** dans l'en-tête (trop encombrant)
4. **Calcul du pourcentage basé sur le budget global** au lieu du total ministères

**Calcul du poids budgétaire** :

```typescript
// Récupérer expense_total depuis budget global
const { data: budgetGlobalData } = await useFetch('/api/budget/global', {
  key: computed(() => `budget-global-${props.year}-${props.version || 'latest'}`),
  query: computed(() => ({
    year: props.year,
    version: props.version,
  })),
  watch: [() => props.year, () => props.version],
});

const totalExpenses = computed(() => {
  if (!budgetGlobalData.value) return 0;

  const expenseTotal = budgetGlobalData.value.allMetrics?.find(
    (item) => item.code === 'expense_total'
  );

  return expenseTotal ? parseFloat(expenseTotal.value) : 0;
});

// Calcul du pourcentage
budget_percentage: totalExpenses.value > 0
  ? (parseFloat(ministry.amount_cp) / totalExpenses.value) * 100
  : 0
```

**Layout du tableau** :

```
[Logo %]  [Nom du ministère]                    [Montant]
[Logo %]  [━━━━━━━━━━━━━━ Barre de progression]
          [Badge variation aligné à droite] ↑ 5.2%
```

#### Composant `MinistryTable.vue`

**Props ajoutées** :
- `compareYear`
- `compareVersion`

Transmises à `Budget2TableMinistryV2` et à l'API `/api/budget/ministries`.

#### Dashboard `/budget-senegal/index.vue`

**Intégration des variations** :

Les onglets Ministères et Institutions utilisent maintenant le système de comparaison du dashboard :

```vue
<MinistryTable
  :year="year"
  :version="version"
  :compare-year="compareYear"
  :compare-version="compareVersion"
  level="ministry"
/>
```

Les variations s'affichent automatiquement en fonction du select de comparaison en haut du dashboard.

### 2. Landing Page Budget `/budget` ✅ **PARTIELLEMENT RÉALISÉ**

**Objectif** : Page d'accueil générale pour la section budget, accessible avant le dashboard interactif

**Statut** : Page créée avec dashboard cards responsive et CTA

**Sections actuelles de la page** :

1. ✅ **Hero Section** : Introduction au budget du Sénégal
   - Titre : "Budget du Sénégal"
   - Description courte et sobre
   - Pas de CTA dans le hero (design épuré)

2. ✅ **Dashboard Card** : Aperçu du budget 2026
   - Card unique avec ombre et bordure subtile
   - Header avec icône et titre "Dashboard Budget 2026"
   - **4 cartes KPI** avec gradients de couleur :
     - Dépenses (orange) : 7 434 Mrd FCFA (+13,0%)
     - Recettes (vert) : 6 189 Mrd FCFA (+26,7%)
     - Déficit (rouge) : 1 245 Mrd FCFA (-26,6%)
     - **CTA "Tableau de bord complet"** (bleu) - 4ème carte
   - **Grid responsive** :
     - Mobile : 2 colonnes (`grid-cols-2`)
     - Desktop : 2 zones (`md:grid-cols-[2fr,1fr]`)
       - Zone gauche : 3 cartes KPI (`md:grid-cols-3`)
       - Zone droite : Texte intro sur PLF 2026 (visible uniquement desktop)
   - Footer avec lien vers `/budget-senegal`

3. ✅ **Section Ressources** : 3 cards cliquables
   - Ministères : Lien vers `/budget/ministeres`
   - Institutions : Lien vers `/budget/institutions`
   - Documents : Lien vers `/budget-senegal?tab=documents`
   - Grid responsive : 1 colonne mobile, 3 colonnes desktop

4. **Section "Comprendre le Budget"** : ❌ NON IMPLÉMENTÉE
   - À faire : Afficher les 3 derniers articles de la catégorie "budget"
   - Format : Cards avec image, titre, date, extrait

**Amélioration responsive de la Dashboard Card** :

Layout mobile optimisé pour économiser l'espace vertical :

```vue
<!-- Grid 2x2 sur mobile, 2 zones sur desktop -->
<div class="mb-6 grid grid-cols-2 gap-4 md:grid-cols-[2fr,1fr] md:gap-6">
  <!-- Zone cartes : 4 cartes en 2x2 mobile, 3 cartes en ligne desktop -->
  <div class="col-span-2 grid grid-cols-2 gap-4 md:col-span-1 md:grid-cols-3">
    <!-- Dépenses -->
    <div class="...">...</div>

    <!-- Recettes -->
    <div class="...">...</div>

    <!-- Déficit -->
    <div class="...">...</div>

    <!-- CTA Card (visible uniquement mobile) -->
    <NuxtLink to="/budget-senegal" class="md:hidden ...">
      <UIcon name="i-heroicons-chart-bar-square" />
      <span>Tableau de bord complet</span>
      <UIcon name="i-heroicons-arrow-right" />
    </NuxtLink>
  </div>

  <!-- Zone texte intro (visible uniquement desktop) -->
  <div class="hidden md:block">
    <p>Le Projet de Loi de Finances 2026...</p>
  </div>
</div>
```

**Avantages** :
- ✅ Mobile : 2 cartes par ligne au lieu d'1 (gain de 50% d'espace vertical)
- ✅ Desktop : Layout propre avec texte explicatif à droite
- ✅ 4ème carte CTA remplace le texte sur mobile
- ✅ Footer CTA reste visible sur tous les écrans

**Implémentation** :

```vue
<!-- app/pages/budget/index.vue -->
<script setup lang="ts">
// Fetch des 3 derniers articles catégorie "budget"
const { data: budgetArticles } = await useAsyncData(
  'budget-articles',
  () => $fetch('/api/news', {
    query: {
      category: 'budget',
      limit: 3
    }
  })
);

// SEO
const title = "Budget de l'État du Sénégal | Transparence des finances publiques";
const description = "Découvrez le budget de l'État du Sénégal : chiffres clés, documents officiels, et articles pour comprendre les finances publiques.";
</script>

<template>
  <div class="container mx-auto py-8">
    <!-- Hero Section -->
    <section class="text-center mb-12">
      <h1 class="text-4xl font-bold mb-4">Budget de l'État du Sénégal</h1>
      <p class="text-xl text-gray-600 mb-6">
        Transparence et accessibilité des finances publiques
      </p>
      <UButton
        to="/budget-senegal"
        size="xl"
        icon="i-heroicons-chart-bar"
      >
        Explorer le dashboard budget
      </UButton>
    </section>

    <!-- Section Comprendre le Budget -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-6">Comprendre le Budget</h2>
      <BudgetBudgetArticles :articles="budgetArticles" />
      <div class="text-center mt-6">
        <NuxtLink
          to="/actualites?category=budget"
          class="text-primary hover:underline"
        >
          Voir tous les articles →
        </NuxtLink>
      </div>
    </section>

    <!-- Section Chiffres Clés -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-6">Chiffres Clés</h2>
      <!-- Grid de KPIs simplifiés -->
    </section>

    <!-- Section Documents -->
    <section>
      <h2 class="text-2xl font-bold mb-6">Documents Budgétaires</h2>
      <!-- Liste documents principaux -->
    </section>
  </div>
</template>
```

**Composant à créer** : `BudgetBudgetArticles.vue`

```vue
<!-- app/components/Budget/BudgetArticles.vue -->
<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <NuxtLink
      v-for="article in articles"
      :key="article.id"
      :to="`/actualites/${article.id}/${article.slug}`"
      class="block rounded-lg bg-gray-50 p-4 transition hover:bg-gray-100 dark:bg-gray-700"
    >
      <div class="flex flex-col gap-3">
        <!-- Image -->
        <CmsImage
          v-if="article.cover_image"
          :src="article.cover_image"
          :quality="50"
          :alt="`Image ${article.title}`"
          class="h-48 w-full rounded-md object-cover"
          loading="lazy"
        />
        <div v-else class="flex h-48 w-full items-center justify-center rounded-md bg-gray-200">
          <UIcon name="i-heroicons-newspaper" class="h-16 w-16 text-gray-400" />
        </div>

        <!-- Contenu -->
        <div class="flex-1">
          <h3 class="line-clamp-2 text-lg font-medium" v-text="article.title"></h3>
          <time class="mt-2 block text-sm text-gray-500">
            {{ $dateformat(article.date_published) }}
          </time>
          <p v-if="article.excerpt" class="mt-2 line-clamp-2 text-sm text-gray-600">
            {{ article.excerpt }}
          </p>
        </div>
      </div>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import type { NewsArticle } from "~/composables/news/useNews";

defineProps<{
  articles?: NewsArticle[];
}>();
</script>
```

**Endpoint API nécessaire** :

- Utiliser l'API news existante avec filtre catégorie "budget"
- Vérifier si la catégorie "budget" existe dans le CMS
- Si besoin, créer `/api/news/budget` spécialisé

### 2.5. Page Glossaire Budgétaire `/budget/glossaire`

**Objectif** : Page affichant tous les termes et définitions pour comprendre le budget

**Implémentation** : ✅ **RÉALISÉE**

**Fonctionnalités** :

1. **Affichage accordéon** des termes avec définitions
2. **Recherche en temps réel** dans les termes et définitions
3. **Compteur de résultats** filtré
4. **États de chargement** et d'erreur gérés
5. **Bouton retour** vers `/budget`

**Structure** :

```
server/
  ├── data/
  │   └── budget-glossary.json          # Données statiques (8 termes actuellement)
  └── api/
      └── budget/
          └── glossary.get.ts            # API avec cache 24h

app/pages/budget/
  └── glossaire/
      └── index.vue                      # Page glossaire avec UAccordion
```

**API** : `/api/budget/glossary`

```typescript
// Réponse
{
  terms: [
    {
      id: 1,
      term: "ADMINISTRATEUR DE CREDIT",
      definition: "Agent de l'ordre administratif..."
    }
  ],
  total: 8
}
```

**Termes actuellement présents** (à compléter) :

1. ADMINISTRATEUR DE CREDIT
2. ANNUALITE BUDGETAIRE
3. ANNULATION DE CREDIT
4. ARTICLE BUDGETAIRE
5. AUTORISATION DE DEPENSE
6. AUTORISATION D'ENGAGEMENT
7. AUTORISATIONS NOUVELLES
8. AVANCES DE TRESORERIE

**À faire** : Ajouter tous les termes manquants du site budget.gouv.sn dans `budget-glossary.json`

### 3. Page Détail Ministère/Institution

**Route** : `/budget-senegal/[slug]` (✅ **EXISTANTE**)

**Statut** : Page déjà implémentée avec :

- Vue d'ensemble du budget de l'entité
- Graphique d'évolution par version budgétaire
- Tableau des programmes avec montants
- Bouton retour vers dashboard

**Composable utilisé** : `useBudgetEntity(slug)`

#### Pas d'amélioration nécessaire pour l'instant

### 4. Page Détail Entité État (optionnel)

**Route** : `/etat-senegal/annuaire/[slug]` (existante)

**Améliorations à ajouter si nécessaire** :

1. **Section Budget** à ajouter dans la page
   ```vue
   <!-- Budget du ministère -->
   <UCard v-if="hasBudgetData">
     <h2>Budget {{ currentYear }}</h2>

     <!-- Total du ministère -->
     <div class="text-3xl font-bold">
       {{ totalMinistry }} Mrd FCFA
       <UBadge>{{ variation }}</UBadge>
     </div>

     <!-- Tableau des programmes -->
     <BudgetProgramTable
       :entity-id="entity.id"
       :year="currentYear"
     />
   </UCard>
   ```

2. **Nouvel endpoint API** : `/api/budget/entity/[id]`
   ```typescript
   // Récupère programmes + projets d'une entité
   GET /api/budget/entity/2875?year=2026&version=5

   // Réponse
   {
     entity: { id: 2875, name: "..." },
     year: 2026,
     version: 5,
     total: "113.72",
     variation: "+5.2%",
     programs: [
       {
         id: 10,
         code: "591",
         label: "Formation professionnelle initiale",
         amount_cp: "80.50",
         projects: [
           {
             id: 20,
             label: "Construction de centres",
             amount_cp: "25.00"
           }
         ]
       }
     ]
   }
   ```

3. **Nouveau composable** : `useBudgetEntity.ts`
   ```typescript
   export const useBudgetEntity = (entityId: Ref<number>, year: Ref<number>) => {
     const { data, pending, error } = useFetch(`/api/budget/entity/${entityId.value}`, {
       query: { year, version: undefined },
       watch: [entityId, year]
     });

     const programs = computed(() => data.value?.programs || []);
     const total = computed(() => data.value?.total || 0);

     return { programs, total, pending, error };
   };
   ```

4. **Composants à créer** :
   - `Budget/BudgetEntityOverview.vue` - Vue d'ensemble budget entité
   - `Budget/BudgetProgramTable.vue` - Tableau programmes avec projets expandables
   - `Budget/BudgetProjectCard.vue` - Carte projet individuel

### 3. Navigation Intégrée

**Liens à ajouter** :

1. Dans `Budget2TableMinistryV2.vue` :
   ```vue
   <tr
     @click="navigateTo(`/etat-senegal/annuaire/${ministry.entity.public_slug}`)"
     class="cursor-pointer hover:bg-gray-50"
   >
   ```

2. Dans page détail entité, lien retour vers budget :
   ```vue
   <UButton
     to="/budget-senegal?tab=ministries"
     icon="i-heroicons-arrow-left"
   >
     Retour au budget
   </UButton>
   ```

### 4. Graphiques d'Évolution Multi-Années

**Statut** : ✅ **IMPLÉMENTÉ**

**Fonctionnalité** : Graphiques d'évolution pour recettes, dépenses, financement et dette affichés directement sur le dashboard après chaque section

**Objectif** :

- Visualiser l'évolution des grands agrégats budgétaires sur plusieurs années
- Sélectionner automatiquement la meilleure version par année (LFR > LFI > PLF)
- Identifier tendances et ruptures dans les finances publiques

**Implémentation réalisée** :

#### 1️⃣ Endpoint API : `/api/budget/evolution`

**Logique de sélection de version** : Priorité **LFR > LFI > PLF**

Pour chaque année publiée :

1. Récupérer toutes les versions publiées (PLF, LFI, LFR)
2. Sélectionner selon priorité : si LFR existe → LFR, sinon si LFI existe → LFI, sinon PLF
3. Récupérer les métriques `budget_global` pour cette année/version
4. Calculer les totaux par groupe (revenues, expenses, financing, debt)

**Exemple** :

- Année 2024 : LFR disponible → utilise LFR 2024
- Année 2025 : Seulement LFI disponible → utilise LFI 2025
- Année 2026 : Seulement PLF disponible → utilise PLF 2026

**Structure de réponse** :

```typescript
{
  revenueEvolution: [
    { year: "2024", amount: 5123.45, label: "2024 (LFR)", versionLabel: "LFR" },
    { year: "2025", amount: 5456.78, label: "2025 (LFI)", versionLabel: "LFI" },
    { year: "2026", amount: 5789.12, label: "2026 (PLF)", versionLabel: "PLF" }
  ],
  expenseEvolution: [...],
  financingEvolution: [...],
  debtEvolution: [...]
}
```

**Avantages de cette approche** :

- ✅ **Cohérence temporelle** : Compare toujours les versions les plus fiables disponibles
- ✅ **Transparence** : L'utilisateur voit quelle version est utilisée via le label
- ✅ **Automatique** : Pas besoin de sélection manuelle, adaptatif aux données disponibles
- ✅ **Performance** : Calcul côté serveur, cache de 1h

#### 2️⃣ Composant : `BudgetEvolutionLineChart.vue`

**Technologie** : D3.js pour visualisation interactive

**Caractéristiques** :

- Graphique en ligne avec aire dégradée
- Animation fluide au chargement (ligne dessinée progressivement)
- Points cliquables sur chaque année
- Labels de montants au-dessus des points (arrondis sans décimales)
- Axe X horizontal avec labels "ANNÉE (VERSION)"
- Pas d'axe Y (focus sur la tendance, pas l'échelle)
- Responsive avec redimensionnement automatique

**Palette de couleurs** :

- Vert (`green`) : Recettes
- Rouge (`red`) : Dépenses
- Violet (`purple` #5924b2) : Besoins de financement
- Orange (`orange` #f97316) : Service de la dette
- Bleu (`blue`) : Usage générique

**Placement sur le dashboard** :

1. Après section "Répartition des recettes" → Graphique vert (recettes)
2. Après section "Répartition des dépenses" → Graphique rouge (dépenses)
3. Après section "Besoins de financement" → Graphique violet (financement)
4. Après section "Service de la dette" → Graphique orange (dette)

#### 3️⃣ Intégration dans `useBudget.ts`

Ajout de 4 nouvelles propriétés computed :

- `revenueEvolution`
- `expenseEvolution`
- `financingEvolution`
- `debtEvolution`

Récupération via un seul appel API `/api/budget/evolution` avec cache.

**Indicateurs actuellement supportés** :

- ✅ Total des recettes (somme groupe `revenues`)
- ✅ Total des dépenses (somme groupe `expenses`)
- ✅ Total besoins de financement (somme groupe `financing`)
- ✅ Total service de la dette (somme groupe `debt`)

**Améliorations futures possibles** :

- Graphiques détaillés par sous-catégorie (recettes fiscales vs non fiscales)
- Comparaison de plusieurs indicateurs sur le même graphique
- Annotations pour événements majeurs (COVID-19, réformes, etc.)
- Export des graphiques en PNG/SVG
- Export des données en CSV/Excel
- Drill-down interactif (clic sur année → détails)

### 5. Filtres et Recherche

**Améliorations futures** :
- Recherche par nom de ministère/institution
- Filtre par tranche de budget (< 50 Mrd, 50-100 Mrd, etc.)
- Export CSV/Excel des tableaux
- Graphiques de répartition (camembert, barres)

---

## 🔧 Configuration et Déploiement

### Variables d'environnement

```bash
# .env
CMS_API_URL=https://cms.vie-publique.sn
```

⚠️ **Important** : Pas de trailing slash pour éviter double-slash dans les URLs.

### Build et Cache

```bash
# Build production
npm run build

# Cache API
# Les endpoints budget utilisent defineCachedEventHandler avec:
# - maxAge: 60 * 60 (1 heure)
# - getKey: basé sur year, version, level
```

### Permissions Directus

**Collections nécessaires** :
- `budget_year` : lecture publique
- `budget_version` : lecture publique (filtre sur status=published)
- `budget_global` : lecture publique
- `budget_line` : lecture publique (avec token serveur)
- `state_entity` : lecture publique

---

## 📝 Notes Techniques

### Gestion des totaux

**Calculés côté frontend** :
- `revenue_total_general_budget` = somme des recettes
- `expense_total_general_budget` = somme des dépenses
- `financing_need_total` = somme des composantes financement
- `debt_service_total` = somme des composantes dette

**Avantages** :
- Pas de duplication en base
- Pas de risque d'incohérence
- Une seule source de vérité

### Performance

**Optimisations** :
- Fetch avec cache côté serveur (1h)
- `v-show` au lieu de `v-if` pour les onglets (évite re-render)
- Lazy loading des composants lourds (charts)
- sessionStorage pour persistence UI

### Compatibilité

**Navigateurs supportés** :
- Chrome/Edge (dernières versions)
- Firefox (dernières versions)
- Safari (dernières versions)
- Mobile responsive (Tailwind breakpoints)

---

## 🐛 Problèmes Résolus

### 1. UTabs ne fonctionnaient pas en prod
**Solution** : Remplacé par boutons simples + v-show

### 2. Erreur 403 sur collection budget_line
**Solution** : Utiliser `getCmsClient()` au lieu de `createDirectus().with(rest())`

### 3. Badges trop gros sur totaux
**Solution** : Réduit taille (`text-xs`, `px-2 py-0.5`) et aligné sur baseline

### 4. Tab se réinitialise au changement de filtre
**Solution** : Sauvegarde dans sessionStorage

### 5. Graphes circulaires pas centrés
**Solution** : `mx-auto` sur composant + `flex justify-center` sur wrapper

---

## 📚 Ressources

**Documentation existante** :
- [budget-model.md](./budget-model.md) - Modèle de données
- [budget-api.md](./budget-api.md) - Endpoints API Directus

**Composables Nuxt** :
- `useBudget.ts` - Logique budget principal
- `useStateEntities.ts` - Gestion entités État
- `useStateEntityDetail.ts` - Détail entité individuelle

**API Directus** :
- REST API : `https://cms.vie-publique.sn/items/[collection]`
- SDK : `@directus/sdk` v11+

---

---

**Dernière mise à jour** : 2025-11-01
**Auteur** : Documentation générée après implémentation dashboard budget v2
