Contexte projet

Le frontend interroge déjà Directus via le SDK Directus, avec une architecture existante basée sur composables, logique API déjà en place, et conventions du projet déjà établies.
Je veux que tu t’intègres dans cette architecture existante et que tu NE recrées PAS une nouvelle architecture parallèle.
Tu dois reprendre ma logique actuelle d’implémentation API, mes patterns de composables, mes conventions de code, et proposer une implémentation cohérente avec le projet existant.

Objectif

Je veux implémenter un dashboard public de suivi des projets publics / projets prioritaires / projets PRES dans mon site Vie Publique Sénégal.

Important : la donnée disponible n’est pas homogène.

Cas de données à gérer

1. Certains projets (notamment PIP) disposent d’un budget total projet :
- public_project.budget_total_amount

2. D’autres projets (notamment PRES / LFI 2026) disposent surtout d’un budget annuel, dans la collection :
- public_project_budget_year
avec :
- amount_ae
- amount_cp
- year
- version

Il faut donc concevoir l’interface et la logique de manière à :
- ne pas confondre budget total projet et budget annuel
- pouvoir afficher les deux quand ils existent
- afficher “non documenté” si une donnée n’existe pas
- éviter toute ambiguïté dans les labels et KPI

Collections principales déjà en place

- public_project
- public_project_budget_year
- public_policy
- public_project_sector
- state_entity (pour les ministères)
- documents

Dans public_project, les relations et champs utiles existent déjà ou ont été préparés :
- title
- slug
- summary
- description
- code
- budget_total_amount
- is_pres
- is_priority
- ministry
- sector
- policy_primary
- region_primary_label
- document_primary
- sector_label
- policy_primary_label
- ministry_label

Contraintes d’implémentation

- Réutiliser mon architecture Nuxt 4 existante
- Réutiliser le SDK Directus déjà utilisé dans le projet
- Réutiliser mes patterns de composables existants
- Ne pas faire une architecture API parallèle si mon projet a déjà une logique centralisée
- Si nécessaire, proposer des composables ou utilitaires supplémentaires, mais cohérents avec l’existant
- Code propre, modulaire, maintenable, compatible SEO
- Bien distinguer données brutes et données normalisées
- Penser UX publique et lisibilité citoyenne

Arborescence de pages à proposer

Je veux une arborescence claire, SEO-friendly, cohérente avec Vie Publique Sénégal.

Proposition cible :

1. Page hub dashboard projets
URL :
/projets-publics
ou
/observatoire/projets-publics

Je préfère une structure durable. Tu peux me recommander la meilleure option SEO + cohérence produit.
Cette page doit afficher :
- titre éditorial clair
- résumé
- KPI principaux
- filtres
- visualisations
- tableau liste des projets

2. Page détail projet
URL :
/projets-publics/[slug]
ou
/observatoire/projets-publics/[slug]

Cette page doit afficher :
- titre du projet
- résumé / description
- ministère
- secteur
- axe / policy
- région
- source
- document principal
- budget total projet si disponible
- historique budgétaire annuel (AE / CP) si disponible
- tableau ou graphique d’évolution
- documents liés

Je veux que tu recommandes la meilleure structure d’URL pour :
- SEO
- lisibilité utilisateur
- cohérence avec un portail public de suivi

Structure fonctionnelle attendue

V1 page liste / dashboard :
- KPI :
  - nombre total de projets
  - nombre de projets PRES
  - nombre de ministères
  - nombre de secteurs
  - total AE de l’année/version sélectionnée
  - total CP de l’année/version sélectionnée
- filtres :
  - recherche texte
  - année
  - version budgétaire
  - axe / policy
  - secteur
  - ministère
  - région
  - PRES / non PRES
- visualisations :
  - répartition par secteur
  - répartition par ministère
  - éventuellement carte par région si simple à intégrer
- tableau :
  - projet
  - axe
  - secteur
  - ministère
  - région
  - budget total projet
  - budget annuel sélectionné
  - bouton voir détail

V1 page détail projet :
- header projet
- bloc informations clés
- bloc budget global
- bloc budgets annuels
- bloc documents
- bloc métadonnées / source

Règles métier importantes

1. Ne pas confondre :
- budget_total_amount
- amount_ae
- amount_cp

2. Les KPI financiers annuels doivent être calculés depuis public_project_budget_year selon année/version filtrées.

3. Les montants globaux projet doivent être affichés séparément comme “budget total projet”.

4. Si un projet n’a pas de budget total, afficher une valeur vide ou “non documenté”, sans casser l’interface.

5. Si un projet n’a pas de budget annuel, idem.

6. Les labels UI doivent être explicites :
- “Budget total projet”
- “AE 2026”
- “CP 2026”
- etc.

Ce que j’attends de toi

Je veux un livrable structuré en 5 parties :

1. Recommandation d’arborescence finale des pages avec URLs
2. Structure frontend à créer dans mon projet Nuxt 4 :
   - pages
   - composants
   - composables
   - éventuellement server/api si utile
3. Stratégie d’intégration avec mon architecture Directus SDK existante
4. Structure des requêtes / chargements de données
5. Proposition de code initial pour V1 :
   - page liste dashboard
   - page détail projet
   - composable principal
   - composants principaux

Important :
- adapte-toi à une base de code Nuxt 4 existante
- ne pars pas d’un projet vierge
- explique tes choix
- privilégie une implémentation réaliste, incrémentale et propre
- indique clairement ce qui relève de la V1 et ce qui peut venir plus tard
