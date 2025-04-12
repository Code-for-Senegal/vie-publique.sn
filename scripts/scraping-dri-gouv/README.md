## readme

Ces scripts automatisent l'extraction, l'organisation et le téléchargement de 400 documents des institutions comme l'Assemblée Nationale, La Primature, le CESE, le HCCT entre autres. Ils collectent les titres, tags, dates, et fichiers PDF, tandis que pour les Déclarations de Politiques Générales (DPG), ils récupèrent les PMs, durées de mandat, images et fichiers PDF associés.

pour chaque document :

- lien_pdf_en_ligne
- categorie
- annee
- titre
- tags
- filename (slug titre)

récupère les 400 documents et génère un metatada json

## TODO

- lier le json au pdf téléchargé via le filename
- scrit pour ajout de watermark vie-publique.sn
- script d'upload vers directus

- OCR Résumé

## To Run

1. Installer les packages:

   ```sh
   pip install requests beautifulsoup4
   ```

2. Extraire les Metadata:

   ```sh
   python scraper.py
   ```

3. Télécharger les fichiers et les classer:
   ```sh
   python main.py
   ```
