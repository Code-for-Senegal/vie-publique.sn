# Page Détail Budget d'une Entité (Ministère/Institution)

## 🎯 Objectif

Afficher le budget détaillé d'un ministère ou d'une institution avec :
1. **Budget total actuel** (dernière année disponible)
2. **Évolution du budget** par année (graphique histogramme)
3. **Répartition par programmes** (dernière année)

## 📍 Route

```
/budget-senegal/[slug]
```

Exemple : `/budget-senegal/ministere-de-l-agriculture-de-la-souverainete-alimentaire-et-de-l-elevage`

## 🔄 Flux de données

### 1️⃣ Appel API : `/api/budget/entity/[slug]`

**Paramètre** : `slug` (public_slug de l'entité dans `state_entity`)

**Requêtes Directus** :

#### ✅ Solution optimale (implémentée)

```typescript
// UNE SEULE REQUÊTE : Récupérer TOUTES les lignes budgétaires de l'entité
GET /items/budget_line
  ?filter[entity.public_slug][_eq]=slug
  &filter[status][_eq]=published
  &fields=id,year,version,level,label,code,amount_ae,amount_cp,entity.id,entity.name,entity.public_slug,version.label
  &sort=-year,-level
```

**Traitement côté serveur** :
1. Extraire les infos de l'entité depuis `allBudgetLines[0].entity`
2. Séparer par `level` : `ministry/institution` et `program`
3. Déterminer le `level` réel (ministry ou institution) depuis les données
4. Grouper les lignes `ministry/institution` par année → évolution
5. Filtrer les programmes de la dernière année
6. Calculer les variations en cherchant dans `programLines` (déjà récupérées)

**Avantages** :
- ✅ **1 seule requête Directus** au lieu de 4+
- ✅ Pas besoin de `state_entity` (infos déjà dans `budget_line.entity`)
- ✅ Pas de correspondance `type.code` → `level` (on utilise directement `budget_line.level`)
- ✅ Variations calculées sans requêtes supplémentaires (données déjà en mémoire)
- ✅ Plus simple, plus rapide, cache unique

---

## 📊 Données retournées par l'API

```typescript
{
  entity: {
    id: number,
    name: string,
    public_slug: string
  },
  level: "ministry" | "institution",  // Déduit des lignes budgétaires
  evolution: [
    {
      year: 2024,
      amount_cp: 150.5,
      version_label: "LFI"
    },
    {
      year: 2025,
      amount_cp: 180.2,
      version_label: "LFI"
    }
  ],
  latestYear: {
    year: 2025,
    amount_cp: 180.2,
    version_label: "LFI"
  },
  programs: [
    {
      id: 123,
      label: "Programme Agriculture Durable",
      code: "P001",
      amount_cp: "50.5",
      variation_percentage: "+15.2%",
      variation_color: "green"
    }
  ]
}
```

## 🎨 Affichage Frontend

### Composant : `BudgetEntityOverview`
- Affiche le budget total de la dernière année
- Badge de variation vs année N-1

### Composant : `BudgetEntityEvolutionChart`
- Graphique D3.js (histogramme)
- Une barre par année
- Labels avec montants

### Composant : `BudgetEntityProgramsTable`
- Tableau style `Budget2TableRevenueExpense`
- Une ligne par programme
- Badges de variation (vert/rouge/gris)
- Barres de progression (% du total)

## 🔗 Navigation et Architecture Multi-Pages

### Deux pages distinctes pour les entités

#### Page Budget : `/budget-senegal/[slug]`
**Focus** : Données budgétaires et financières

- Budget total + variation
- Évolution multi-années (graphique)
- Programmes + variations
- (À venir) Projets budgétaires

**Audience** : Analystes budgétaires, journalistes économiques, citoyens intéressés par les finances publiques

#### Page Annuaire : `/etat-senegal/annuaire/[slug]`
**Focus** : Organisation administrative et informations générales

- Description, mission
- Direction, coordonnées
- Historique, décrets
- Entités rattachées
- (À venir) Actualités, documents, réseaux sociaux

**Audience** : Citoyens cherchant des services, chercheurs, administrations

### Liens croisés entre les pages

**Depuis la page budget** → Vers la page annuaire :
```vue
<!-- Bouton centré sous le titre -->
<UButton
  :to="`/etat-senegal/annuaire/${entity.public_slug}`"
  variant="outline"
  color="primary"
  icon="i-heroicons-building-office-2"
>
  Voir la fiche complète de cette entité
</UButton>
```

**Depuis la page annuaire** → Vers la page budget :
```vue
<!-- Section Budget dans la colonne latérale -->
<UCard>
  <h2>Budget</h2>
  <p>Consultez le budget détaillé, l'évolution par année et la répartition par programmes.</p>
  <UButton
    :to="`/budget-senegal/${entity.public_slug}`"
    color="primary"
    icon="i-heroicons-chart-bar"
    block
  >
    Voir le budget détaillé
  </UButton>
</UCard>
```

### Avantages de cette approche

✅ **Séparation des préoccupations** : Chaque page a un objectif clair et une audience ciblée

✅ **Performance** : Pages plus légères, temps de chargement réduit (pas de surcharge de données inutiles)

✅ **SEO** : Deux URLs distinctes = deux opportunités de référencement avec des mots-clés différents

✅ **UX** : Navigation intuitive avec liens croisés visibles, parcours utilisateur clair

✅ **Évolutivité** : Facile d'ajouter des fonctionnalités à chaque page indépendamment sans impacter l'autre

✅ **Maintenance** : Code mieux organisé, responsabilités clairement définies

### Navigation depuis le dashboard

**Depuis le dashboard budget** (`/budget-senegal/index.vue`) :
- Onglet "Ministères" → tableau avec liens vers `/budget-senegal/[slug]`
- Onglet "Institutions" → tableau avec liens vers `/budget-senegal/[slug]`

**Composant** : `Budget2TableMinistryV2`
```vue
<NuxtLink :to="`/budget-senegal/${ministry.entity.public_slug}`">
  {{ ministry.entity.name }}
</NuxtLink>
```

**Depuis l'annuaire** (`/etat-senegal/annuaire`) :
- Liste des entités → liens vers `/etat-senegal/annuaire/[slug]`
- De là, bouton "Voir le budget détaillé" → `/budget-senegal/[slug]`

## ⚡ Optimisations

### Cache Nitro
```typescript
defineCachedEventHandler(handler, {
  maxAge: 60 * 60,  // 1 heure
  getKey: (event) => `budget-entity-${slug}`
})
```

### SSR
- Utilisation de `useFetch` dans le composable
- Données dans le HTML initial → SEO optimal

## 📝 Notes importantes

1. **Pas de correspondance directe** entre `state_entity.type.code` et `budget_line.level`
2. **Source de vérité** : `budget_line.level` (ministry/institution/program)
3. **Variation des programmes** : calculée uniquement si année N-1 existe avec le même `code`
4. **Si pas de variation** : afficher le montant sans badge

## 🔢 Logique de Calcul des Variations (Programmes)

### Approche de comparaison

**Principe** : Comparaison année sur année (N vs N-1) sans priorité de version

1. **Critère de correspondance** : Match par `code` du programme
   - Exemple : programme avec `code="P001"` en 2025 vs programme `code="P001"` en 2024

2. **Formule de variation** :
   ```
   variation = ((montant_année_N - montant_année_N-1) / montant_année_N-1) × 100
   ```

3. **Cas particuliers** :
   - Si montant N-1 = 0 → `variation_percentage = "N/A"`
   - Si programme absent en N-1 → `variation_percentage = "N/A"`
   - Si `code` différent entre années → pas de correspondance possible

4. **Couleur du badge** :
   - Variation positive (+) → vert
   - Variation négative (-) → rouge
   - Aucune variation (0%) → gris

### Limitation actuelle

⚠️ **Pas de priorité de version** : La comparaison se fait sur les montants bruts disponibles pour chaque année, sans distinction entre PLF/LFI/LFR. Si une année a plusieurs versions, la dernière requêtée sera utilisée (comportement non déterministe).

**Amélioration future** : Implémenter le même système de priorité LFR > LFI > PLF que pour l'évolution globale.

## 🐛 Points d'attention

- ⚠️ Une entité peut avoir des données sur plusieurs années avec différentes versions (PLF/LFI/LFR)
- ⚠️ Pour l'évolution du budget total de l'entité, on prend la **dernière version disponible** pour chaque année (actuellement : pas de priorité implémentée, contrairement aux graphiques d'évolution globale)
- ⚠️ Les programmes peuvent changer de `code` d'une année à l'autre → pas de variation affichée
- ⚠️ Certaines entités peuvent n'avoir que `ministry` OU `institution`, pas les deux
- ⚠️ La variation des programmes est calculée sans système de priorité de version (à implémenter)
