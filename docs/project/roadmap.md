# 📍 Roadmap du projet Vie-publique.sn

Cette feuille de route présente les grandes évolutions prévues pour la plateforme citoyenne **Vie-publique.sn**, afin d’améliorer l’accessibilité à l’information publique au Sénégal et d’offrir de nouveaux outils aux citoyens.

---

## 🧠 Fonctionnalités IA & Recherche

- [ ] **Moteur de recherche intelligent** (full-text, filtré par type de document, date, catégorie…)
  - Recherche unifiée sur tous les contenus (articles, documents, actualités, lois, discours…)
  - Résultats enrichis avec lien, extrait, type, date
  - Priorisation des documents les plus pertinents

- [ ] **Chatbot IA**
  - Interface conversationnelle pour interroger les contenus du site
  - Support des langues 🇫🇷 français et 🌍 wolof si possible
  - Intégration des documents PDF scannés (via OCR ou métadonnées)
  - Réponses avec citations / sources
  - Possibilité de poser des questions précises (ex : “Quelle est la dernière loi sur l’éducation ?”)

---

## 📱 Application mobile

- [ ] **Progressive Web App (PWA)**
  - Compatible Android/iOS
  - Fonctionnement en mode hors-ligne (offline cache)
  - Navigation fluide et rapide
  - Notifications push pour les mises à jour (ex : nouveau Journal Officiel publié)

---

## 🔔 Syndication & contribution

- [x] **Flux RSS** _(fait 2026-07 — voir docs/modules/rss/flux-rss.md)_
  - Flux global du site : `/rss.xml`
  - Flux par rubrique : `/actualites/rss.xml`, `/conseil-des-ministres/rss.xml`, `/documents/rss.xml`, `/documents/journal-officiel-senegal/rss.xml`
  - Extensible aux autres catégories de documents (rapports d'audit, codes…) à la demande

- [ ] **Espace de contribution ouverte**
  - Formulaire pour soumettre un article, un lien, un document
  - Possibilité de commenter certaines publications
  - Modération des contributions via Directus

---

## 🎨 Design & UX

- [ ] **Optimisation du design**
  - Amélioration de la version mobile (responsive, ergonomie)
  - Hiérarchisation de l’information (typographie, couleur, navigation)
  - Accessibilité (polices lisibles, contraste, navigation clavier)

---

## 🔐 Sécurité & Infrastructure

- [ ] **Sécurisation du backend**
  - Renforcement des accès à Directus (authentification, rôles)
  - Protection des documents (PDF, images) hébergés sur `cms.vie-publique.sn`
  - Gestion des permissions fines pour l'API

- [ ] **Cohérence entre front et backend**
  - Frontend : `https://vie-publique.sn`
  - Backend (CMS + API + fichiers) : `https://cms.vie-publique.sn`

---

## ⚡ Performance & Optimisation

- [ ] **Optimisation du cache API** 🔴 PRIORITÉ
  - **Problème** : 48 routes API avec cache fixe identique dev/prod (1h-24h en dev = modifications Directus invisibles)
  - **Solution** : Utiliser `getCacheMaxAge()` pour cache court en dev (30s-5min), long en prod (1h-24h)
  - **Fichier** : `server/utils/cache.ts` déjà créé avec `CacheDuration` constants
  - **Routes à modifier** : 46 fichiers restants (2/48 déjà fait : `budget/years` et `budget/global`)
  - **Détails** : Voir [docs/guidelines/todo-cache-optimization.md](../guidelines/todo-cache-optimization.md)
  - **Temps estimé** : 30-45 min
  - **Impact** : 🚀 Dev plus rapide, 📈 performance prod maintenue

- [ ] **Migration redirections vers routeRules**
  - Migrer les redirections de `runtimeConfig.public.redirects` vers `routeRules` pour meilleures performances
  - Gain : Redirection serveur (Nitro) au lieu de JavaScript client

---

## 📅 Suivi

Ce document est mis à jour régulièrement pour suivre les priorités, choix techniques, et évolutions de la plateforme.

Pour toute contribution ou question :  
📧 contact@vie-publique.sn  
🌐 [https://vie-publique.sn](https://vie-publique.sn)

