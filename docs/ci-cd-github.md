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
Pourquoi ? Parce que nous générons un rapport de couverture de tests (`npm run test:coverage`) pendant le CI. Seule l'analyse via GitHub Actions peut récupérer ce fichier et l'envoyer à SonarCloud pour vous dire "80% du code est testé". L'analyse automatique ne verrait pas ces tests.
