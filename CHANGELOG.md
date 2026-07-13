# Changelog

Grandes évolutions fonctionnelles de Vie-Publique.sn, au fil de l'eau.
Seuls les choix structurants et les nouveautés visibles sont listés — le détail est dans
l'historique git (`git log --grep="^feat"`, Conventional Commits).

## 2026

### Juillet 2026

- **Flux RSS** : 5 flux RSS 2.0 (global, actualités, conseil des ministres, documents, Journal officiel)
- **Refonte de la recherche** (Typesense v2) : index multi-types, synonymes, facettes documents, meilleure pertinence
- **llms.txt / llms-full.txt** : exposition du site aux crawlers IA (GEO), génération dynamique depuis le CMS
- **Coulisses techniques** : pages webinaires récurrents + genèse du projet, stack, audience
- Analytics comportemental (Microsoft Clarity)
- SEO : URLs descriptives (`/id/slug`) et données structurées sur les votes et questions écrites de l'Assemblée

### Juin 2026

- **Dossiers thématiques** (`/dossiers`) : pages de référence rassemblant documents, actualités et podcasts sur un sujet
- **Institutions constitutionnelles** : module dédié, lié aux votes de loi (création/abrogation)
- **Archives et comparaison de décrets** de répartition des services de l'État
- Chantier SEO : NewsArticle, sitemap News, pages organismes de contrôle, maillage personnalités ↔ décrets/JO

### Mai 2026

- **Organisation de l'État** : répartition des services (organigramme), suivi des changements organisationnels, pages ministères et entités parapubliques
- Landing page de l'application mobile (`/app`)

### Avril 2026

- Nouvelles catégories de documents (dont documents budgétaires)
- Sitemap par année

### Mars 2026

- **Dashboards projets publics** : PRES, PIP, carte interactive ; dashboard RAC

### Février 2026

- **Statistiques électorales** : hémicycle, graphiques de résultats (présidentielle et législatives)
- Dashboard corruption (POC)
- Newsletter en page d'accueil ; statistiques réseaux sociaux via le CMS
- Podcasts : formulaire de demande d'invitation, refonte mobile

### Janvier 2026

- **Notifications push** (Firebase Cloud Messaging)
- Carte électorale : données par élection, résultats en vue carte/tableau
- Partage de documents sur les réseaux sociaux

## 2025

- **Décembre** : dashboard électoral (locales, législatives, présidentielle) ; pages à propos, gouvernance, financement ; sitemap dynamique
- **Octobre–novembre** : dons en ligne (PayDunya) ; feature flags ; infrastructure de tests (Vitest + SonarCloud)
- **Septembre** : proxy CMS images/fichiers (URLs pérennes et SEO-friendly)
- **Été** : chantier SEO global ; page listant tous les documents
- **Avril** : chatbot
- **Début d'année** : amélioration PWA et navigation mobile

## 2024 — Lancement

- **Mai** : MVP initial
- **Été** : conseil des ministres, Journal officiel, nominations, annuaire, quiz, newsletter, baromètre
- **Automne** : module budget ; initialisation des modules élections et État
- **Décembre** : PWA installable ; dashboard Assemblée nationale (législature 2024)
