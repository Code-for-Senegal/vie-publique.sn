# 🧾 Budget – Modèle et Règles (mise à jour 2026)

## 🎯 Objectifs

* Publier le **budget par année et version** (PLF / LFI / LFR)
* Afficher les **indicateurs globaux** : budget total, recettes, dépenses, déficit, dette, besoins de financement…
* Gérer les **comparaisons d’années et de versions**
* Relier les données macro à des **lignes budgétaires** (ministères, programmes, projets)
* Préparer un modèle stable pour les dashboards Vie-publique.sn

---

## 🧱 Modèle de données

### 1️⃣ `budget_year` — *Années budgétaires*

| Champ  | Type                          | Description         | Exemple          |
| ------ | ----------------------------- | ------------------- | ---------------- |
| id     | int                           | ID interne          | 3                |
| year   | int                           | Année budgétaire    | 2026             |
| note   | string                        | Note optionnelle    | "Année en cours" |
| status | string (`draft`, `published`) | État de publication | "published"      |

---

### 2️⃣ `budget_version` — *Version budgétaire par année*

| Champ  | Type                         | Description           | Exemple     |
| ------ | ---------------------------- | --------------------- | ----------- |
| id     | int                          | ID interne            | 5           |
| year   | ref → `budget_year`          | Année correspondante  | 2026        |
| label  | string (`PLF`, `LFI`, `LFR`) | Version du budget     | "LFI"       |
| status | string                       | Statut de publication | "published" |

> 🔁 Une année peut avoir plusieurs versions : PLF, LFI, LFR.

---

### 3️⃣ `budget_metric` — *Référentiel des indicateurs budgétaires*

> Table statique définissant les codes, labels, unités, et groupes d’indicateurs.

| Champ         | Type   | Description                                                                     | Exemple                        |
| ------------- | ------ | ------------------------------------------------------------------------------- | ------------------------------ |
| id            | int    | Identifiant unique                                                              | 12                             |
| code          | string | Nom machine unique                                                              | `revenue_total`                |
| label_fr      | string | Libellé français                                                                | "Recettes totales"             |
| unit          | string | Unité d’affichage (`mds_fcfa`, `%`)                                             | "mds_fcfa"                     |
| description   | string | Description complète                                                            | "Total des recettes de l’État" |
| group         | string | Groupe logique (`global`, `revenues`, `expenses`, `debt`, `financing`, `macro`) | "global"                       |
| display_zone  | string | Zone d’affichage sur le dashboard (`resume`, `details`, `summary`)              | "resume"                       |
| display_order | int    | Ordre d’affichage                                                               | 2                              |
| color         | string | Couleur associée                                                                | `#1A73E8`                      |

---

### 4️⃣ `budget_global` — *Valeurs globales des indicateurs macro*

> Enregistre les valeurs des metrics pour chaque année/version.

| Champ   | Type                   | Description               | Exemple             |
| ------- | ---------------------- | ------------------------- | ------------------- |
| id      | int                    | Identifiant               | 102                 |
| year    | ref → `budget_year`    | Année budgétaire          | 2026                |
| version | ref → `budget_version` | Version (PLF / LFI / LFR) | 5                   |
| metric  | ref → `budget_metric`  | Type d’indicateur         | 1 (`budget_total`)  |
| amount  | decimal                | Valeur en milliards FCFA  | 6614.0              |
| note    | string                 | Note optionnelle          | "Source : PLF 2026" |
| status  | string                 | Statut de publication     | "published"         |

> 💡 Toutes les valeurs sont en **milliards FCFA (mds_fcfa)** pour lisibilité et cohérence avec l’affichage.

* optimisation

Je suggère de supprimer les totaux financing_need_total et debt_service_total de la base de données et de les calculer côté frontend. Voici pourquoi :
Avantages de cette approche :
Évite la duplication de données - Le total est dérivé des composantes, pas une donnée indépendante
Évite les incohérences - Si vous stockez le total ET les composantes, vous risquez des désynchronisations
Plus maintenable - Une seule source de vérité (les composantes)
Déjà implémenté - Votre code fait déjà le calcul pour publicDebt, il suffit de faire pareil pour treasuryOperations

Oui, absolument ! Vous devriez appliquer la même logique pour expense_total_general_budget et revenue_total_general_budget.
Analyse :
Ces totaux sont calculables à partir de leurs composantes :
revenue_total_general_budget = somme de toutes les recettes (fiscales, non fiscales, etc.)
expense_total_general_budget = somme de toutes les dépenses


### 5️⃣ `budget_line` — *Lignes budgétaires (par entité, programme, projet)*


lister les ministères (ceux de state_entity)

leur associer un montant AE/CP pour une année et une version

quand on clique sur un ministère → afficher ses programmes (et plus tard ses projets)

garder tout ça dans une seule collection avec une hiérarchie

But : stocker toutes les lignes budgétaires d’un budget donné (ministère, programme, projet) en les liant :

à une année (budget_year)

à une version (budget_version)

à une entité de l’État (state_entity)

et en gardant une hiérarchie (ministère → programme → projet)

| Champ       | Type                       | Obligatoire                | Description                                              |
| ----------- | -------------------------- | -------------------------- | -------------------------------------------------------- |
| `id`        | auto                       | oui                        | PK Directus                                              |
| `status`    | status                     | non                        | published/draft                                          |
| `year`      | M2O → `budget_year`        | ✅ oui                      | l’exercice (2024, 2025, 2026…)                           |
| `version`   | M2O → `budget_version`     | ✅ oui                      | LFI, LFR, PLF…                                           |
| `entity`    | M2O → `state_entity`       | ✅ pour le niveau ministère | le ministère / institution concerné(e)                   |
| `parent`    | M2O → `budget_line` (self) | optionnel                  | permet de lier un programme à son ministère              |
| `level`     | enum                       | ✅ oui                      | `ministry` / `program` / `project`                       |
| `code`      | string                     | conseillé                  | code officiel du programme/projet si présent dans le PDF |
| `label`     | string                     | ✅ oui                      | libellé officiel de la ligne dans le budget              |
| `amount_ae` | decimal                    | ✅ oui                      | Montant en **AE**                                        |
| `amount_cp` | decimal                    | ✅ oui                      | Montant en **CP**                                        |
| `sort`      | integer                    | non                        | pour garder l’ordre du PDF                               |
| `note`      | text                       | non                        | page PDF / commentaires / anomalies                      |


## 🧩 Relations principales

```
budget_year ──┬── budget_version ──┬── budget_global
               │                    └── budget_metric
               └── budget_line
```

---

## 📊 Exemples d’utilisation

### KPIs (Budget Global)

| Metric          | Année | Version | Valeur (Mds FCFA) |
| --------------- | ----- | ------- | ----------------- |
| budget_total    | 2026  | LFI     | 7177,2            |
| revenue_total   | 2026  | LFI     | 6188,8            |
| expense_total   | 2026  | LFI     | 7177,2            |
| deficit_total   | 2026  | LFI     | -1245,1           |
| deficit_pct_gdp | 2026  | LFI     | -5,37             |
| gdp_total       | 2026  | LFI     | 23170,0           |

### Recettes

| Metric                            | Valeur | Description                |
| --------------------------------- | ------ | -------------------------- |
| revenue_tax_total                 | 5384,8 | Recettes fiscales          |
| revenue_non_tax_total             | 355,9  | Recettes non fiscales      |
| revenue_external_grants_capital   | 145,2  | Dons en capital            |
| revenue_external_grants_budgetary | 46,3   | Dons budgétaires           |
| revenue_special_accounts          | 256,7  | Comptes spéciaux du Trésor |

### Dépenses

| Metric                      | Valeur | Description                                       |
| --------------------------- | ------ | ------------------------------------------------- |
| expense_interest            | 1190,6 | Intérêts et commissions                           |
| expense_personnel           | 1532,8 | Dépenses de personnel                             |
| expense_goods_services      | 1650,0 | Biens et services                                 |
| expense_investment_domestic | 1448,9 | Dépenses d’investissement sur ressources internes |
| expense_investment_external | 1355,0 | Dépenses d’investissement sur ressources externes |
| expense_special_accounts    | 256,7  | Comptes spéciaux du Trésor                        |

### Financement

| Metric                           | Valeur | Description                 |
| -------------------------------- | ------ | --------------------------- |
| financing_need_total             | 6075,3 | Besoin total de financement |
| financing_debt_amortization      | 4307,4 | Amortissement de la dette   |
| financing_arrears_domestic       | 300,0  | Arriérés intérieurs         |
| financing_onlending_retrocession | 172,8  | Emprunts rétrocédés         |
| financing_opex_deficit           | 50,0   | Couverture déficit OPEX     |

---

## 🧮 Bonnes pratiques de nommage

| Domaine   | Portée              | Objet   | Exemple complet               |
| --------- | ------------------- | ------- | ----------------------------- |
| budget    | total               | —       | `budget_total`                |
| revenue   | total               | —       | `revenue_total`               |
| expense   | investment_domestic | —       | `expense_investment_domestic` |
| deficit   | total               | pct_gdp | `deficit_total_pct_gdp`       |
| financing | debt_amortization   | —       | `financing_debt_amortization` |

Formule :
`<domain>_<scope>_<object>`

> Ex : `expense_total`, `revenue_special_accounts`, `deficit_total_pct_gdp`

---

## ⚙️ Notes de gestion

* **Comparaisons** :
  Le front peut comparer N et N-1 en filtrant par `version` + `year`
  → Ex : LFI 2026 vs LFI 2025.
* **Unités** :
  Tout en **milliards FCFA** sauf pour les ratios en %.
* **Évolutions** :
  Δ calculé côté front `(val_N - val_N-1)` et `% = Δ / val_N-1 * 100`.

