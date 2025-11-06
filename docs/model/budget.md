# Budget – Modèle et règles (version simple)

## 🎯 Objectifs

* Publier le budget par **année** et **version** (PLF / LFI / LFR).
* Afficher les **totaux globaux** et les **répartitions** (dépenses/recettes/financement/Trésor).
* Lister et comparer les **budgets par entité** (ministères, institutions), puis **par programmes** et **projets** si disponibles.
* Gérer **AE & CP** sans complexité (colonnes `amount_cp` et `amount_ae`).
* Relier chaque ligne budgétaire à une **entité de l’État** (`state_entity`) – 1 seule source de vérité.

---

## 🧱 Modèle de données (`budget_*`)

### 1) `budget_year` — *Années budgétaires*

| Champ | Type               | Exemple |
| ----- | ------------------ | ------- |
| id    | UUID               | `…`     |
| year  | int (unique)       | `2026`  |
| note  | string (optionnel) | `—`     |

---

### 2) `budget_version` — *Versions par année*

| Champ        | Type                     | Exemple        |
| ------------ | ------------------------ | -------------- |
| id           | UUID                     | `…`            |
| year         | ref → `budget_year`      | `2026`         |
| label        | enum (`PLF`,`LFI`,`LFR`) | `PLF`          |
| published_at | date                     | `2025-10-30`   |
| document     | file/url                 | `plf-2026.pdf` |

> Une année peut avoir plusieurs versions (PLF, puis LFI, puis LFR).

---

### 3) `budget_line` — *Ligne budgétaire (ministère / programme / projet)*

> **Une seule table** pour tous les niveaux ; **colonnes AE & CP** sur la même ligne.

| Champ         | Type                                  | Exemple                               |
| ------------- | ------------------------------------- | ------------------------------------- |
| id            | UUID                                  | `…`                                   |
| year          | ref → `budget_year`                   | `2026`                                |
| version       | ref → `budget_version`                | `PLF`                                 |
| entity        | ref → `state_entity`                  | `Ministère de la Santé`               |
| level         | enum(`entity`,`program`,`project`)    | `entity`                              |
| code          | string (optionnel)                    | `P1`, `PRJ-001`                       |
| name          | string (optionnel)                    | `Santé primaire`                      |
| section       | enum(`expense`,`revenue`) (optionnel) | `expense`                             |
| category      | string (optionnel)                    | `Personnel`, `Investissement externe` |
| **amount_cp** | number (FCFA)                         | `620000000000`                        |
| **amount_ae** | number (FCFA)                         | `645000000000`                        |
| note          | string (optionnel)                    | `—`                                   |

> **Minimal viable** : n’utiliser que `level=entity` au départ (totaux par ministère).
> Plus tard : ajouter `program` et `project` sans changer le modèle.

**Exemples**

```text
year  version  entity                    level    code    name                         amount_cp        amount_ae
2026  PLF      Ministère de la Santé     entity           —                            620000000000     645000000000
2026  PLF      Ministère de la Santé     program  P1      Hôpitaux & plateaux tech     220000000000     230000000000
2026  PLF      Ministère de la Santé     project  PRJ-1   Hôpital Régional X           90000000000      100000000000
2026  PLF      Ministère des Sports      entity           —                            153000000000     160000000000
```

---

### 4) `budget_global` — *Chiffres clés globaux (non liés à un ministère)*

> Totaux/ratios : recettes, dépenses, déficit (montant & %PIB), PIB, besoin de financement total…

| Champ         | Type                                                                                                             | Exemple            |
| ------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------ |
| id            | UUID                                                                                                             | `…`                |
| year          | ref → `budget_year`                                                                                              | `2026`             |
| version       | ref → `budget_version`                                                                                           | `PLF`              |
| metric        | enum (`total_revenue`,`total_expense`,`deficit_amount`,`deficit_pct_gdp`,`gdp_amount`,`financing_need_total`, …) | `total_expense`    |
| **amount_cp** | number                                                                                                           | `5120000000000`    |
| **amount_ae** | number                                                                                                           | `— ou même valeur` |
| unit          | enum (`XOF`,`%`)                                                                                                 | `XOF`              |
| note          | string (optionnel)                                                                                               | `—`                |

**Exemples**

```text
year  version  metric              amount_cp         unit
2026  PLF      total_revenue       4350000000000     XOF
2026  PLF      total_expense       5120000000000     XOF
2026  PLF      deficit_amount      770000000000      XOF
2026  PLF      deficit_pct_gdp     4.9               %
2026  PLF      gdp_amount          15800000000000    XOF
```

---

### 5) `budget_breakdown` — *Répartitions (camemberts/barres)*

> Dépenses/recettes par catégories, comptés spéciaux du Trésor, financement par source (interne/externe), etc.

| Champ         | Type                                             | Exemple                                                                        |
| ------------- | ------------------------------------------------ | ------------------------------------------------------------------------------ |
| id            | UUID                                             | `…`                                                                            |
| year          | ref → `budget_year`                              | `2026`                                                                         |
| version       | ref → `budget_version`                           | `PLF`                                                                          |
| section       | enum(`expense`,`revenue`,`treasury`,`financing`) | `expense`                                                                      |
| category      | string                                           | `Personnel`, `Investissement interne`, `Impôts`, `Dons`, `Financement externe` |
| **amount_cp** | number                                           | `1532800000000`                                                                |
| **amount_ae** | number                                           | `1540000000000`                                                                |
| note          | string (optionnel)                               | `—`                                                                            |

**Exemples**

```text
year  version  section   category                 amount_cp
2026  PLF      expense   Personnel                1532800000000
2026  PLF      expense   Investissement interne   1448900000000
2026  PLF      revenue   Recettes fiscales        3650000000000
2026  PLF      financing Financement externe      630000000000
2026  PLF      treasury  Comptes spéciaux (total) 95000000000
```

---

## ✅ Règles de gestion

* **AE & CP** : stockés **sur la même ligne** (`amount_cp`, `amount_ae`).

  * L’UI affiche l’un ou l’autre via un **toggle**.
* **Évolutions (Δ & %)** : calculées **à l’affichage** en comparant N à N-1 selon la **même version** par défaut :

  * PLF(N) ↔ LFI(N-1) *(par défaut)*
  * LFI(N) ↔ LFI(N-1)
  * LFR(N) ↔ LFR(N-1)
  * *Fallback* si manquant : comparer à LFI(N-1).
* **Niveaux** :

  * `entity` = total par ministère/institution (**MVP**)
  * `program` / `project` = détails (ajoutables plus tard)
* **Liaison avec l’État** : `budget_line.entity → state_entity.id` (aucun doublon d’entité).

---

## 🧭 Usages côté interface

### A) Accueil Budget

* **KPIs globaux** : `budget_global`
* **Répartitions** : `budget_breakdown` (dépenses/recettes/financement/Trésor)
* **Top 10 ministères** : sum(`budget_line.amount_[cp|ae]`) où `level=entity`

### B) Liste ministères / institutions

* Filtres : Année (`budget_year`), Version (`budget_version`), AE/CP (colonne)
* Somme par `entity` (level=entity), tri descendant

### C) Fiche d’un ministère

1. **Total** : `budget_line(level=entity)` (sum de la colonne AE/CP)
2. **Programmes** : `budget_line(level=program)` (sum)
3. **Projets** : `budget_line(level=project)` (liste + montants)
4. **Évolution N-1** : refaire la même requête sur l’année précédente, calcul Δ & %

> Si tu n’as pas encore `program`/`project`, la fiche affiche uniquement le **total** et l’**évolution** — le reste viendra plus tard **sans changer le modèle**.

---

## 🔗 Lien avec l’Annuaire

* Le champ `budget_line.entity` pointe **`state_entity`** :

  * affichage du **nom officiel** (et recherche robuste via alias),
  * navigation vers la **fiche entité** de l’annuaire,
  * cohérence en cas de **renommage** (on ne recrée pas l’entité).

---

## TL;DR (schéma logique)

```
state_entity  ←─────  budget_line  ───→  budget_version  ───→  budget_year
                             │
                    (level: entity / program / project)

budget_global (KPIs globaux)
budget_breakdown (répartitions)
```

---

## 📌 Notes d’import (PDF → données)

* **PLF / LFI / LFR (PDF)** → extraire tableaux (Tabula/Camelot) → nettoyer → mapper `entity` via `state_alias` → remplir :

  * `budget_global` (totaux/ratios),
  * `budget_breakdown` (catégories),
  * `budget_line` (totaux par entité, puis programmes/projets si dispo).
* Correction **assistée** dans l’admin quand un libellé varie.

---

Si tu veux, je te fournis les **CSV modèles** (exemples PLF 2026) pour tester directement :

* `budget_year.csv`, `budget_version.csv`,
* `budget_global.csv`, `budget_breakdown.csv`,
* `budget_line.csv` (10 ministères + 2 programmes + 2 projets).


## opmitmization

la même règle de nommage partout :

<domain>_<scope>_<object>

Où :

domain = revenue, expense, budget, deficit, debt, treasury, etc.

scope = total, general_budget, special_accounts, internal, external, etc.

object = amount, pct_gdp, count, etc.

👉 Exemple :

revenue_total_amount

revenue_general_budget_amount

expense_total_amount

expense_general_budget_amount

deficit_total_pct_gdp


valeur en milliards
plus lisible dans Directus, plus léger, et suffisant tant que tu travailles à l’échelle “macro” (LFI, LFR, PLF, etc.).
