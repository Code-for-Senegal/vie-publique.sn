Contexte complémentaire

Nous allons maintenant améliorer et structurer l’expérience utilisateur du dashboard des projets publics.

Le modèle de données est déjà en place, avec notamment :
- is_in_pres (boolean)
- is_in_pip (boolean)

Important :
- Tous les projets actuels sont des projets d’investissement (logique PIP)
- PRES est un sous-ensemble stratégique des projets
- Certains projets ont un budget total (PIP)
- D’autres ont des budgets annuels (AE / CP, notamment PRES)

Objectif

Améliorer la V1 existante en :
- renforçant la lisibilité
- respectant la logique métier
- évitant toute confusion budgétaire
- structurant les dashboards sans dupliquer la logique

Principes à respecter absolument

1. Ne pas dupliquer la logique
- Utiliser les mêmes composants
- Utiliser les mêmes filtres
- Factoriser un maximum
- Les dashboards sont des variations d’un même socle

2. UX claire et hiérarchisée
- Priorité à la lisibilité citoyenne
- Structure simple, compréhensible immédiatement
- Éviter toute surcharge
- Bien distinguer les types de données

3. Cohérence métier (CRITIQUE)
- Ne jamais confondre :
  - budget total projet
  - AE (autorisation d’engagement)
  - CP (crédit de paiement)
- Les labels doivent être explicites :
  - “Budget total projet”
  - “AE 2026”
  - “CP 2026”
- Si une donnée n’existe pas → afficher “non documenté” proprement

4. Gestion intelligente des budgets
- PIP → afficher budget total projet
- PRES → afficher AE / CP selon année/version sélectionnée
- Dashboard combiné → afficher les deux de manière claire et non ambiguë
- Ne jamais mélanger ou additionner des choses incompatibles

5. KPI intelligents (très important)
Les KPI doivent s’adapter selon le contexte :

Dashboard PIP :
- nombre total de projets
- budget total des projets
- nombre de ministères
- nombre de secteurs

Dashboard PRES :
- nombre de projets PRES
- nombre de ministères
- total AE (année sélectionnée)
- total CP (année sélectionnée)
- répartition par secteur

Dashboard combiné :
- KPI séparés :
  - budget total projets (PIP)
  - total AE
  - total CP

6. Badges visuels
Ajouter des badges visibles et clairs :

- PRES → badge vert (visible)
- PIP → badge bleu

Ils doivent apparaître :
- dans le tableau
- dans la fiche projet
- éventuellement dans les cartes

7. UX différenciée PRES vs PIP
Même base, mais adaptation visuelle :

PIP :
- logique “stock”
- budget total mis en avant

PRES :
- logique “exécution”
- AE / CP mis en avant

8. Organisation des dashboards

Créer 3 vues distinctes mais basées sur le même socle :

1. Dashboard global
URL :
/observatoire/projets-publics

- vue combinée
- tous les projets
- filtres complets

2. Dashboard PRES
URL :
/observatoire/projets-publics-senegal/pres

- filtre forcé : is_in_pres = true
- orientation exécution (AE / CP)
- KPI adaptés

3. Dashboard PIP
URL :
/observatoire/projets-publics-senegal/pip

- filtre : is_in_pres = false
- orientation stock (budget total)
- KPI adaptés

Important :
- ne pas recréer 3 pages totalement différentes
- utiliser une base commune avec configuration (mode)

9. Tableau projets (important)

Adapter la colonne budget :

- PIP :
  → afficher “Budget total projet”

- PRES :
  → afficher “AE / CP année sélectionnée”

- Global :
  → afficher les deux de manière lisible

10. Fiche projet

Structurer en blocs :

- Informations générales
- Badges (PRES / PIP)
- Budget global (si disponible)
- Budgets annuels (AE / CP)
- Documents
- Métadonnées

Objectif du livrable

Je veux une proposition claire et structurée comprenant :

1. Organisation des 3 dashboards (global, PRES, PIP)
2. Adaptation UX selon chaque mode
3. Liste des composants à factoriser
4. Règles d’affichage des budgets (très détaillées)
5. Structure des KPI selon le contexte
6. Comportement des filtres
7. Améliorations UI/UX concrètes

Important :
- rester simple
- rester cohérent
- éviter toute complexité inutile
- privilégier une V1 solide et évolutive
