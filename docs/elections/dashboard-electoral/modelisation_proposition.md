# Proposition de Modélisation du Système Électoral (Générique)

Cette proposition vise à étendre le modèle de données actuel pour supporter les trois types d'élections au Sénégal : **Législatives**, **Présidentielles**, et **Locales**, en accord avec le code électoral et les spécifications du "Dashboard Électoral".

## 1. Analyse des Écarts (Baseline vs Cible)

Le modèle initial était principalement orienté vers les *Législatives*. Pour atteindre la cible, les ajustements suivants ont été identifiés et en partie implémentés :

- **Présidentielles** :
  - Circonscription unique (Nationale) au sommet, avec drill-down vers les départements/bureaux.
  - Gestion des **Tours** (1er et 2nd tour).
  - Candidats portés par des coalitions ou partis.
- **Locales** :
  - Circonscriptions au niveau **Commune**.
  - Scrutin mixte (majoritaire/proportionnel).

## 2. État du Modèle Implémenté (`export-elections-remote.json`)

Les collections ont été enrichies pour couvrir l'intégralité du cycle électoral :

### Collection `elections`
- **`type`** (Dropdown) : Définit la nature du scrutin pour adapter les logiques métiers (ex: `presidential` vs `locale`).
- **`rounds`** (Integer) : Précise si l'élection comporte un ou deux tours.
- **`year`** (Integer) : Année de référence du scrutin (obligatoire pour l'archivage).
- **`election_date`** (Date) : Date effective du premier tour du scrutin.
- **`registration_deadline`** (Timestamp) : Date et heure limite pour le dépôt des candidatures (contrôle de validité).
- **`campaign_start_date`** / **`campaign_end_date`** (Date) : Définit la période de campagne pour le suivi médiatique et légal.
- **`description`** (Text) : Note descriptive ou résumé du contexte de l'élection.
- **`date_round_2`** (Date) : Date prévue pour le second tour (essentiel pour les présidentielles).

### Collection `election_constituencies` (Circonscriptions)
- le champ **`type`** permet de distinguer `nationale` | `diaspora`
et faut avoir un autre champ (`nationale_type` par exemple) qui permet de savoir si une circonscription nationale est de type `departement` | `commune`
- **`type`** (Dropdown) : Hiérarchie complète (National, Région, Département, Commune, Diaspora) pour un drill-down précis.
- **`parent`** (M2O) : Permet la navigation descendante (ex: voir les communes d'un département donné).
- **`seats`** (Integer) : Nombre de sièges à pourvoir, utilisé pour calculer la répartition post-résultats.

### Collection `election_candidates`
- **`role`** (Dropdown) : Distingue les **Titulaires** des **Suppléants** conformément au code électoral.
- **`position`** (Integer) : Rang du candidat sur la liste (définit l'ordre d'élection).

### Collection `resultats`
- **`round`** (Integer) : Distingue les votes du 1er et du 2nd tour.
- **`votes`** / **`pourcentage`** : Performance brute et relative par liste/candidat.
- **`bureau_vote`** (M2O) : Niveau de granularité le plus fin pour l'analyse des données.

## 3. Évolutions Recommandées (Prochaines Étapes)

Basé sur `specs-dashboard-electoral.md`, les ajouts restants concernent la gestion des documents et la synthèse des données :

1. **`chargement_pv`** :
   - Ajouter un champ `fichier` (File ID) pour l'upload direct du PV scanné.
   - Ajouter `date_publication` (Date) pour tracer la fraîcheur de l'info.
2. **`resultats`** : Intégrer les champs de synthèse par zone (Inscrits, Votants, Bulletins nuls/blancs) au niveau supérieur pour optimiser les performances d'affichage.
3. **`elections.status`** : Mettre en œuvre la logique d'états (Programmée, Enregistrement, Campagne, En cours, Terminée) pour automatiser certains comportements UI.

*Note : Ce document sert de référence pour l'évolution du schéma Directus et l'alignement des développements frontend.*
