# Analyse Search Console — 12 mois (juin 2025 → juin 2026)

> Source : export GSC du 26 juin 2026 (`4 - analytics/vie-publique.sn-export-search-console-26-06-2025`)
> Période données : **25 juin 2025 → 24 juin 2026** (365 jours)
> Auteur : analyse automatisée des CSV (Requêtes, Pages, Coverage, Discover)

---

## 1. Résumé exécutif

| Métrique (12 mois) | Valeur |
|---|---|
| Clics (Search) | **153 289** |
| Impressions (Search) | **4 018 526** |
| CTR moyen | **3,8 %** |
| Pages **indexées** (12/06/2026) | **16 512** |
| Pages **non indexées** | **10 461** (dont ~1 000–1 700 PDF `/docs/` que Google refuse — normal) |
| Discover | **0 clic** (canal inactif) |

**Les 3 leviers à plus fort ROI (par ordre) :**

1. **🥇 Conseil des ministres / nominations** — **303 000 impressions/an** mais **~1,3 % de CTR** (positions 4–8). C'est le plus gros gisement du site, **sous-exploité par le CTR**, pas par le classement. Un simple travail de titres/descriptions + fraîcheur peut multiplier les clics par 3–5.
2. **🥈 Personnalités politiques** — **277 000 impressions/an**, déjà 1ʳᵉ source de clics (17 400), mais beaucoup de noms bloqués en **page 2** (Ousmane Sonko pos 11, Birame Souleye Diop pos 10, Abdourahmane Diouf pos 9…). Les faire passer page 1 = gain énorme.
3. **🥉 « liste du nouveau gouvernement / ministres »** — demande explicite (13 700 impr, pos 8) sans page dédiée optimisée → créer une page **liste** type Wikipédia.

> ⚠️ **Recadrage stratégique** : les **rapports des organes de contrôle** (Cour des comptes, OFNAC, IGE, CENTIF, ARMP) — sujet de la dernière feature livrée — représentent **~31 000 impressions/an au total**, soit **10× moins** que le Conseil des ministres. C'est une bonne page evergreen (et **CENTIF** y est étonnamment fort : 20 000 impr), mais **ce n'est pas le levier n°1**. À garder en tête pour le séquencement.

---

## 2. Demande par thème (12 mois, top 1000 requêtes)

Les 1000 requêtes exportées = 956 743 impressions / 54 318 clics. Regroupées par thème (assignation prioritaire, 1 thème par requête) :

| Impressions | Clics | CTR | Thème | Lecture |
|---:|---:|---:|---|---|
| **303 035** | 3 883 | 1,3 % | **Conseil ministres / nominations** | 🔴 CTR catastrophique → levier n°1 |
| **277 024** | 17 409 | 6,3 % | **Personnalités (noms propres)** | 🟠 1ʳᵉ source de clics, bcp en page 2 |
| 190 666 | 15 079 | 7,9 % | Autres (longue traîne, actu…) | — |
| 35 744 | 4 635 | 13 % | Député / Assemblée | 🟢 bien capté |
| 27 875 | 2 330 | 8,4 % | Ministre / ministère | — |
| 22 920 | 1 007 | 4,4 % | Code (électoral, famille…) | 🟠 « code électoral » 9,7k impr pos 6 |
| **20 110** | 181 | 0,9 % | **CENTIF** | 🟠 page organisme livrée — à suivre |
| 16 728 | 2 094 | 13 % | Loi | 🟢 |
| 16 271 | 5 280 | **32 %** | Journal officiel | 🟢 déjà excellent |
| 13 391 | 393 | 2,9 % | Budget / finances | 🟠 |
| 10 280 | 356 | 3,5 % | Constitution | 🟠 |
| 7 699 | 171 | 2,2 % | Cour des comptes | page organisme livrée |
| 4 774 | 332 | 7 % | Élection / parrainage | — |
| 2 278 | 909 | 40 % | Décret (hors nomination) | 🟢 faible volume résiduel |
| 1 319 | 48 | 3,6 % | OFNAC | page organisme livrée |
| 862 | 24 | 2,8 % | IGE | page organisme livrée |

**Enseignement clé sur les catégories à créer** : la stratégie supposait `lois > décrets > arrêtés`. La donnée corrige : la demande **« décret »** est en réalité **« décret de nomination »** → elle appartient au cluster **Conseil des ministres** (pas à une catégorie `/documents/decrets`). En standalone, décrets/arrêtés sont marginaux. Les vraies catégories à demande réelle : **Code** (22,9k), **Loi** (16,7k), **Budget** (13,4k), **Constitution** (10,3k).

---

## 3. Trafic par type de page (segment d'URL)

| Clics | Impressions | Pages | Segment | Note |
|---:|---:|---:|---|---|
| 30 362 | 610 202 | 354 | `documents` | cœur du site |
| 26 059 | 345 344 | 74 | `personnalites` | 🟠 très fort clic/page |
| **25 709** | **664 884** | 377 | `docs` (**PDF bruts**) | 🔴 rankent mais 0 contrôle SEO |
| 8 854 | 101 352 | 1 | `(home)` | — |
| 8 495 | 313 547 | 84 | `assemblee-nationale` | 🟢 |
| 5 324 | 154 715 | 12 | `portraits` | doublon possible avec `personnalites` |
| **3 269** | **313 890** | 7 | `conseil-des-ministres` | 🔴 **1 % CTR** sur 313k impr |
| 2 513 | 132 513 | 2 | `nomination-senegal` | 🔴 1,9 % CTR |
| 2 370 | 91 373 | 11 | `pdf` | proxy PDF |
| 1 830 | 8 231 | 1 | `journal-officiel-senegal` | legacy (à consolider) |
| 1 331 | 75 602 | 9 | `rapport-senegal` | legacy |

**Le piège `/docs/` (PDF bruts)** : 377 PDF captent 664 884 impressions et 25 709 clics — mais un PDF n'a ni schema, ni maillage interne, ni CTA, ni mesure d'engagement. **Action structurelle** : garantir que chaque PDF a sa page HTML jumelle `/documents/[id]/[slug]` (résumé texte indexable + liens + schema) et viser à faire ranker la **page HTML** plutôt que le PDF. Gisement énorme et non décrit dans la stratégie actuelle.

---

## 4. Opportunités priorisées (plan d'action)

### A. 🥇 Conseil des ministres / nominations — CTR (impact maximal)

Pages concernées : `app/pages/conseil-des-ministres/index.vue`, `app/pages/nomination-senegal/index.vue`, et les détails `conseil-des-ministres/[id]/[slug].vue`.

CTR actuels (page 1, donc classement OK — c'est le **titre/description** qui échoue) :

| Impr | Clics | CTR | Pos | Requête |
|---:|---:|---:|---:|---|
| 21 405 | 91 | **0,43 %** | 5,7 | communiqué conseil des ministres sénégal |
| 16 224 | 418 | 2,6 % | 5,2 | nominations conseil des ministres sénégal aujourd'hui |
| 14 290 | 323 | 2,3 % | 4,1 | communiqué conseil des ministres aujourd'hui |
| 11 665 | 158 | 1,4 % | 5,9 | nomination conseil des ministres de ce jour |

**Actions :**
1. **Titres dynamiques datés** : « Communiqué du Conseil des ministres du 25 juin 2026 — Nominations » (la requête contient « aujourd'hui / ce jour » → la fraîcheur affichée dans le titre/description gagne le clic).
2. **Description** = les 1–2 nominations phares + nombre de décisions.
3. **Page « running » Nominations** mise à jour à chaque conseil + `dateModified` schema.
4. **FAQ** « Quand a lieu le prochain conseil des ministres ? », « Qui a été nommé cette semaine ? ».
5. Soumettre via **IndexNow** à chaque publication (cf. `seo-indexation-rapide.md`).

> Potentiel : passer de ~1,3 % à ~5 % de CTR sur 303k impr = **+11 000 clics/an** sur ce seul cluster.

### B. 🥈 Personnalités — sortir de la page 2 + Schema.org Person

Noms à fort volume bloqués page 2 (quick wins) :

| Impr | Pos | Nom |
|---:|---:|---|
| 16 018 | 11,2 | ousmane sonko |
| 15 370 | 8,7 | abdourahmane diouf |
| 12 213 | 9,8 | birame souleye diop |
| 8 185 | 9,2 | amadou ba |
| 7 829 | 8,5 | jean baptiste tine |
| 3 360 | 10,1 | daouda ngom |

**Actions :** enrichir le contenu des fiches (bio, parcours, fonctions, documents/actualités liés), ajouter **Schema.org `Person`** (Phase 6), consolider `portraits` ↔ `personnalites` (canonical pour éviter le doublon), s'assurer que **chaque membre du gouvernement actuel a une fiche**.

### C. 🥉 Pages « liste » (demande directe)

« liste du nouveau gouvernement du sénégal 2026 » (13 698 impr, pos 8). Créer `/gouvernement-senegal` (ou `/liste-ministres-senegal`) — liste structurée, mise à jour à chaque remaniement, schema `ItemList`. Cf. Phase 7 de la stratégie (à remonter en priorité).

### D. PDF `/docs/` → jumeaux HTML — **DÉCISION : NE PAS TRAITER (juin 2026)**

L'idée initiale (forcer le ranking de la page HTML à la place du PDF + tracker les PDF dans
GA) a été **étudiée puis écartée**. C'est le bon choix, et voici pourquoi — pour ne pas le
re-débattre :

**1. « Tracker les PDF dans GA » est contre-productif.** Un PDF ne charge pas le tag JS GA →
GA ne le verra **jamais** nativement. Le seul moyen serait d'émettre des événements
côté serveur (Measurement Protocol depuis le proxy `/docs`), ce qui produirait des **données
pourries** :

- **bots** (Googlebot et crawlers re-téléchargent les PDF en boucle) comptés comme du trafic —
  GA côté JS les exclut, le MP côté serveur **non** → chiffres gonflés ;
- **cache** (PDF cachés 24 h CDN/navigateur) → beaucoup de vues n'atteignent pas le serveur →
  sous-comptage ;
- **pas de cookie `_ga`** sur un atterrissage direct → client_id aléatoires → chaque vue =
  « nouvel utilisateur ».
→ Résultat moins fiable que l'absence de données. **Le bon outil pour le trafic PDF, c'est
Search Console** (clics/impressions par URL, déjà propre), PAS GA.

**2. Le canonical PDF → HTML est faible.** Google ne respecte un canonical inter-format que si
les deux sont **équivalents**. Pour les docs **avec `content_html`** (texte rendu sur la page
HTML — déjà le cas), ça peut marcher ; pour les docs **sans texte** (PDF scanné), la page HTML
est mince → canonical ignoré, et **le PDF EST le contenu** (normal qu'il ranke).

**3. Le « problème » n'en est pas vraiment un.** Sur les gros docs, le **PDF ET la page HTML
rankent tous les deux** (ex. règlement intérieur Assemblée : 6 193 clics PDF **+** 1 991 clics
sur `/documents/6107/…`). On capte donc **plus** de trafic au total. Qui cherche « … pdf »
**veut le PDF** — le lui servir est une bonne UX. Forcer la consolidation = friction + risque
sur un chemin critique, pour un bénéfice incertain.

**Conclusion** : on **laisse PDF et page HTML coexister**. La page HTML est déjà forte (texte
`content_html` + signaux de fraîcheur + schema `Article` — faits) et capte sa part. Pour
mesurer les PDF : **Search Console**. _Si un jour on veut le trafic PDF agrégé dans un tableau
de bord, passer par l'**API Search Console** (données réelles), jamais par des événements GA
serveur._

### E. Organismes de contrôle (feature livrée juin 2026)

Pages `/documents/rapports-audit/organisme/<slug>` livrées. **CENTIF** est le plus prometteur (20 110 impr, 0,9 % CTR, « centif » pos 8,95). Cour des comptes 7,7k. OFNAC/IGE faibles. **À surveiller dans la GSC sur 4–8 semaines** (pages neuves, pas encore indexées au moment de l'export).

### F. Catégories à créer — re-priorisées par la donnée

1. **Code** (`/documents/codes` existe ; envisager pages par code : code électoral 9,7k, code de la famille, code du travail).
2. **Loi** (`law`) — 16,7k.
3. **Budget / finances** — 13,4k.
4. **Constitution** — page pilier dédiée (10,3k).

Reléguer `decrets` / `arretes` en standalone (demande réelle marginale hors nominations).

---

## 5. Top quick wins (position 8–20, presque page 1)

| Impr | Pos | Requête | Cible |
|---:|---:|---|---|
| 16 018 | 11,2 | ousmane sonko | fiche personnalité |
| 15 370 | 8,7 | abdourahmane diouf | fiche personnalité |
| 13 698 | 8,1 | liste du nouveau gouvernement du sénégal 2026 | page liste |
| 12 872 | 8,9 | centif | page organisme (livrée) |
| 12 213 | 9,8 | birame souleye diop | fiche personnalité |
| 9 751 | 6,0 | code électoral | page code |
| 8 185 | 9,2 | amadou ba | fiche personnalité |
| 4 724 | 8,5 | examen cfee 2026 | actualité |
| 2 474 | 8,2 | rapport cour des comptes | page organisme (livrée) |

---

## 6. Correction des chiffres périmés (audit & stratégie)

| Métrique | Doc actuel (fév.–avr. 2026) | Réel GSC (juin 2026) |
|---|---|---|
| Pages **indexées** | 973 | **16 512** ✅ (objectif ~5 000 **dépassé**) |
| Pages **non indexées** | 5 251 « noindex » | **10 461** (majorité = PDF `/docs/` non indexables) |
| Clics (période) | — | **153 289** /an |
| Impressions | — | **4 018 526** /an |

→ La **Phase 1 « débloquer l'indexation »** est **largement faite** : l'index est passé de ~10 159 (28/03) à 16 512 (12/06). Le sujet n'est plus « débloquer l'indexation » mais **« convertir les impressions en clics »** (CTR) sur les clusters Conseil des ministres + Personnalités.

---

## 7. Séquencement recommandé (révisé)

1. **CTR Conseil des ministres / nominations** (titres datés + fraîcheur + FAQ) — *impact n°1, peu de code*.
2. **Personnalités** : Schema.org Person + enrichissement des fiches page-2 + consolidation `portraits`/`personnalites`.
3. **Page liste gouvernement / ministres**.
4. ~~Jumeaux HTML des PDF `/docs/`~~ — **écarté** (voir §4.D) : PDF + page HTML coexistent déjà, et tracker les PDF dans GA donnerait des données pourries. Trafic PDF → Search Console.
5. Suivi des **pages organismes** livrées (CENTIF en tête).
6. **Catégories** Code / Loi / Budget / Constitution (par demande réelle).
