# État du Sénégal — documentation fonctionnelle

Cette section du site explique **comment l'État du Sénégal est organisé** : ses institutions,
son organigramme administratif, son gouvernement et son budget. L'objectif est de rendre des
données officielles (décrets de répartition des services) **lisibles pour le citoyen**.

> **Documentation technique détaillée** (modèle de données Directus, API, import des décrets,
> SEO) : voir [`ORGANISATION-ETAT-TECHNIQUE.md`](./ORGANISATION-ETAT-TECHNIQUE.md).

---

## Ce que la section propose

| Parcours | Route | Contenu |
| --- | --- | --- |
| **Accueil État** | `/etat-senegal` | Hub : organisation, institutions, gouvernement, budget. |
| **Organisation de l'État** | `/etat-senegal/organisation` | Organigramme officiel (arbre + liste filtrable) issu du décret actif. |
| **Comparaison de décrets** | `/etat-senegal/organisation/changements` | Créations, suppressions, renommages, changements de tutelle entre deux décrets. |
| **Institutions constitutionnelles** | `/etat-senegal/institutions` | Présidence, Assemblée, Conseil constitutionnel, Cour des comptes… |
| **Fiche institution** | `/etat-senegal/institutions/{slug}` | Présentation, coordonnées, FAQ. |
| **Fiche entité** | `/etat-senegal/{slug}` | Une entité de l'organigramme (ministère, direction, agence, EP, société…) : présentation, structures rattachées, coordonnées, références légales. |

---

## Le domaine : typologie des entités

L'État est structuré en une hiérarchie partant de **3 racines** (Présidence, Primature,
Ministères), chacune contenant des structures rattachées :

| Type | Exemple |
| --- | --- |
| Présidence / Primature | sommet de l'exécutif |
| Ministère | Ministère de la Santé |
| Direction / Service | Direction générale des Finances |
| Agence | ARTP, ANSD |
| Établissement public | Universités, CHU |
| Société nationale / à participation publique | SENELEC |
| Entité de regroupement | conteneur non cliquable (« Autres administrations »…) |

> Le **type ne se déduit jamais du nom seul** : il dépend de la **section du décret** où
> l'entité apparaît (cf. table de détection dans la doc technique, §11).

Une entité possède un **`slug` immuable** (clé d'URL stable). Les remaniements (changement de
nom, de tutelle, suppression) sont **historisés par décret** : on ne recrée jamais une entité
pour un simple changement de nom.

---

## Fiches éditoriales (institutions & grandes entités)

Au-delà des données structurées, les **fiches phares** portent du contenu rédactionnel
(champs `description`, `body` WYSIWYG, `cover_image`, `faq`) pour la lisibilité **et le
référencement**. Logique d'affichage et règles SEO : voir
[`ORGANISATION-ETAT-TECHNIQUE.md`](./ORGANISATION-ETAT-TECHNIQUE.md) §8 (fiches) et §12 (SEO).

---

## Deux systèmes coexistent (à connaître)

| Système | Collection Directus | Pages | Statut |
| --- | --- | --- | --- |
| **Organisation de l'État** | `state_organization_entity` (+ décrets / snapshots) | `/etat-senegal/organisation`, `/etat-senegal/{slug}`, `/etat-senegal/institutions/*` | **Actuel** — système de référence, enrichi (historique des décrets, fiches éditoriales). |
| **Annuaire** (héritage) | `state_entities` | `/etat-senegal/annuaire`, `/etat-senegal/annuaire/{slug}` | **Legacy** — encore en ligne (flag `menu_organigramme_etat`), antérieur. Voué à être remplacé par le système Organisation. |

> Pour toute nouvelle évolution, viser le système **Organisation**. L'annuaire legacy n'est
> pas documenté en détail : son code (`server/api/state/*`, `composables/useState*`,
> `components/State*`) est appelé à disparaître.
