# RAC (Revue Annuelle Conjointe) au Sénégal

La RAC (Revue Annuelle Conjointe) est un mécanisme officiel de suivi-évaluation des politiques publiques.

Le “reporting stratégique annuel” de l’État


# Prompt

Je veux que tu génères une nouvelle page dashboard dans mon projet Nuxt pour afficher un tableau de bord RAC.

Objectif
Créer une page publique dédiée à la RAC 2025 du Sénégal, à partir d’un fichier JSON déjà préparé, en reprenant autant que possible les patterns visuels, techniques et composants déjà utilisés dans autres dashboard des projets publics (/projets-publics-senegal) ou économie (dashboard/economie)

URL attendue
/rac-2025-revue-annuelle-conjointe-senegal

Contexte
La RAC ici signifie Revue annuelle conjointe.
Le dashboard doit présenter les données RAC 2025 portant sur l’état de mise en œuvre de la politique économique et sociale en 2024.

Sources de données déjà disponibles
- public/data/test-rac.json
- public/data/senegal-mapping-pole-regions.json

Important
- Les données doivent être lues depuis le JSON existant.
- Ne pas réinventer de structure métier si le JSON permet déjà de piloter l’affichage.
- Si nécessaire, prévoir seulement de petits helpers de transformation côté frontend.
- Le rendu doit être propre, lisible, institutionnel, moderne, responsive.
- Le style doit rester cohérent avec le reste du site et particulièrement avec le dashboard déjà existant sur les projets publics.

Référence interne à réutiliser
Je veux que tu t’inspires du dashboard existant des projets publics, en particulier :
- la structure générale de la page
- les patterns d’affichage de KPI / sections / cartes
- le composant de carte déjà existant
- le composant MapByRegion.vue

Consigne importante sur la carte
À partir de l’existant, crée un nouveau composant de carte nommé par exemple :
- MapByPole.vue

But de ce composant
- Reprendre la logique de MapByRegion.vue
- Mais au lieu d’afficher des données par région, afficher des données par pôle RAC
- Utiliser le fichier public/data/senegal-mapping-pole-regions.json pour faire la correspondance entre pôles et régions
- Permettre de projeter les données issues du RAC sur la carte selon les pôles
- Si plusieurs régions appartiennent à un même pôle, elles doivent partager la même valeur/couleur
- Prévoir une légende, un tooltip et un comportement responsive
- Réutiliser au maximum la logique du composant existant plutôt que repartir de zéro

Attendu fonctionnel de la page
Créer une page dashboard RAC avec au minimum les blocs suivants si les données sont présentes dans le JSON :

1. Hero / entête
- Titre du dashboard
- Sous-titre
- année / référence
- source institutionnelle
- éventuellement statut ou date du document

2. Vue d’ensemble
- afficher les cartes KPI principales issues de overview.cards
- bien gérer les unités, tendances, deltas, états stable/up/down/improving
- design proche de ce qui existe déjà sur le dashboard projets si pertinent

3. Sections thématiques
Afficher les sections du JSON de manière structurée et agréable, par groupe si disponible :
- secteurs_productifs
- secteurs_appui_production
- secteurs_sociaux
- gouvernance_paix_securite

Pour chaque section :
- titre
- ministère / source si présent
- métriques principales
- faits marquants
- défis

4. Carte territoriale
- intégrer le nouveau composant MapByPole.vue
- utiliser les données de territorial_poles.datasets
- prévoir au moins un dataset sélectionnable si plusieurs existent
- afficher un sélecteur simple si plusieurs jeux de données sont disponibles
- commencer par exploiter en priorité production_cerealiere_2024 si présent
- si un dataset n’a pas assez de données cartographiables, l’afficher autrement sans casser la page

5. Cadre SND 2025-2029
- afficher les éléments de setup_process
- afficher les targets de manière propre
- si pertinent, utiliser tableau ou cartes
- gérer les valeurs annuelles 2025 à 2029 proprement

6. Source et transparence
- afficher clairement que les données viennent du fichier JSON local préparé à partir du document RAC
- prévoir une structure simple pour afficher la source institutionnelle si elle existe dans le JSON

Attendu technique
- Respecter l’architecture existante du projet
- Réutiliser les composants existants quand c’est pertinent
- Créer uniquement les nouveaux composants réellement nécessaires
- Favoriser code propre, lisible, factorisé
- Bien typer si le projet utilise TypeScript
- Prévoir états de chargement / fallback simples si besoin
- Ne pas surcharger la page avec du code inutile

SEO
Configurer correctement la page avec :
- title pertinent
- meta description
- éventuellement og:title et og:description si le projet le fait déjà ailleurs

Proposition SEO attendue
- title: RAC 2025 - Revue annuelle conjointe du Sénégal
- description: Tableau de bord RAC 2025 du Sénégal : suivi de la mise en œuvre de la politique économique et sociale en 2024, indicateurs sectoriels, pôles territoriaux et cadre SND 2025-2029.

Contraintes importantes
- Ne pas inventer de données absentes du JSON
- Ne pas mélanger des données RAC avec d’autres sources
- Si certaines données du JSON sont optionnelles, rendre la page robuste
- Si une clé du JSON n’est pas utilisée, le signaler à la fin
- Si une structure du JSON mérite un léger ajustement pour mieux coller au frontend, proposer ce changement de façon minimale et justifiée

Ce que je veux en sortie
Je veux que tu me génères directement :
1. la page Nuxt complète
2. les éventuels nouveaux composants nécessaires
3. le composant MapByPole.vue basé sur la logique de MapByRegion.vue
4. les éventuels helpers utilitaires
5. les éventuels ajustements SEO
6. un court récapitulatif final des fichiers créés/modifiés

Approche souhaitée
Commence par analyser la structure existante du dashboard projets publics et du composant MapByRegion.vue, puis reproduis la même logique adaptée au RAC, sans changer inutilement le style global du projet.
