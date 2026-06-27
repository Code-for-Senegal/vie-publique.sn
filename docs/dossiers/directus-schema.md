# Dossiers — Modèle de données Directus

> Ce document décrit **exactement** la collection `dossier` et ses relations à créer
> dans Directus. Le frontend Nuxt (`server/api/dossiers/*`, `types/dossier.ts`) est déjà
> aligné sur ce schéma : **respectez les noms de champs et de collections à la lettre.**

## Vue d'ensemble

- 1 collection principale : **`dossier`**
- 5 relations **Many-to-Many** (une table de jonction par type de contenu lié)
- 5 blocs riches optionnels (nouveautés, FAQ, chronologie, comparatif, sources) sous forme de
  **champs JSON** édités via l'interface **« Repeater »** (anciennement « List ») →
  formulaire propre pour les rédacteurs, jamais de JSON brut à saisir.

---

## 1. Collection `dossier`

| Réglage collection | Valeur |
| --- | --- |
| Nom (Collection Name) | `dossier` |
| Primary Key | `id` — type **UUID**, "Generated" |
| Champ d'affichage (Display Template) | `{{ title }}` |
| Archive Field / Value / App Filter | `status` / `archived` / activé |
| Sort Field | `sort` |

### Champs scalaires

| Champ (clé) | Type Directus | Interface | Options / notes |
| --- | --- | --- | --- |
| `id` | UUID | — | PK, généré |
| `status` | String | **Dropdown** | Valeurs : `draft` (défaut), `published`, `archived`. Champ standard de statut. |
| `sort` | Integer | Input | Tri manuel (featured/ordre) |
| `title` | String | Input | **Requis** |
| `slug` | String | Input | **Requis**, **Unique**. Minuscules, sans accent, sans espace, tirets simples. Voir « Règles slug ». |
| `type` | String | **Dropdown** | Catégorie du dossier. Valeurs (clé → libellé) : `legislative`→Législatif, `report`→Rapport, `institution`→Institution, `policy`→Politique publique, `election`→Élection, `reform`→Réforme, `public_finance`→Finances publiques, `fact_check`→Fact-check, `guide`→Guide. **Respecter les clés exactes** (snake_case) : elles servent au filtre `/dossiers?type=` et au badge. |
| `summary` | Text | Textarea | Résumé court (≤ ~200 car.) affiché en hero + cartes |
| `cover_image` | UUID (M2O → `directus_files`) | **Image** | Image de couverture (OG image) |
| `intro_html` | Text | **WYSIWYG** | Introduction éditoriale |
| `content_html` | Text | **WYSIWYG** | Contenu riche principal |
| `publish_date` | Timestamp | Datetime | Date de publication |
| `date_created` | Timestamp | — | Standard Directus (« On Create ») |
| `date_updated` | Timestamp | — | Standard Directus (« On Update ») → sert au `lastmod` sitemap & « mis à jour le » |
| `seo_title` | String | Input | Optionnel — surcharge le `<title>` (sinon `title` utilisé) |
| `seo_description` | Text | Textarea | Optionnel — surcharge la meta description (sinon `summary`) |
| `tags` | JSON | **Tags** | Tableau de chaînes (`["code du travail","droit social"]`) |
| `featured` | Boolean | Toggle | Mise en avant (badge « À la une ») |

> ### ⚠️ NOTE RÉDACTEURS / ADMIN — normaliser le dropdown `type` (à corriger)
>
> Le filtre par catégorie de la page `/dossiers` compare la **valeur stockée** à la **clé**
> (`legislative`, `reform`, …). Or sur l'instance actuelle le dropdown `type` a été configuré
> avec le **libellé FR comme valeur** (ex. `Législatif` au lieu de `legislative`). Conséquence :
> le badge s'affiche bien, mais **cliquer un filtre ne renvoyait aucun résultat**.
>
> **À faire dans Directus** (Settings → Data Model → `dossier` → champ `type` → interface
> **Dropdown** → liste des **Choices**) : pour chaque entrée, séparer correctement les deux
> colonnes —
>
> | Colonne Directus | Valeur à saisir | Exemple |
> | --- | --- | --- |
> | **Text** (libellé affiché) | le libellé FR | `Législatif` |
> | **Value** (valeur stockée) | la **clé snake_case** | `legislative` |
>
> Liste complète (Text → **Value**) : `Législatif` → **`legislative`**, `Réforme` →
> **`reform`**, `Politique publique` → **`policy`**, `Finances publiques` →
> **`public_finance`**, `Institution` → **`institution`**, `Élection` → **`election`**,
> `Rapport` → **`report`**, `Fact-check` → **`fact_check`**, `Guide` → **`guide`**.
> _(Source unique de vérité : `app/config/dossiers.config.ts`.)_
>
> **Migrer les dossiers déjà saisis** : rééditer chaque dossier existant et re-sélectionner la
> catégorie (la valeur passera de `Législatif` à `legislative`). En base, on peut aussi faire un
> `UPDATE dossier SET type='legislative' WHERE type='Législatif';` (idem pour chaque libellé).
>
> > 🛡️ **Le front reste tolérant** : `app/pages/dossiers/index.vue` reconnaît **clé _et_ libellé**
> > et n'affiche que les filtres ayant du contenu — rien ne casse pendant la migration. Mais une
> > fois les valeurs normalisées sur les clés, ce sera plus propre et cohérent avec les autres
> > collections (`documents`, `news`…). **Toujours saisir la `Value` en clé snake_case** pour les
> > nouveaux dossiers.

### Champs JSON éditoriaux (interface « Repeater »)

Pour chacun : dans « New Field », section **Selection → Repeater** (Directus crée
automatiquement le type `json` sous le capot ; inutile de choisir « JSON » d'abord).
Définir ensuite les **sous-champs** indiqués (options du champ → « Create Field ») pour offrir
aux rédacteurs un formulaire clair (bouton + Ajouter / supprimer, glisser-déposer).

| Champ (clé) | Sous-champs du repeater | Usage |
| --- | --- | --- |
| `highlights` | `title` (Input, requis), `description` (Textarea) | « À retenir » — repères / résumé rapide (infos de contexte, pas forcément des nouveautés) |
| `faq` | `question` (Input, requis), `answer` (WYSIWYG ou Textarea) | FAQ (génère le JSON-LD `FAQPage`) |
| `timeline` | `date` (Input — ISO `2026-03-12` **ou** libellé « Mars 2026 »), `title` (Input, requis), `description` (Textarea) | Chronologie |
| `comparison` | `label` (Input, requis), `before` (Textarea), `after` (Textarea) | Comparatif ancien/nouveau |
| `sources` | `label` (Input, requis), `url` (Input, requis) | Sources & ressources — liens **internes ou externes** |

> **`sources` — interne ou externe (auto-détecté)** : le champ `url` accepte un **chemin
> interne** (ex. `/budget-senegal`, `/documents/...`) → le lien reste sur le site, OU une
> **URL externe** (`https://…`, ex. une vidéo YouTube) → ouverte dans un nouvel onglet.
> Le composant front détecte automatiquement selon le préfixe (`/` vs `https://`).
>
> ⚠️ **Pour référencer tes propres documents / actualités / vidéos, n'utilise PAS ce repeater** :
> passe par les **relations M2M** `documents`, `news`, `podcasts` (§ 2). `sources` ne sert
> que pour des liens *ad hoc* (dashboard, page de données, lien externe ponctuel).
>
> **Note rédacteurs** : l'interface « Repeater » présente chaque entrée comme une ligne de
> formulaire avec ses champs nommés. Aucune connaissance du JSON n'est requise.

---

## 2. Relations Many-to-Many

Créer un champ **Many-to-Many** sur `dossier` pour chacune des cibles ci-dessous.
Directus crée automatiquement la table de jonction. **Respecter les noms** ci-dessous car
le serveur Nuxt lit les clés étrangères exactes (`<cible>_id`).

| Champ M2M sur `dossier` | Collection cible | Clé étrangère lue par l'API |
| --- | --- | --- |
| `documents` | `documents` | `documents_id` |
| `news` | `news` | `news_id` |
| `podcasts` | **`vp_podcasts`** ⚠️ (pas `podcasts`) | `vp_podcasts_id` |
| `public_persons` | `public_persons` | `public_persons_id` |
| `public_entities` | `state_organization_entity` | `state_organization_entity_id` |

> **`public_entities` (et non « institutions »)** : la cible `state_organization_entity` couvre
> **toutes** les entités de l'État — ministères, agences, établissements publics, présidence,
> primature **et** institutions. « institution » n'est qu'un `entity_type` parmi d'autres, d'où
> le nom générique `public_entities` (symétrique de `public_persons`). L'API récupère aussi
> `entity_type.code` pour router vers la bonne URL : `/etat-senegal/<slug>` (ministères, agences…)
> ou `/etat-senegal/institutions/<slug>` (types `institution` / `presidence` / `primature`).
> ⚠️ Cible bien `state_organization_entity` (pages `/etat-senegal/…`), **pas** `state_entity`
> (modèle « annuaire », URL différentes).
>
> ⚠️ **Vidéos / podcasts** : la collection réelle est **`vp_podcasts`**. Le champ M2M sur
> `dossier` peut garder le nom `podcasts` (nom du champ libre), mais il doit **cibler
> `vp_podcasts`** ; Directus génère alors la FK `vp_podcasts_id` que lit l'API.
>
> En créant un M2M via l'UI Directus, le nom du champ (colonne de gauche) est ce qui compte
> côté API. Laissez Directus nommer la jonction et la FK selon sa convention
> `<collection_cible>_id` — c'est exactement ce qu'attend `server/api/dossiers/[slug].get.ts`
> (fonction `flattenM2M`). Si votre instance nomme la FK différemment, ajustez la FK
> correspondante dans ce fichier.

**Filtrage des cibles** : l'API ne renvoie que les contenus liés **publiés**
(`status = published`) pour `documents`, `news`, `public_persons`, et seulement les
entités publiques (`public_entities`) avec `has_public_page = true`. Les podcasts n'ont pas de filtre de statut.

> **Vidéos / images** : les « vidéos liées » sont gérées via la collection `vp_podcasts`
> (vidéos YouTube). Si un futur besoin d'une vraie galerie d'images distincte apparaît,
> ajouter un M2M `medias` sur le même modèle (non inclus dans le MVP).

---

## 3. Permissions (rôle Public)

Pour que le proxy serveur (token statique) et le SSR fonctionnent, le rôle utilisé par
`CMS_API_KEY` doit avoir **Read** sur :

- `dossier` (idéalement restreint à `status = published` via Custom Permissions)
- les 5 tables de jonction (`dossier_documents`, `dossier_news`, `dossier_vp_podcasts`, `dossier_public_persons`, `dossier_state_organization_entity`)
- les collections cibles (déjà lisibles puisque exposées ailleurs)
- `directus_files` (déjà le cas pour les images)

---

## 4. Règles de slug (SEO)

Le slug doit respecter (cf. contraintes SEO du projet) :

- minuscules uniquement
- pas d'accents (`é` → `e`)
- pas d'espaces (→ tirets)
- pas de caractères encodés
- pas de double tiret (`--`)

Exemples valides :
`code-du-travail-senegal-2026`, `revision-constitutionnelle-2026`,
`joj-dakar-2026`, `dette-publique-senegal`, `cour-des-comptes-finances-publiques`.

> Astuce : créer une **Flow Directus** (ou un hook) qui génère `slug` depuis `title` à la
> création si vide, en réutilisant la logique de `server/utils/slug.ts`
> (`generateSlugFromName`). Optionnel pour le MVP — la saisie manuelle reste possible.

---

## 5. Redirections 301 si un slug change

Le slug fait partie de l'URL canonique. **Éviter de le modifier après indexation.**
Si un changement est inévitable, mettre en place la redirection 301 ancienne → nouvelle URL :

- **Option simple (MVP)** : ajouter une règle dans `routeRules` de `nuxt.config.ts` :
  ```ts
  '/dossiers/ancien-slug': { redirect: { to: '/dossiers/nouveau-slug', statusCode: 301 } },
  ```
- **Option évolutive** : utiliser une collection `redirects` Directus (champs `from`, `to`)
  consommée par un middleware serveur — à considérer si les changements deviennent fréquents.

---

## 6. Récapitulatif — checklist de création

- [ ] Créer la collection `dossier` (PK UUID, archive sur `status`, sort sur `sort`)
- [ ] Ajouter les champs scalaires (table § 1)
- [ ] Ajouter les 5 champs Repeater (table § 1) avec leurs sous-champs
- [ ] Créer les 5 relations M2M (§ 2)
- [ ] Donner les permissions Read au rôle public (§ 3)
- [ ] Créer un premier dossier de test publié (ex. `code-du-travail-senegal-2026`)
- [ ] Vérifier `GET /api/dossiers` et `GET /api/dossiers/<slug>` en local
- [ ] Vérifier l'apparition dans `/sitemap.xml`
