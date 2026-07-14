# Présence Wikipédia + Wikidata (GEO / autorité externe)

> Objectif : faire exister **Vie-Publique.sn comme entité** aux yeux des moteurs et des LLM
> (Google Knowledge Panel, ChatGPT, Perplexity, Claude…). Levier n°1 de la stratégie
> « autorité externe » du plan SEO (cf. `docs/seo/todo-seo.md`).

## 0. Ordre d'attaque (important)

1. **Wikidata d'abord** — pas de critère de notoriété strict, création immédiate possible,
   et c'est déjà 80 % du bénéfice GEO (les LLM et le Knowledge Graph de Google consomment
   Wikidata directement).
2. **Wikipédia ensuite, seulement quand les sources presse suffisent** — les critères
   d'admissibilité des associations (WP:NASSO) exigent en pratique **au moins 2 sources
   secondaires centrées** (articles de presse nationale/internationale consacrés au projet,
   pas de simples mentions), **espacées d'au moins 2 ans**. Publier trop tôt = passage en
   « Débat d'admissibilité » → suppression, et une 2ᵉ tentative part avec un a priori négatif.

## 1. Wikidata — à faire tout de suite

Créer un compte sur wikidata.org puis « Créer un nouvel élément » :

| Propriété                    | Valeur                                                          |
| ---------------------------- | --------------------------------------------------------------- |
| Libellé (fr)                 | Vie-Publique.sn                                                 |
| Description (fr)             | plateforme citoyenne d'accès à l'information publique au Sénégal |
| Libellé/description (en)     | Vie-Publique.sn — Senegalese civic platform for open access to public information |
| nature de l'élément (P31)    | site web (Q35127) **et** organisation à but non lucratif (Q163740) |
| pays (P17)                   | Sénégal (Q1041)                                                 |
| langue (P407)                | français (Q150)                                                 |
| date de fondation (P571)     | 2024 (lancement public : avril 2024 — précision « année » suffit)   |
| site officiel (P856)         | https://www.vie-publique.sn                                     |
| compte X (P2002)             | viepubliquesn                                                   |
| page Facebook (P2013)        | ViePubliqueSenegal                                              |
| LinkedIn (P4264)             | vie-publique-sn                                                 |
| chaîne YouTube (P2397)       | @ViePubliqueSenegal (saisir l'ID de chaîne)                     |
| dépôt de code (P1324)        | https://github.com/Code-for-Senegal/vie-publique.sn            |
| licence (P275)               | licence du repo (vérifier LICENSE)                              |

Une fois l'item créé : reporter son QID dans le schema.org `Organization` du site
(`sameAs: ['https://www.wikidata.org/wiki/Q…']`) — boucle d'auto-confirmation de l'entité.

## 2. Sources secondaires à rassembler AVANT le brouillon Wikipédia

À inventorier dans un tableau (date, média, lien, « centré ou mention ») :

- ✅ **Passage RTS** (vidéo YouTube D7Q5R_a4abU, intégrée sur /a-propos) — source audiovisuelle nationale
- À rechercher/provoquer : Seneweb, Dakaractu, Le Quotidien, Sud Quotidien, PressAfrik,
  RFI / BBC Afrique / Jeune Afrique (angles : civic tech, transparence budgétaire, open data)
- Mentions académiques ou rapports OSC (Afrobaromètre, OSIWA, WACSI…) si existants
- Chaque partenariat (fin 2025+) qui donne lieu à une publication tierce

> Une interview du fondateur = source **primaire** pour Wikipédia (utilisable pour des faits,
> pas pour la notoriété). Ce qui compte : des articles **écrits par des tiers, sur** le projet.

## 3. Démarche de création Wikipédia (quand les sources sont là)

1. **Créer un compte** personnel (pas un compte « ViePubliqueSN » — les comptes au nom d'une
   organisation sont bloqués à vue).
2. **Déclarer le conflit d'intérêts** sur sa page utilisateur (obligatoire, WP:CI) :
   « Je contribue sur des sujets liés à l'association Vie-Publique.sn dont je suis membre. »
   C'est bien vu et ça protège l'article ; ne pas le faire = risque de blocage + suppression.
3. Rédiger dans son **brouillon** (`Utilisateur:X/Brouillon`), ton strictement neutre,
   **chaque affirmation sourcée** (voir proposition §4). Pas d'adjectifs promotionnels
   (« innovant », « unique »…), pas de « nous ».
4. Faire relire via le **Forum des nouveaux** ou le **Projet:Sénégal** / Projet:Afrique
   (demander un avis d'admissibilité AVANT publication).
5. Publier dans l'espace principal seulement après avis favorable. Ensuite : ne plus éditer
   soi-même que pour des faits sourcés mineurs ; passer par la page de discussion pour le reste.

## 4. Proposition de contenu (brouillon à sourcer)

> Chaque [réf] doit pointer vers une source secondaire. Les chiffres (corpus…) se sourcent
> par le site lui-même (source primaire acceptable pour des données factuelles simples).

```wikitext
{{Infobox Association
 | nom            = Vie-Publique.sn
 | logo           =
 | but            = Accès à l'information publique et transparence au Sénégal
 | zone d'influence = Sénégal
 | fondation      = 2024
 | siège          = Dakar, Sénégal
 | structure      = Association à but non lucratif
 | financement    = Dons, bénévolat, partenariats de projets
 | site web       = https://www.vie-publique.sn
}}

'''Vie-Publique.sn''' est une plateforme numérique citoyenne sénégalaise qui centralise
et rend accessibles les informations publiques de la République du Sénégal : composition
du gouvernement, travaux de l'Assemblée nationale, budget de l'État, Journal officiel,
rapports des corps de contrôle, nominations et données électorales[réf].

Indépendante de tout gouvernement et de toute organisation politique, elle est animée par
des bénévoles et financée par des dons[réf]. Son code source est publié en open source[réf].

== Histoire ==
Le projet est lancé en 2024 par des bénévoles sénégalais[réf]. Il s'inscrit dans le mouvement de la
''civic tech'' africaine, qui utilise le numérique pour renforcer la transparence de
l'action publique[réf]. À partir de fin 2025, l'association noue des partenariats de
projets tout en conservant son modèle bénévole[réf].

== Fonctionnement ==
La plateforme agrège des sources officielles primaires : Journal officiel, communiqués du
Conseil des ministres, documents budgétaires, comptes rendus et votes de l'Assemblée
nationale, rapports de la Cour des comptes, de l'OFNAC et de l'Inspection générale
d'État[réf]. Chaque document est daté, catégorisé et relié à sa source. En 2026, le corpus
dépasse 10 000 documents officiels, dont certains remontent à 1900[réf].

== Contenus ==
Le site propose notamment le suivi des 170 députés de la XVe législature (votes, questions
écrites), des visualisations du budget national par ministère, un annuaire des sites
publics, des fiches biographiques de personnalités publiques et des dossiers thématiques[réf].
L'association produit également un podcast consacré à la vie publique sénégalaise[réf].

== Réception ==
<!-- N'écrire cette section QUE depuis des sources tierces : passage à la RTS[réf],
articles de presse, citations dans des rapports d'OSC ou travaux académiques. C'est la
section qui porte l'admissibilité de l'article. -->

== Notes et références ==
{{Références}}

== Liens externes ==
* {{Site officiel|https://www.vie-publique.sn}}

{{Portail|Sénégal|Internet|politique}}
```

## 5. Suivi

- [x] Date de fondation tranchée : **2024** (lancement public avril 2024) — llms.txt harmonisé
- [ ] Créer l'item Wikidata + reporter le QID dans le `sameAs` du schema Organization
- [ ] Constituer le tableau des sources presse (et provoquer 1–2 articles via relations presse)
- [ ] Brouillon Wikipédia + relecture Projet:Sénégal
- [ ] Après publication : ajouter le lien Wikipédia au `sameAs` + à `llms.txt`
