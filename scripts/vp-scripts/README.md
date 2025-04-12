# Scripts PDF pour vie-publique.sn

Ce projet Node.js en TypeScript contient trois scripts pour le traitement des fichiers PDF :

1. **Script de Filigrane** : Ajoute des filigranes, un logo et des métadonnées aux PDF
2. **Extracteur de Sommaire** : Extrait automatiquement le sommaire des journaux officiels
3. **Upload vers Directus** : Télécharge les PDF traités vers Directus CMS et crée des entrées dans la collection documents

## Prérequis

- Node.js (v14 ou supérieur)
- npm ou yarn
- Pour l'extracteur de sommaire : dépendances système pour la bibliothèque canvas
- Pour l'upload vers Directus : une instance Directus CMS avec un token d'administration

### Installation des dépendances système pour canvas (uniquement pour l'extracteur de sommaire)

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
2. Copiez le fichier `.env.example` en `.env` et configurez vos variables d'environnement :
   ```bash
   cp .env.example .env
   ```
3. Modifiez le fichier `.env` avec vos informations Directus
4. Installez les dépendances :
   ```bash
   npm install
   ```

## Script 1 : Filigrane PDF

### Utilisation

1. Placez vos fichiers PDF dans le dossier `input/`
2. Assurez-vous que le fichier `logo2.jpg` est présent à la racine du projet
3. Exécutez le script :

```bash
npm run watermark
```

4. Les fichiers traités seront disponibles dans le dossier `output/` avec les filigranes ajoutés, le logo, les métadonnées modifiées et le suffixe "vie-publique" dans le nom du fichier.

### Fonctionnalités

- Ajoute un filigrane principal "vie-publique.sn" semi-transparent au centre de chaque page
- Ajoute un filigrane secondaire "Vie-publique.sn - Ne pas reproduire à des fins commerciales" en bas à gauche de chaque page
- Ajoute votre logo en haut à droite et en bas à droite de chaque page
- Modifie les métadonnées PDF pour inclure "Vie-publique.sn" dans les champs Author, Title, Subject, Keywords, Creator et Producer
- Renomme les fichiers en ajoutant le suffixe "vie-publique"
- Préserve la qualité des PDF scannés

### Personnalisation du filigrane

Vous pouvez modifier les constantes suivantes dans le fichier `src/index.ts` :

- `WATERMARK_TEXT` : Texte du filigrane principal (par défaut : "vie-publique.sn")
- `FOOTER_TEXT` : Texte du filigrane en bas de page (par défaut : "Vie-publique.sn - Ne pas reproduire à des fins commerciales")
- `FILE_SUFFIX` : Suffixe ajouté au nom du fichier (par défaut : "vie-publique")
- `METADATA_SOURCE` : Texte utilisé pour les métadonnées (par défaut : "Vie-publique.sn")
- `LOGO_PATH` : Chemin vers le fichier logo (par défaut : "../logo2.jpg" relatif au dossier src)

## Script 2 : Extracteur de Sommaire

### Utilisation

1. Assurez-vous que les fichiers PDF à analyser sont dans le dossier `output/` (ils peuvent provenir du script de filigrane)
2. Exécutez le script :

```bash
npm run extract-sommaire
```

3. Les sommaires extraits seront disponibles dans le dossier `sommaires/` avec le suffixe "-sommaire" ajouté au nom du fichier original.

### Fonctionnalités

- Analyse les PDF scannés pour détecter le sommaire
- Utilise la reconnaissance optique de caractères (OCR) pour les documents scannés
- Extrait le texte des PDF qui contiennent déjà du texte sélectionnable
- Identifie automatiquement les pages contenant le sommaire
- Extrait et structure le contenu du sommaire
- Enregistre le sommaire dans un fichier texte

### Personnalisation de l'extracteur

Vous pouvez modifier les constantes suivantes dans le fichier `src/extract-sommaire-node.ts` :

- `SOMMAIRE_KEYWORDS` : Liste des mots-clés utilisés pour détecter le sommaire
- `INPUT_DIR` : Répertoire contenant les fichiers PDF à analyser (par défaut : "../output")
- `SOMMAIRE_OUTPUT_DIR` : Répertoire où seront enregistrés les sommaires extraits (par défaut : "../sommaires")

## Script 3 : Upload vers Directus

### Configuration

1. Assurez-vous d'avoir configuré le fichier `.env` avec vos informations Directus :
   ```
   DIRECTUS_URL=https://votre-instance-directus.com
   DIRECTUS_ADMIN_TOKEN=votre_token_admin_directus
   ```

### Utilisation

1. Assurez-vous que les fichiers PDF à uploader sont dans le dossier `output/` (ils peuvent provenir du script de filigrane)
2. Exécutez le script :

```bash
npm run upload-directus
```

### Fonctionnalités

- Parcourt les fichiers PDF du dossier `output/`
- Extrait automatiquement la date et le numéro du journal officiel à partir du nom de fichier
- Télécharge chaque PDF vers Directus CMS
- Crée une entrée dans la collection "documents" avec les métadonnées appropriées :
  - Date de publication au format YYYY-MM-DD
  - Titre formaté (ex: "JORS N° 7592 du 26/01/2023")
  - Slug formaté (ex: "JO-7592-du-2023-01-26")
  - Type défini comme "official_journal"
  - Statut défini comme "draft"
  - Type de JO défini comme "ordinary"
  - Numéro de JO extrait du nom de fichier
  - Indicateurs is_scanned et is_watermarked définis à true
  - Indicateurs has_summary et is_processed_by_ocr définis à false

### Personnalisation de l'upload

Vous pouvez modifier les constantes et fonctions suivantes dans le fichier `src/upload-to-directus.ts` :

- `PDF_DIR` : Répertoire contenant les fichiers PDF à uploader (par défaut : "../output")
- `extractJoInfo()` : Fonction pour extraire la date et le numéro du JO à partir du nom de fichier
- `createDocumentEntry()` : Fonction pour créer l'entrée dans la collection documents

## Structure du projet

```
.
├── input/                  # Dossier pour les fichiers PDF d'entrée
├── output/                 # Dossier pour les PDF traités avec filigrane
├── sommaires/              # Dossier pour les sommaires extraits
├── src/                    # Code source
│   ├── index.ts            # Script de filigrane
│   ├── extract-sommaire-node.ts  # Script d'extraction de sommaire
│   └── upload-to-directus.ts     # Script d'upload vers Directus
├── logo2.jpg               # Logo à ajouter aux documents
├── .env                    # Variables d'environnement (non versionné)
├── .env.example            # Exemple de variables d'environnement
├── package.json            # Configuration du projet
└── tsconfig.json           # Configuration TypeScript
```

## Flux de travail complet

Vous pouvez utiliser les trois scripts en séquence pour un traitement complet :

1. Traitez d'abord vos PDF avec le script de filigrane :
   ```bash
   npm run watermark
   ```

2. Extrayez les sommaires des PDF traités (optionnel) :
   ```bash
   npm run extract-sommaire
   ```

3. Uploadez les PDF traités vers Directus CMS :
   ```bash
   npm run upload-directus
   ``` 