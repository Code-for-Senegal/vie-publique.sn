
## ✅ Checklist Développement

**Pour continuer l'implémentation** :

### Phase 1 : Landing Page Budget

- [x] Créer la page `/budget` (landing page générale)
- [x] Ajouter section Hero sobre sans CTA
- [x] Ajouter Dashboard Card avec 4 cartes KPI (Dépenses, Recettes, Déficit, CTA)
- [x] Optimiser responsive : 2 colonnes mobile, 2 zones desktop (3 cartes + texte intro)
- [x] Ajouter section Ressources (Ministères, Institutions, Documents)
- [x] Créer composant `BudgetBudgetArticles.vue` pour afficher les articles
- [x] Vérifier/ajouter catégorie "budget" dans le CMS
- [x] Ajouter section "Comprendre le Budget" avec 3 derniers articles
- [x] Créer la page `/budget/glossaire` avec termes budgétaires
- [x] Créer l'API `/api/budget/glossary` pour servir les données
- [x] Créer le fichier JSON `server/data/budget-glossary.json`
- [x] Ajouter le lien `/budget` dans le menu principal
- [x] Ajouter textes descriptifs sur dashboard (recettes, dépenses, financement, dette)

### Phase 2 : Variations et Détails Entités

- [x] Ajouter variations sur tableaux ministères/institutions
- [x] API `/api/budget/ministries` : Ajout paramètres `compareYear` et `compareVersion`
- [x] Calcul variations côté serveur avec matching ID entités (fix object vs number)
- [x] Cache key incluant paramètres de comparaison
- [x] Select de comparaison sur pages `/budget/ministeres` et `/budget/institutions`
- [x] Options filtrées : uniquement versions antérieures
- [x] Réinitialisation auto quand changement version principale
- [x] Badge variation sur ligne séparée après barre de progression (aligné à droite)
- [x] Calcul poids budgétaire basé sur `expense_total` global (pas total ministères)
- [x] Fetch budget global dans `Budget2TableMinistryV2` pour calcul pourcentage
- [x] Intégration variations dans dashboard `/budget-senegal` (onglets Ministères/Institutions)
- [x] Props `compareYear` et `compareVersion` passées à `MinistryTable`
- [ ] Ajouter les projets, page dédiée et onglet
- [ ] Ajouter données 2026
- [ ] Ajouter des pages par indicateur global (déficit, recettes, dépenses) avec évolution temporelle
- [ ] Ajouter tooltips et zoom sur graphiques
- [ ] Support export PNG/SVG des graphiques
- [ ] Tester avec données réelles 2025/2026
- [ ] Documenter structure hiérarchique programme/projet
- [ ] Ajouter tests unitaires sur calculs variations
- [ ] Optimiser performance chargement données
- [ ] Tests E2E sur navigation et graphiques
- [ ] Validation accessibilité (WCAG 2.1)
- [ ] Améliorer les graphiques d'évolution (tooltips, zoom, annotations)
- [ ] Export des données (CSV/Excel)
- [ ] Ajouter des fonctionnalités de filtres et recherche (par nom, tranche de budget)
- [ ] Graphique évolution déficit
- [ ] Évolution taux de croissance
- [ ] Pression fiscale

### Phase 3 : Session Actuelle - Résumé des Modifications ✅ **TERMINÉE**

**Date** : 2025-11-06

#### 1. Système de Comparaison pour Ministères/Institutions

**Fichiers modifiés** :
- `server/api/budget/ministries.get.ts`
- `app/pages/budget/ministeres/index.vue`
- `app/pages/budget/institutions/index.vue`
- `app/components/Budget/Budget2TableMinistryV2.vue`
- `app/components/MinistryTable.vue`
- `app/pages/budget-senegal/index.vue`

**Fonctionnalités ajoutées** :
- ✅ Select de comparaison avec icône `arrows-right-left`
- ✅ Filtrage automatique des versions antérieures
- ✅ Calcul variations côté serveur (API)
- ✅ Badge variation aligné à droite après barre progression
- ✅ Cache intelligent avec clé incluant comparaison
- ✅ Fix matching entités (object vs number)

#### 2. Calcul Poids Budgétaire sur Budget Global

**Problème résolu** :
- Avant : Pourcentage calculé sur total ministères/institutions uniquement
- Après : Pourcentage basé sur `expense_total` du budget global

**Implémentation** :
- Fetch `/api/budget/global` dans `Budget2TableMinistryV2`
- Extraction `expense_total` depuis `allMetrics`
- Calcul : `(montant_ministère / expense_total) * 100`

#### 3. Landing Page `/budget` - Responsive Mobile

**Problème résolu** :
- Dashboard cards prenaient trop de place sur mobile (1 colonne)

**Solution** :
- Grid 2x2 sur mobile (`grid-cols-2`)
- Ajout 4ème carte CTA "Tableau de bord complet" (visible mobile uniquement)
- Desktop : 2 zones (3 cartes + texte intro)
- Gain de 50% d'espace vertical sur mobile

**Layout** :
```
Mobile (2x2):
[Dépenses] [Recettes]
[Déficit]  [CTA]

Desktop (2fr,1fr):
[Dépenses] [Recettes] [Déficit] | [Texte intro PLF 2026]
                      [CTA Footer commun]
```

#### 4. Documentation Mise à Jour

**Fichiers mis à jour** :
- `docs/guidelines/budget/budget-dashboard-improvements.md`
- `docs/guidelines/budget/budget-todo.md`

**Ajouts** :
- Section détaillée sur système de comparaison
- Documentation calcul poids budgétaire
- Explication layout responsive landing page
- Checklist mise à jour avec items complétés


## TMP

Entièrement responsive
Animations et transitions fluides
Formatage des nombres en format monétaire FCFA
Interactivité sur les cartes et tableaux
Code TypeScript pour la sécurité du typage
Utilisation des composants NuxtUI pour une cohérence visuelle
Visualisations D3.js pour des graphiques riches et interactifs

crée une page dashboard qui inclut :

Une série de cartes pour les chiffres clés avec variations
Un graphique circulaire montrant la répartition du budget
Un graphique linéaire montrant l'évolution de la dette
Un tableau détaillé des variations par institution
