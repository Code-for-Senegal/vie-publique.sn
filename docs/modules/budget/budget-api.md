

## 1. Récupérer les années dispo

```http
GET /items/budget_year?fields=id,year,status&sort=-year
```

Ce que tu reçois (ex.) :

```json
{
    "data": [
        {
            "id": 2026,
            "year": 2026,
            "status": "draft"
        },
        {
            "id": 2025,
            "year": 2025,
            "status": "draft"
        },
        {
            "id": 2024,
            "year": 2024,
            "status": "draft"
        }
    ]
}
```

Sur le front → tu affiches la liste déroulante des années.

---

## 2. Récupérer les versions d’une année

Par ex. pour **2026** (id = 3 chez toi) :

```http
GET /items/budget_version
  ?filter[year][_eq]=ID_YEAR
  &fields=id,label,status,year
  &sort=label
```

Résultat :

```json
{
    "data": [
        {
            "id": 5,
            "year": 2026,
            "label": "LFI"
        },
        {
            "id": 6,
            "year": 2026,
            "label": "LFR"
        }
    ]
}
```

Sur le front → tu peux choisir PLF/LFI/LFR.

---

## 3. Charger **tous les indicateurs** (référentiel)

Tu le fais **rarement** (au build ou au mount) et tu le caches côté front.

```http
GET /items/budget_metric?fields=id,code,label_fr,unit,group,display_zone,display_order&limit=-1
```

Tu auras les codes → `budget_total`, `revenue_total`, `expense_total`, `deficit_total`, etc.

Résultat :

```json
{
    "data": [
        {
            "id": 1,
            "code": "budget_total",
            "label_fr": "Budget total",
            "unit": "mds_fcfa",
            "group": "global",
            "display_zone": "resume",
            "display_order": 1
        },
        {
            "id": 2,
            "code": "revenue_total",
            "label_fr": "Recettes totales (budget général + comptes spéciaux)",
            "unit": "mds_fcfa",
            "group": "global",
            "display_zone": "resume",
            "display_order": 2
        },
        {
            "id": 3,
            "code": "expense_total",
            "label_fr": "Dépenses totales (budget général + comptes spéciaux)",
            "unit": "mds_fcfa",
            "group": "global",
            "display_zone": "resume",
            "display_order": 3
        },
        {
            "id": 4,
            "code": "deficit_total",
            "label_fr": "Déficit budgétaire",
            "unit": "mds_fcfa",
            "group": "global",
            "display_zone": "resume",
            "display_order": 4
        },
        {
            "id": 5,
            "code": "deficit_pct_gdp",
            "label_fr": "Déficit en % du PIB",
            "unit": "percent",
            "group": "global",
            "display_zone": "resume",
            "display_order": 5
        },
        {
            "id": 6,
            "code": "gdp_total",
            "label_fr": "Produit intérieur brut (PIB)",
            "unit": "mds_fcfa",
            "group": "macro",
            "display_zone": "resume",
            "display_order": 6
        },
        {
            "id": 7,
            "code": "growth_rate",
            "label_fr": "Taux de croissance",
            "unit": "percent",
            "group": "macro",
            "display_zone": "resume",
            "display_order": 7
        },
        {
            "id": 10,
            "code": "revenue_tax_total",
            "label_fr": "Recettes fiscales",
            "unit": "mds_fcfa",
            "group": "revenues",
            "display_zone": "details",
            "display_order": 10
        },
        {
            "id": 11,
            "code": "revenue_non_tax_total",
            "label_fr": "Recettes non fiscales",
            "unit": "mds_fcfa",
            "group": "revenues",
            "display_zone": "details",
            "display_order": 11
        },
        {
            "id": 12,
            "code": "revenue_external_grants_capital",
            "label_fr": "Dons en capital (projets)",
            "unit": "mds_fcfa",
            "group": "revenues",
            "display_zone": "details",
            "display_order": 12
        },
        {
            "id": 13,
            "code": "revenue_external_grants_budgetary",
            "label_fr": "Dons budgétaires",
            "unit": "mds_fcfa",
            "group": "revenues",
            "display_zone": "details",
            "display_order": 13
        },
        {
            "id": 14,
            "code": "revenue_special_accounts",
            "label_fr": "Recettes comptes spéciaux du Trésor",
            "unit": "mds_fcfa",
            "group": "revenues",
            "display_zone": "details",
            "display_order": 14
        },
        {
            "id": 15,
            "code": "revenue_total_general_budget",
            "label_fr": "Recettes du budget général",
            "unit": "mds_fcfa",
            "group": "revenues",
            "display_zone": "details",
            "display_order": 9
        },
        {
            "id": 20,
            "code": "expense_interest",
            "label_fr": "Intérêts de la dette",
            "unit": "mds_fcfa",
            "group": "expenses",
            "display_zone": "details",
            "display_order": 20
        },
        {
            "id": 21,
            "code": "expense_personnel",
            "label_fr": "Dépenses de personnel",
            "unit": "mds_fcfa",
            "group": "expenses",
            "display_zone": "details",
            "display_order": 21
        },
        {
            "id": 22,
            "code": "expense_goods_services",
            "label_fr": "Achat de biens et services",
            "unit": "mds_fcfa",
            "group": "expenses",
            "display_zone": "details",
            "display_order": 22
        },
        {
            "id": 23,
            "code": "expense_investment",
            "label_fr": "Investissements",
            "unit": "mds_fcfa",
            "group": "expenses",
            "display_zone": "details",
            "display_order": 23
        },
        {
            "id": 24,
            "code": "expense_special_accounts",
            "label_fr": "Dépenses comptes spéciaux du Trésor",
            "unit": "mds_fcfa",
            "group": "expenses",
            "display_zone": "details",
            "display_order": 24
        },
        {
            "id": 25,
            "code": "expense_total_general_budget",
            "label_fr": "Dépenses du budget général",
            "unit": "mds_fcfa",
            "group": "expenses",
            "display_zone": "details",
            "display_order": 19
        },
        {
            "id": 26,
            "code": "expense_investment_domestic",
            "label_fr": "Investissements sur ressources internes",
            "unit": "mds_fcfa",
            "group": "expenses",
            "display_zone": "details",
            "display_order": 26
        },
        {
            "id": 27,
            "code": "expense_investment_external",
            "label_fr": "Investissements sur ressources externes",
            "unit": "mds_fcfa",
            "group": "expenses",
            "display_zone": "details",
            "display_order": 27
        },
        {
            "id": 30,
            "code": "financing_need_total",
            "label_fr": "Besoin total de financement",
            "unit": "mds_fcfa",
            "group": "financing",
            "display_zone": "summary",
            "display_order": 30
        },
        {
            "id": 31,
            "code": "financing_debt_amortization",
            "label_fr": "Amortissement de la dette",
            "unit": "mds_fcfa",
            "group": "financing",
            "display_zone": "details",
            "display_order": 31
        },
        {
            "id": 32,
            "code": "financing_opex_deficit",
            "label_fr": "Couverture du déficit OPEX",
            "unit": "mds_fcfa",
            "group": "financing",
            "display_zone": "details",
            "display_order": 32
        },
        {
            "id": 33,
            "code": "financing_arrears_domestic",
            "label_fr": "Apurement des arriérés intérieurs",
            "unit": "mds_fcfa",
            "group": "financing",
            "display_zone": "details",
            "display_order": 33
        },
        {
            "id": 34,
            "code": "financing_onlending_retrocession",
            "label_fr": "Emprunts rétrocédés",
            "unit": "mds_fcfa",
            "group": "financing",
            "display_zone": "details",
            "display_order": 34
        },
        {
            "id": 40,
            "code": "debt_service_total",
            "label_fr": "Service total de la dette",
            "unit": "mds_fcfa",
            "group": "debt",
            "display_zone": "summary",
            "display_order": 40
        },
        {
            "id": 41,
            "code": "debt_service_interest",
            "label_fr": "Intérêts/commissions",
            "unit": "mds_fcfa",
            "group": "debt",
            "display_zone": "details",
            "display_order": 41
        },
        {
            "id": 42,
            "code": "debt_service_principal",
            "label_fr": "Capital de la dette",
            "unit": "mds_fcfa",
            "group": "debt",
            "display_zone": "details",
            "display_order": 42
        }
    ]
}
```

---

## 4. Charger les **valeurs** d’une année + version

C’est la requête la plus importante 💡

Supposons :

* année 2026 → `budget_year.id = 2026`
* version LFI 2026 → `budget_version.id = 5`

```http
GET /items/budget_global
  ?filter[year][_eq]=2026
  &filter[version][_eq]=5
  &fields=id,amount,metric.id,metric.code,metric.label_fr,metric.unit,metric.group,metric.display_zone,metric.display_order
  &limit=-1
  &sort=metric.display_order
```

Tu obtiens déjà **les valeurs + le libellé + l’unité**, donc tu peux dessiner directement ton dashboard.

Exemple de réponse :

```json
{
    "data": [
        {
            "id": 29,
            "year": 2026,
            "amount": "12264.10000",
            "metric": {
                "code": "budget_total",
                "label_fr": "Budget total",
                "unit": "mds_fcfa",
                "group": "global",
                "display_zone": "resume",
                "display_order": 1
            }
        },
        {
            "id": 30,
            "year": 2026,
            "amount": "6188.80000",
            "metric": {
                "code": "revenue_total",
                "label_fr": "Recettes totales (budget général + comptes spéciaux)",
                "unit": "mds_fcfa",
                "group": "global",
                "display_zone": "resume",
                "display_order": 2
            }
        },
    ...
  ]
}
```

Ensuite, dans Nuxt tu fais juste :

```js
const resume = data.filter(i => i.metric.display_zone === 'resume')
const recettes = data.filter(i => i.metric.group === 'revenues')
const depenses = data.filter(i => i.metric.group === 'expenses')
const financement = data.filter(i => i.metric.group === 'financing')
const financement = data.filter(i => i.metric.group === 'debt')
```

Donc **pas besoin** de multiplier les endpoints.

---

## 5. Comparer deux années / deux versions

Tu appelles deux fois la même route que ci-dessus avec 2 filtres différents.

Ex. LFI 2026 (`year=3, version=5`) et LFI 2025 (`year=2, version=3` chez toi) :

```http
GET /items/budget_global
  ?filter[_or][0][year][_eq]=3
  &filter[_or][0][version][_eq]=5
  &filter[_or][1][year][_eq]=2
  &filter[_or][1][version][_eq]=3
  &fields=id,amount,year,version,metric.code,metric.label_fr,metric.unit
  &limit=-1
```

Ensuite tu fais le diff côté front par `metric.code`.

---

## 6. Charger une seule métrique (si tu veux un widget)

Ex. juste le **besoin de financement total** pour LFI 2026 :

```http
GET /items/budget_global
  ?filter[year][_eq]=3
  &filter[version][_eq]=5
  &filter[metric][code][_eq]=financing_need_total
  &fields=amount,metric.code,metric.label_fr,metric.unit
```

---

## 7. Variante : récupérer d’abord la version publiée de l’année courante

Si tu ne veux **qu’un seul appel** dans le front :

1. d’abord : “donne-moi la version publiée la plus récente”

```http
GET /items/budget_version
  ?filter[status][_eq]=published
  &fields=id,year,year.year,label
  &sort=-year.year
  &limit=1
```

2. puis tu utilises son `id` dans l’appel de tout à l’heure (point 4).

---

## 8. Et pour les lignes (plus tard)

Quand tu auras `budget_line`, ce sera le même pattern :

```http
GET /items/budget_line
  ?filter[year][_eq]=3
  &filter[version][_eq]=5
  &fields=code,label,amount_ae,amount_cp,entity.id,entity.name
```

exemple :

/items/budget_line?filter[year][_eq]=2025&filter[level][_eq]=ministry&fields=id,year,label,version,entity,level,code,amount_cp,unit,entity.name,entity.id

réponse
```json
{
    "data": [
        {
            "id": 1,
            "year": 2025,
            "label": "Total section 59",
            "version": 4,
            "level": "ministry",
            "code": "59",
            "amount_cp": "113.72000",
            "unit": "mds_fcfa",
            "entity": {
                "name": "Ministère de la Formation Professionnelle",
                "id": 2875
            }
        },
        {
            "id": 5,
            "year": 2025,
            "label": "Total section 61",
            "version": 4,
            "level": "ministry",
            "code": "61",
            "amount_cp": "36.44863",
            "unit": null,
            "entity": {
                "name": "Ministère de l'Economie du Plan et de la Coopération",
                "id": 2689
            }
        },
        {
            "id": 9,
            "year": 2025,
            "label": "Total section 75",
            "version": 4,
            "level": "ministry",
            "code": "75",
            "amount_cp": "311.70600",
            "unit": null,
            "entity": {
                "name": "Ministère de l'Enseignement Supérieur de la Recherche et de l'Innovation",
                "id": 2973
            }
        }
    ]
}
```

---

### Récap rapide

* 📅 **liste années** → `/items/budget_year`
* 🏷️ **versions d’une année** → `/items/budget_version?filter[year][_eq]=ID`
* 📚 **référentiel métriques** → `/items/budget_metric?limit=-1`
* 📦 **valeurs pour un budget** → `/items/budget_global?filter[year][_eq]=…&filter[version][_eq]=…&fields=…&limit=-1`
* 📊 **comparaison** → même requête avec `_or`

