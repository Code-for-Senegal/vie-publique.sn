# Dashboard Projets publics (PIP / PRES)

> Fusion des anciennes notes `dashboard/dashbord-projets.md`, `dashboard/promp-dashbord-projet.md`,
> `dashboard/promp-2.md` et `guidelines/project/project.md`. Doc de référence de la logique métier
> du dashboard projets. Voir aussi [`dashboard-ui.md`](./dashboard-ui.md) (règles design des
> dashboards) et [`dashboard-rac.md`](./dashboard-rac.md) (dashboard RAC).

## Besoin

Faciliter la compréhension des politiques publiques et le suivi des projets de l'État via un
dashboard public de suivi des **projets publics / projets prioritaires / projets PRES**.

Navigation cible : **stratégie → axe → projet** (Sénégal 2050 → Axe → Projets).

## ⚠️ Règles métier CRITIQUES (anti-confusion budgétaire)

La donnée n'est **pas homogène** — deux logiques coexistent :

1. **PIP** (projets d'investissement) → **budget total projet** (`public_project.budget_total_amount`) — logique « stock ».
2. **PRES** (sous-ensemble stratégique, LFI 2026) → **budgets annuels AE/CP** (`public_project_budget_year` : `amount_ae`, `amount_cp`, `year`, `version`) — logique « exécution ».

Règles à respecter absolument :

- **Ne JAMAIS confondre ni additionner** `budget_total_amount`, `amount_ae` (autorisation
  d'engagement) et `amount_cp` (crédit de paiement).
- Les KPI financiers annuels se calculent depuis `public_project_budget_year` selon
  l'année/version filtrées ; le budget total projet s'affiche **séparément**.
- Labels UI explicites : « Budget total projet », « AE 2026 », « CP 2026 ».
- Donnée absente → afficher « non documenté » proprement, sans casser l'interface.
- Tous les projets actuels sont des projets d'investissement (logique PIP) ; PRES est un
  **sous-ensemble** (`is_in_pres`), pas une catégorie disjointe.

Deux logiques de classement (ne pas mélanger) :

- **logique administrative** (ministère) → *qui porte* le projet
- **logique fonctionnelle** (secteur) → *à quoi ça sert*

## Modèle de données (Directus)

Collections principales :

| Collection | Rôle |
| --- | --- |
| `public_project` | Référentiel unique des projets (« ce projet existe », même sans ligne budgétaire) |
| `public_project_budget_year` | Budget annuel par projet et par version budgétaire (AE/CP/year/version) |
| `public_policy` | Stratégies / axes (Sénégal 2050) |
| `public_project_sector` | Secteurs fonctionnels |
| `state_entity` | Ministères (annuaire) |
| `documents` | Documents liés |

Champs utiles de `public_project` : `title`, `slug`, `summary`, `description`, `code`,
`budget_total_amount`, `is_pres` / `is_in_pres`, `is_in_pip`, `is_priority`, `ministry`,
`sector`, `policy_primary`, `region_primary_label`, `document_primary`, `sector_label`,
`policy_primary_label`, `ministry_label`, `source_ref`.

Pourquoi une table de budgets annuels séparée (et pas les projets dans `budget_line`) : trois cas
de sources différentes — projets listés dans la LFI, projets détaillés seulement dans l'ex-ante,
projets annoncés/hérités hors LFI. Un projet peut avoir 0, 1 ou plusieurs lignes
(projet, année, version, montants) → permet le financement pluriannuel et la comparaison
2025 vs 2026.

Patterns d'appel (Directus) :

```
# Financement pluriannuel d'un projet (page détail → graphe)
GET /items/public_project_budget_year
  ?filter[project][_eq]=42
  &fields=year,version,amount_ae,amount_cp
  &sort=year

# Tous les projets (annuaire, indépendant d'une LFI)
GET /items/public_project
  ?fields=id,code,title,ministry_label,status
```

## Organisation des dashboards (3 vues, 1 socle)

**Ne pas recréer 3 pages différentes** : une base commune avec configuration (mode), mêmes
composants, mêmes filtres, factorisation maximale.

| Vue | URL | Filtre | Orientation | KPI |
| --- | --- | --- | --- | --- |
| Global | `/observatoire/projets-publics` | tous | combinée | KPI séparés : budget total (PIP), total AE, total CP |
| PRES | `…/pres` | `is_in_pres = true` | exécution (AE/CP) | nb projets PRES, nb ministères, total AE/CP (année sélectionnée), répartition par secteur |
| PIP | `…/pip` | `is_in_pres = false` | stock (budget total) | nb projets, budget total, nb ministères, nb secteurs |

Badges visuels (tableau + fiche projet + cartes) : **PRES → badge vert**, **PIP → badge bleu**.

Colonne budget du tableau : PIP → « Budget total projet » ; PRES → « AE / CP année sélectionnée » ;
global → les deux, lisiblement.

## Structure fonctionnelle

**Page liste / dashboard** : KPI (nb projets, nb PRES, nb ministères, nb secteurs, total AE/CP de
l'année/version sélectionnée) · filtres (recherche texte, année, version budgétaire, axe/policy,
secteur, ministère, région, PRES/non PRES) · visualisations (répartition par secteur, par
ministère, carte par région si simple) · tableau (projet, axe, secteur, ministère, région,
budget total, budget annuel sélectionné, lien détail).

**Page détail projet** : header + badges (PRES/PIP) · informations clés (ministère, secteur,
axe/policy, région, source) · budget global (si disponible) · budgets annuels AE/CP (tableau ou
graphique d'évolution) · documents liés · métadonnées/source.

**Fiche axe** : description, objectifs, projets associés. **Fiche stratégie** : description
globale, axes, indicateurs.

## Contraintes d'implémentation

- Réutiliser l'architecture Nuxt 4 existante (composables, SDK Directus, conventions du projet —
  cf. [`guideline-api.md`](../../guidelines/guideline-api.md)) ; **pas** d'architecture parallèle.
- Bien distinguer données brutes et données normalisées ; code compatible SEO.
- Priorité à la lisibilité citoyenne : structure simple, pas de surcharge, V1 solide et évolutive.
