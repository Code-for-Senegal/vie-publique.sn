Super idée 👍 Un glossaire va vraiment aider tes utilisateurs.
Voici un modèle **simple, scalable et “Directus-friendly”**.

# Modèle de collection (Directus)

## 1) `glossary_term`

* `id` (UUID)
* `status` (draft/published)
* `slug` (unique) → ex: `deficit_budgetaire`
* `term` (string) → “Déficit budgétaire”
* `aliases` (tags / JSON) → ex: `["solde budgétaire","gap"]`
* `category` (enum) → `macro`, `recettes`, `dépenses`, `financement`, `dette`, `procédure`, `comptes_spéciaux`, `PIB/indices`, `général`
* `definition_short` (text court) → 1–2 phrases pour l’info-bulle
* `definition_long` (rich text) → explication détaillée
* `unit` (enum, optionnel) → `mds_fcfa`, `percent`, `ratio`, `texte`
* `formula` (texte, optionnel) → si c’est un indicateur calculé (ex: `deficit_total = expense_total - revenue_total`)
* `examples` (rich text, optionnel) → exemple chiffré
* `sources` (M2M -> `glossary_source`) ou simple `sources_text`
* `related_terms` (M2M self) → renvois “voir aussi”
* `metrics` (M2M -> `budget_metric`) → lier directement aux métriques de ton dashboard
* `documents` (files, optionnel) → PJ (pages PDF, captures)
* `country_context` (texte, optionnel) → précisions Sénégal (ex: “CST = Comptes Spéciaux du Trésor”)
* Audit Directus (`user_created`, `date_created`, etc.)

## 2) `glossary_source` (facultatif mais propre)

* `id`, `label` (ex: “LFI 2026, Annexe 1, p. 12”), `url` (optionnel), `note`

> Si tu veux rester ultra-léger, supprime `glossary_source` et garde `sources_text` dans `glossary_term`.

---

## Relations clés

* `glossary_term.metrics` → **M2M** avec `budget_metric`
  (permet d’afficher automatiquement la définition quand un KPI apparaît)
* `glossary_term.related_terms` → **M2M self** (graphe “voir aussi”)
* `glossary_term.sources` → **M2M** avec `glossary_source` (si activé)

---

## Minimal viable fields (si tu veux ultra simple)

`slug`, `term`, `definition_short`, `definition_long`, `category`, `metrics (M2M)`, `status`.

---

## Exemples d’entrées (pour import CSV rapide)

**glossary_term.csv**

```
status,slug,term,aliases,category,definition_short,unit,formula
published,deficit_budgetaire,Déficit budgétaire,"[\"solde budgétaire\"]",macro,"Dépenses totales moins recettes totales.",mds_fcfa,"deficit_total = expense_total - revenue_total"
published,deficit_pct_pib,Déficit en % du PIB,,macro,"Déficit rapporté au PIB.",percent,"deficit_pct_gdp = (deficit_total / gdp_total) * 100"
published,ae,Autorisations d’engagement,"[\"AE\"]",dépenses,"Plafond des engagements juridiques pouvant être contractés sur l'exercice.",texte,
published,cp,Crédits de paiement,"[\"CP\"]",dépenses,"Plafond des paiements attendus sur l’exercice pour couvrir les engagements.",texte,
published,budget_general,Budget général,,général,"Ensemble des opérations budgétaires hors comptes spéciaux du Trésor.",texte,
published,cst,Comptes spéciaux du Trésor,"[\"CST\",\"Comptes spéciaux\"]",comptes_spéciaux,"Comptes retraçant certaines opérations spécifiques de recettes/dépenses.",texte,
published,service_dette,Service de la dette,,dette,"Somme des intérêts/commissions et du capital de la dette arrivant à échéance.",mds_fcfa,"debt_service_total = debt_service_interest + debt_service_principal"
published,besoin_financement,Besoin de financement,,financement,"Montant total à mobiliser pour financer déficit et échéances de dette.",mds_fcfa,"financing_need_total = expense_total - revenue_total + debt_service_principal (+ ajustements)"
```

**liaison aux metrics (Directus UI)**

* Lier `deficit_budgetaire` → `deficit_total`
* Lier `deficit_pct_pib` → `deficit_pct_gdp`
* Lier `service_dette` → `debt_service_total`, `debt_service_interest`, `debt_service_principal`
* Lier `budget_general` → `revenue_general_budget_total`, `expense_general_budget_total`
* Lier `cst` → `revenue_special_accounts`, `expense_special_accounts_total`
* Lier `besoin_financement` → `financing_need_total` + sous-postes

---

## API côté front (exemples)

* **Chercher un terme** (auto-complétion)
  `/items/glossary_term?filter[_or][0][term][_icontains]={q}&filter[_or][1][aliases][_icontains]={q}&fields=slug,term,definition_short&sort=term`

* **Term par slug + métriques liées**
  `/items/glossary_term/{slug}?fields=slug,term,definition_long,unit,formula,metrics.code,metrics.label_fr,related_terms.term,related_terms.slug`

* **Afficher les définitions des métriques présentes à l’écran**
  (tu as déjà les codes de `budget_metric` utilisés sur la page)
  `/items/glossary_term?filter[metrics][glossary_term_id][filter][code][_in]=revenue_total,expense_total,deficit_total&fields=term,definition_short,metrics.code`

---

## Tips UX

* Utilise `definition_short` pour les info-bulles à côté des KPI, et ouvre un “drawer” avec `definition_long`.
* Ajoute `formula` quand c’est un indicateur calculé (ton front peut l’afficher “pédagogiquement”).
* `aliases` améliore la recherche (ex: “CST”, “comptes spéciaux”).

Si tu veux, je te prépare un petit CSV initial (10–15 termes) prêt à importer avec les champs exacts que tu as activés dans `glossary_term`.
