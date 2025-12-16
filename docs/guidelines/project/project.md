collection : project (le référentiel unique de projets)

But : “ce projet existe” — même si une année il n’a pas de ligne budgétaire.

| champ           | type                 | rôle                                                                 |
| --------------- | -------------------- | -------------------------------------------------------------------- |
| `id`            | auto                 | PK                                                                   |
| `code`          | string (unique)      | code interne/protocole/projet (si le doc LFI en a un → on le met là) |
| `title`         | string               | nom du projet (“Construction du CHU de…”)                            |
| `description`   | text                 | petit descriptif                                                     |
| `owner_entity`  | M2O → `state_entity` | ministère / agence porteur (ton annuaire)                            |
| `sector`        | string / M2O         | santé, énergie, routes… (optionnel)                                  |
| `status`        | enum                 | planned / ongoing / completed / suspended                            |
| `source_ref`    | string               | “LFI 2026, tome 2, p. 43” / “Ex-ante 2025”                           |
| `start_planned` | date                 | optionnel                                                            |
| `end_planned`   | date                 | optionnel                                                            |


👉 Ça te donne un référentiel projets Sénégal sur VP, indépendant du budget.

3. Nouvelle collection : project_budget_line (le lien projet ↔ budget ↔ année)

C’est ça qui va te permettre de dire :

“ce projet est financé dans LFI 2026 pour 3,5 mds”

“l’année d’après : 1,2 mds”

“et il dépend du programme 021 – Santé”

“et on veut comparer 2026 vs 2025”

| champ             | type                   | rôle                                           |
| ----------------- | ---------------------- | ---------------------------------------------- |
| `id`              | auto                   | PK                                             |
| **`project`**     | M2O → `project`        | ✅ le projet concerné                           |
| **`year`**        | M2O → `budget_year`    | ✅ 2024, 2025, 2026…                            |
| **`version`**     | M2O → `budget_version` | ✅ LFI / LFR / PLF                              |
| **`budget_line`** | M2O → `budget_line`    | ✅ pour dire “ce projet est dans tel programme” |
| `amount_ae`       | decimal                | AE de l’année/version                          |
| `amount_cp`       | decimal                | CP de l’année/version                          |
| `note`            | text                   | précision (financement externe, PIP, FONGIP…)  |
| `source_ref`      | string                 | ligne/page d’où vient le montant               |


Ça fait une table très simple : (projet, année, version, programme, montants).

Tu peux en mettre 0, 1 ou plusieurs par projet et par année.

# APPEL API

Sur la page d’un programme → afficher ses projets
GET /items/project_budget_line
  ?filter[year][_eq]=2026
  &filter[version][_eq]=5           # LFI 2026
  &filter[budget_line][_eq]=123     # le programme
  &fields=project.id,project.title,amount_ae,amount_cp
  &limit=-1

Et tu affiches la liste.

c. Sur la page d’un projet → afficher son financement pluriannuel
GET /items/project_budget_line
  ?filter[project][_eq]=42
  &fields=year.year,version.label,amount_ae,amount_cp,budget_line.label
  &sort=year.year


Tu obtiens :

2024 – LFR – 1 000

2025 – LFI – 2 500

2026 – LFI – 1 200

→ tu peux grapher.

d. Dashboard “Tous les projets”
GET /items/project
  ?fields=id,code,title,owner_entity.name_official,status
  &sort=owner_entity.name_official,title


→ Ça n’a plus besoin d’être rattaché à UNE LFI.

## Pourquoi pas mettre les projets directement dans budget_line ?

Parce qu’il y a 3 cas que tu as cités :

projets clairement listés dans la LFI → ok

projets détaillés seulement dans l’ex-ante → pas forcément même structure

projets annoncés / à suivre / hérités des années passées → pas dans LFI

## 7. Récap des collections

state_entity → ton annuaire (déjà fait)

budget_year → 2024, 2025, 2026 (déjà fait)

budget_version → LFI, LFR… (déjà fait)

budget_global → les gros agrégats (déjà fait)

budget_line → ministère / programme / (plus tard) sous-programme

ajouter budget_code

project → référentiel projets

project_budget_line → “ce projet a eu tel montant dans tel budget, dans tel programme”
