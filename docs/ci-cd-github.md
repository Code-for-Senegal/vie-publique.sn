## links

intégration github coolify
https://coolify.io/docs/knowledge-base/git/github/integration

use coolify API

## Pipeline CI/CD (GitHub Actions)

Ce document explique le fonctionnement du pipeline d'intégration et de déploiement continu du projet `vie-publique.sn`.

---

### 1. Fonctionnement du Workflow

Le fichier de configuration se trouve ici : `.github/workflows/ci-cd.yml`

Le pipeline se déclenche automatiquement à chaque **Push** ou **Pull Request** sur les branches `main` et `develop`. Il suit deux étapes principales (Jobs) :

#### A. Job `test-and-analyze` (Qualité)
Ce job vérifie que le code est sain avant d'aller plus loin.
1.  **Démarrage** : Utilise une machine virtuelle Ubuntu.
2.  **Préparation** : Installe Node.js v22 et les dépendances du projet (`npm ci`).
3.  **Tests** : Lance les tests unitaires avec couverture de code (`npm run test:coverage`).
4.  **SonarCloud Scan** : Analyse la qualité du code (bugs, failles, code smells).
    *   *Note : Cette étape utilise votre configuration `sonar-project.properties` ci-dessous.*

#### B. Job `build-and-push` (Déploiement)
Ce job ne démarre **QUE** si l'étape précédente a réussi.
1.  **Login** : Se connecte au registre de conteneurs de GitHub (ghcr.io).
2.  **Build** : Construit l'image Docker optimisée pour la production.
3.  **Push** : Envoie l'image sur le registre, prête à être déployée sur votre serveur.
4.  **Cache** : Utilise un système de double cache pour accélérer les futurs builds.

---


### 1.4 Automatisation du Déploiement (CD)

Le déploiement est piloté par les **Webhooks GitHub**, sans modification nécessaire du fichier YAML.

1.  **Build Success** : Le workflow GitHub Actions construit l'image Docker et la pousse sur le registre (`ghcr.io`).
2.  **Event Trigger** : GitHub détecte la mise à jour du package et déclenche l'événement `Packages` (Package published/updated).
3.  **Webhook** : GitHub envoie un signal au Webhook configuré dans les paramètres du repository.
4.  **Coolify** : Coolify reçoit le signal, télécharge la nouvelle image et redémarre le conteneur.

*Configuration requise :*
*   GitHub Repository > Settings > Webhooks.
*   Payload URL : (URL du webhook de déploiement fournie par Coolify).
*   Content type : `application/json`.
*   Trigger : Sélectionner **"Let me select individual events"** > Cocher **"Packages"**.

---

### 2. Configuration SonarCloud


L'analyse code quality est pilotée par deux éléments :

#### Le fichier `sonar-project.properties`
C'est la carte d'identité de votre projet pour SonarCloud.
```properties
# Clé unique du projet (Organisation_NomProjet)
sonar.projectKey=vpsn_vie-publique.sn

# Nom de votre organisation sur SonarCloud
sonar.organization=vie-publique-senegal

# Exclusions (fichiers qu'on ne scanne pas)
sonar.exclusions=**/*.spec.ts,**/*.test.ts,**/*.d.ts,nuxt.config.ts,...
```

#### Les Secrets GitHub
Pour que GitHub puisse parler à SonarCloud, il a besoin d'un passeport (Token).
*   **SONAR_TOKEN** : Secret configuré dans `Settings > Secrets and variables > Actions`.

---

### 3. Gestion des Erreurs Courantes

#### Erreur : "Project not found"
*   **Cause** : Le `SONAR_TOKEN` enregistré dans GitHub n'appartient pas à l'organisation ou la `projectKey` a changé.
*   **Solution** :
    1.  Générez un nouveau token sur SonarCloud (Security).
    2.  Mettez à jour le secret `SONAR_TOKEN` dans GitHub.

#### Erreur : "You are running CI analysis while Automatic Analysis is enabled"
*   **Cause** : Conflit. SonarCloud essaie d'analyser le code automatiquement ALORS que GitHub Actions le fait aussi.
*   **Solution** :
    1.  Allez sur le dashboard SonarCloud du projet.
### 4. FAQ : Automatic Analysis vs CI-based Analysis

**Question** : Pourquoi utiliser le CI GitHub au lieu de l'analyse automatique de SonarCloud ?

| Caractéristique | Analyse Automatique (SonarCloud) | Analyse CI (GitHub Actions) |
| :--- | :--- | :--- |
| **Configuration** | Zéro config (facile) | Fichier YAML + Properties (Complet) |
| **Couverture de Code** | ❌ **Non supporté** (souvent) | ✅ **Oui** (Importe les rapports LCOV) |
| **Contrôle** | Limité | Total (Build, Tests, Lint avant analyse) |
| **Contexte** | Déconnecté du build | Intégré au workflow de validation |

**Verdict** : Pour ce projet, **l'analyse CI est indispensable**.

### 5. Performances et Temps de Build

Un build complet peut prendre **5 à 8 minutes**. Voici pourquoi et comment l'optimiser.

#### Pourquoi est-ce "lent" ? (vs un projet vide)
1.  **Cache Docker (Le plus impactant)** :
    *   Le premier build est toujours long (~60s rien que pour `npm ci`) car il doit tout télécharger.
    *   Les builds suivants sont rapides (~2-3 min) car ils réutilisent le cache de `ghcr.io`.
    *   *Note : Si GitHub vide son cache (tous les 7 jours ou quota dépassé), un build lent se reproduira.*

2.  **PWA (Progressive Web App)** :
    *   Le module `@vite-pwa/nuxt` génère des milliers de hashs pour le mode hors-ligne.
    *   Cela ajoute **~45 Mo** de fichiers au bundle et prend **~2 minutes** de traitement CPU.

#### Pistes d'optimisation
Si le temps de build devient critique (>15 min) :

*   **Désactiver PWA en Staging** : Ne l'activer que pour les tags de production (`v*`).
*   **Réduire les assets** : Optimiser les images statiques avant de les commiter.
*   **Split du Workflow** : Séparer "Tests" et "Build Docker" en deux workflows parallèles (mais attention : on perd la garantie que *ce code testé est ce code buildé*).
