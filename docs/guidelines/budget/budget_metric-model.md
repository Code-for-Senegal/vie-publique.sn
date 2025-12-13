
## design front

le design montre trois niveaux d’information :
- Bloc résumé global (top cards)
- Blocs “répartition” groupés par nature (recettes / dépenses / trésorerie)
- Graphiques ou ratios dérivés (comme % du PIB)

## approche

* Collection : budget_global

Tu la gardes comme maintenant :

version → M2O vers budget_version

metric_ref → M2O vers budget_metric

amount → montant en milliards FCFA (nombre décimal)

status, year etc.




* Aucun affichage hardcodé côté front.

Tu peux réorganiser l’affichage en changeant simplement display_zone ou display_order.

Tu peux ajouter des metrics sans re-déployer le frontend.

Tu pourras traduire ou styliser directement depuis Directus.

## règle de nommage

```
<domain>_<scope>_<object>
```

Où :

domain = revenue, expense, budget, deficit, debt, treasury, etc.

scope = total, general_budget, special_accounts, internal, external, etc.

object = amount, pct_gdp, count, etc.

| Élément              | Convention                                                                                                                 | Exemple                                                     |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| **Préfixe logique**  | indique la nature de la donnée : `revenue_`, `expense_`, `deficit_`, `debt_`, `financing_`, `budget_`, `gdp_`              | ex. `revenue_tax_total`                                     |
| **Nom descriptif**   | décrit le périmètre ou la catégorie                                                                                        | ex. `general_budget`                                        |
| **Suffixe éventuel** | facultatif : `amount` **uniquement si nécessaire** (si tu as d’autres types de valeurs comme des taux, pourcentages, etc.) | ex. `deficit_pct_gdp` = % du PIB, `deficit_total` = montant |



## cahmps

| Champ            | Type               | Rôle / exemple                                                                |
| ---------------- | ------------------ | ----------------------------------------------------------------------------- |
| `code`           | text (unique)      | `revenue_total`, `expense_total`, `deficit_amount`, etc.                      |
| `label_fr`       | text               | “Recettes totales”, “Dépenses totales”, “Déficit budgétaire”                  |
| `group`          | enum               | Catégorie logique (`summary`, `revenue`, `expense`, `treasury`, `debt`) → pour grouper visuellement|
| `unit`           | enum               | `fcfa`, `mds_fcfa`, `percent`, `percent_gdp`                                              |
| `display_order`  | integer            | Pour trier ton affichage dans chaque bloc  (de haut en bas)                                     |
| `display_zone`   | enum               | Pour dire *où* afficher : `top_summary`, `chart_revenue`, `chart_expense`, `chart_treasury`, etc.|
| `color`          | text               | ex: `#2e7d32` ou `#1976d2`, Pour harmoniser les graphiques   |
| `icon`           | text               | ex: `arrow-up`, `pie-chart`, etc.                                             |
| `description`    | text               | info bulle ou tooltip                                                         |
| `is_highlighted` | boolean            | ex: `true` pour “Budget total” ou “Déficit”                                   |
| `formula`        | string (optionnel) | ex: `expense_total - revenue_total`                                           |
                                                                  |



unit : mrd_fcfa (milliards FCFA), percent (pourcent du PIB).

group (pilotage logique) : summary, revenue, expense, special_accounts, treasury, financing, totals.

display_zone (pilotage UI) : top_summary, chart_revenue, chart_expense, chart_special_accounts, chart_treasury, chart_financing, chart_totals.

status : published par défaut (tu peux ajuster à draft si besoin).

color : suggestions hex (facultatif, tu peux laisser vide).

## Structure normalisée finale des metrics

🟩 BLOC 1 — BUDGET GLOBAL (Résumé haut du dashboard)

| code                           | label_fr                            | unit        | description                                |
| ------------------------------ | ----------------------------------- | ----------- | ------------------------------------------ |
| budget_total_amount            | Budget total (Ressources + Charges) | fcfa        | Volume global du budget de l’État          |
| budget_general_amount          | Budget général (hors CST)           | fcfa        | Montant du budget général                  |
| budget_special_accounts_amount | Comptes spéciaux du Trésor (CST)    | fcfa        | Volume global des CST                      |
| deficit_amount                 | Déficit budgétaire global           | fcfa        | Dépenses totales - Recettes totales        |
| deficit_pct_gdp                | Déficit budgétaire (% du PIB)       | percent_gdp | Poids du déficit dans le PIB               |
| gdp_total_amount               | Produit intérieur brut (PIB)        | fcfa        | PIB nominal pour l’exercice                |
| growth_total_pct               | Taux de croissance du PIB           | percent     | Croissance réelle du PIB                   |
| financing_need_total_amount    | Besoin de financement total         | fcfa        | Total à couvrir (dette, arriérés, déficit) |


🟨 BLOC 2 — RECETTES (REVENUE)

| code                            | label_fr                                | unit | description                                  |
| ------------------------------- | --------------------------------------- | ---- | -------------------------------------------- |
| revenue_total_amount            | Recettes totales                        | fcfa | Recettes budgétaires totales (Budget général + CST) |
| revenue_general_budget_amount   | Recettes du budget général              | fcfa | Total recettes internes + externes           |
| revenue_special_accounts_amount | Recettes des comptes spéciaux du Trésor | fcfa | Recettes des CST                             |
| revenue_internal_total_amount   | Recettes internes totales               | fcfa | Fiscales + non fiscales                      |
| revenue_external_total_amount   | Recettes externes totales               | fcfa | Dons budgétaires + dons en capital           |
| revenue_fiscal_amount           | Recettes fiscales                       | fcfa | Impôts et taxes                              |
| revenue_nonfiscal_amount        | Recettes non fiscales                   | fcfa | Redevances, dividendes, amendes, etc.        |
| revenue_grants_budget_amount    | Dons budgétaires                        | fcfa | Dons destinés au budget                      |
| revenue_grants_capital_amount   | Dons en capital                         | fcfa | Dons d’investissement                        |
| revenue_internal_pres_amount    | Recettes internes PRES                  | fcfa | Recettes issues du Plan de Redressement      |
| revenue_special_funds_amount    | Fonds affectés / spéciaux               | fcfa | Ex. fonds de stabilisation, retraites, etc.  |


🟥 BLOC 3 — DÉPENSES (EXPENSE)

| code                                    | label_fr                                        | unit | description                              |
| --------------------------------------- | ----------------------------------------------- | ---- | ---------------------------------------- |
| expense_total_amount                    | Dépenses totales                                | fcfa | Dépenses globales (Budget général + CST) |
| expense_general_budget_amount           | Dépenses du budget général                      | fcfa | Ensemble des charges principales         |
| expense_special_accounts_amount         | Dépenses des comptes spéciaux du Trésor         | fcfa | Charges des CST                          |
| expense_interest_commissions_amount     | Intérêts et commissions                         | fcfa | Service de la dette (intérêts)           |
| expense_wage_bill_amount                | Dépenses de personnel                           | fcfa | Masse salariale                          |
| expense_goods_services_amount           | Biens et services                               | fcfa | Fonctionnement courant                   |
| expense_transfers_current_amount        | Transferts courants                             | fcfa | Subventions, aides, etc.                 |
| expense_functioning_total_amount        | Fonctionnement total                            | fcfa | Biens et services + transferts           |
| expense_capital_internal_amount         | Dépenses d’investissement (ressources internes) | fcfa | Capex internes                           |
| expense_capital_external_amount         | Dépenses d’investissement (ressources externes) | fcfa | Capex financés par prêts/dons            |
| expense_investment_total_amount         | Investissements totaux                          | fcfa | Capex internes + externes                |
| expense_internal_resources_total_amount | Total dépenses sur ressources internes          | fcfa | Fonctionnement + capital interne         |
| expense_external_resources_total_amount | Total dépenses sur ressources externes          | fcfa | Fonctionnement + capital externe         |
| expense_social_funds_amount             | Dépenses sociales (pensions, aides)             | fcfa | Transferts à but social                  |
| expense_sectoral_funds_amount           | Dépenses sectorielles                           | fcfa | Fonds affectés (pêche, énergie, etc.)    |


🟦 BLOC 4 — TRÉSORERIE (TREASURY & FINANCEMENT)

| code                                        | label_fr                         | unit | description                        |
| ------------------------------------------- | -------------------------------- | ---- | ---------------------------------- |
| treasury_operations_total_amount            | Opérations de trésorerie totales | fcfa | Ensemble des flux financiers       |
| treasury_debt_amortization_amount           | Amortissement de la dette        | fcfa | Remboursement du principal         |
| treasury_arrears_internal_amount            | Arriérés intérieurs              | fcfa | Paiement de dettes internes        |
| treasury_arrears_external_amount            | Arriérés extérieurs              | fcfa | Paiement de dettes extérieures     |
| treasury_deficit_opex_amount                | Déficit OPEX                     | fcfa | Déficit de fonctionnement          |
| treasury_financing_need_amount              | Besoins de financement totaux    | fcfa | Total du besoin global à couvrir   |
| treasury_financing_need_amortization_amount | Besoin pour amortissement        | fcfa | Part liée au remboursement         |
| treasury_financing_need_deficit_amount      | Besoin pour déficit              | fcfa | Part liée au déficit budgétaire    |
| treasury_financing_need_arrears_amount      | Besoin pour arriérés             | fcfa | Part liée au paiement des arriérés |


🟪 BLOC 5 — DETTE (DEBT)

| code                          | label_fr                     | unit        | description                    |
| ----------------------------- | ---------------------------- | ----------- | ------------------------------ |
| debt_total_amount             | Encours total de la dette    | fcfa        | Dette publique totale          |
| debt_project_loans_amount     | Emprunts projets             | fcfa        | Prêts liés à des projets       |
| debt_program_loans_amount     | Emprunts programmes          | fcfa        | Prêts budgétaires sectoriels   |
| debt_retroceded_amount        | Emprunts rétrocédés          | fcfa        | Montant rétrocédé              |
| debt_variation_net_amount     | Variation nette de la dette  | fcfa        | Évolution de l’encours         |
| debt_service_total_amount     | Service total de la dette    | fcfa        | Intérêts + amortissement       |
| debt_ratio_gdp_pct            | Dette / PIB                  | percent_gdp | Poids de la dette dans le PIB  |
| debt_service_ratio_budget_pct | Service de la dette / Budget | percent     | Part du service dans le budget |


| Code                          | Signification                                        | Nature                    | Source                          |
| ----------------------------- | ---------------------------------------------------- | ------------------------- | ------------------------------- |
| `expense_interest`            | Intérêts/commissions                                 | **Dépense budgétaire**    | LFI (section charges)           |
| `financing_debt_amortization` | Remboursement du capital                             | **Besoin de financement** | Opérations de trésorerie        |
| `debt_service_interest`       | Intérêts (pour affichage graphique “Dette publique”) | Vue synthétique           | = `expense_interest`            |
| `debt_service_principal`      | Capital (pour affichage graphique “Dette publique”)  | Vue synthétique           | = `financing_debt_amortization` |
| `debt_service_total`          | Service total de la dette                            | Vue synthétique           | = somme des deux                |

## DETTE

Intérêts/commissions de la dette = expense_interest

Capital de la dette = financing_debt_amortization

Service total de la dette = = somme des deux précédents
