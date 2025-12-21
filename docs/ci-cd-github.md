## links

intégration github coolify
https://coolify.io/docs/knowledge-base/git/github/integration

use coolify API

## Pipeline CI/CD (GitHub Actions)

Le projet utilise un workflow GitHub Actions défini dans `.github/workflows/ci-cd.yml`.

### Structure du Workflow

Le pipeline se déclenche sur les `push` et `pull_request` vers les branches `develop` et `main`.

1.  **Job: test-and-analyze**
    *   Installation des dépendances (`npm ci`).
    *   Exécution des tests (`npm run test:coverage`).
    *   **Analyse SonarCloud** : Scan de la qualité du code.

2.  **Job: build-and-push**
    *   Construction de l'image Docker.
    *   Push vers le Github Container Registry (`ghcr.io`).
    *   Cache optimisé (GitHub Actions cache + Registry cache).

### Configuration SonarCloud

L'analyse de code est configurée via le fichier `sonar-project.properties`.

**Si vous changez l'organisation ou la clé du projet :**

1.  Mettez à jour `sonar-project.properties` :
    ```properties
    sonar.projectKey=nouvelle-org_projet
    sonar.organization=nouvelle-org
    ```
2.  Générez un nouveau **Token** sur SonarCloud (My Account > Security).
3.  Mettez à jour le secret GitHub :
    *   Allez dans **Settings > Secrets and variables > Actions**.
    *   Modifiez le secret `SONAR_TOKEN`.

> **Note** : Si vous rencontrez l'erreur "Project not found", c'est généralement que le token n'a pas les droits sur l'organisation configurée.

### Secrets Requis

| Nom Secret | Description |
| :--- | :--- |
| `SONAR_TOKEN` | Token d'accès SonarCloud (User Token recommandé) |
| `GITHUB_TOKEN` | Fourni automatiquement par GitHub Action runner |
