# Extracteur de Sommaire pour Journaux Officiels

Ce script Node.js en TypeScript permet d'extraire automatiquement le sommaire des journaux officiels à partir de fichiers PDF scannés.

## Fonctionnalités

- Analyse les PDF scannés pour détecter le sommaire
- Utilise la reconnaissance optique de caractères (OCR) pour les documents scannés
- Extrait le texte des PDF qui contiennent déjà du texte sélectionnable
- Identifie automatiquement les pages contenant le sommaire
- Extrait et structure le contenu du sommaire
- Enregistre le sommaire dans un fichier texte

## Prérequis

- Node.js (v14 ou supérieur)
- npm ou yarn
- Les dépendances nécessaires pour la bibliothèque canvas (pour l'environnement Node.js)

### Installation des dépendances système pour canvas

#### Sur Ubuntu/Debian:
```bash
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
```

#### Sur macOS:
```bash
brew install pkg-config cairo pango libpng jpeg giflib librsvg
```

#### Sur Windows:
Suivez les instructions sur https://github.com/Automattic/node-canvas/wiki/Installation:-Windows

## Installation

1. Clonez ce dépôt ou téléchargez les fichiers
2. Installez les dépendances :

```bash
# Copiez le fichier package.json spécifique
cp sommaire-package.json package.json

# Installez les dépendances
npm install
```

## Utilisation

1. Assurez-vous que les fichiers PDF à analyser sont dans le dossier `output/` (ils peuvent provenir du script de filigrane)
2. Exécutez le script :

```bash
npm run extract
```

3. Les sommaires extraits seront disponibles dans le dossier `sommaires/` avec le suffixe "-sommaire" ajouté au nom du fichier original.

## Comment ça fonctionne

1. **Détection du sommaire** : Le script analyse les premières pages du PDF (généralement les 5 premières) pour détecter le sommaire en recherchant des mots-clés comme "SOMMAIRE", "TABLE DES MATIÈRES", "MINISTÈRE", etc.

2. **Extraction du texte** :
   - Pour les PDF contenant du texte sélectionnable, le texte est extrait directement
   - Pour les PDF scannés (images), le script utilise Tesseract.js pour effectuer une OCR et extraire le texte

3. **Structuration du sommaire** : Le script filtre les lignes pertinentes du sommaire en identifiant celles qui contiennent des mots-clés ou des numéros de page.

4. **Enregistrement** : Le sommaire structuré est enregistré dans un fichier texte pour une utilisation ultérieure.

## Personnalisation

Vous pouvez modifier les constantes suivantes dans le fichier `src/extract-sommaire-node.ts` :

- `SOMMAIRE_KEYWORDS` : Liste des mots-clés utilisés pour détecter le sommaire
- `INPUT_DIR` : Répertoire contenant les fichiers PDF à analyser (par défaut : "../output")
- `SOMMAIRE_OUTPUT_DIR` : Répertoire où seront enregistrés les sommaires extraits (par défaut : "../sommaires")

## Dépendances principales

- **tesseract.js** : Pour la reconnaissance optique de caractères (OCR)
- **pdf-lib** : Pour la manipulation des fichiers PDF
- **pdfjs-dist** : Pour l'extraction du texte des PDF
- **canvas** : Pour le rendu des pages PDF en images pour l'OCR
- **fs-extra** : Pour les opérations de fichiers 