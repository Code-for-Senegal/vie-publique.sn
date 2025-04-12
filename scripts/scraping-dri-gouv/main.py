import os
import json
import requests
from urllib.parse import urlparse
# from scraper import Scraper

# Configuration
DATA_FILE = "metadata.json"
DOWNLOAD_DIR = "./documents_dri"


# Collecter et Sauvegarder les informations des fichiers
# Scraper()


# Charger les données extraites
if not os.path.exists(DATA_FILE):
    print(f"Le fichier {DATA_FILE} est introuvable.")
    exit()

with open(DATA_FILE, "r", encoding="utf-8") as f:
    provenances_data = json.load(f)

# Calculer le nombre total de documents
num_documents = sum(
    len(document_type_info.get("documents", []))
    for provenance_info in provenances_data.values()
    for document_type_info in provenance_info.get("document_types", [])
)

print(f"Nombre total de documents à télécharger : {num_documents}\n")

# Créer le répertoire de téléchargement
os.makedirs(DOWNLOAD_DIR, exist_ok=True)


def sanitize_filename(filename):
    """Nettoie le nom des fichiers pour éviter les problèmes système."""
    return "".join(c for c in filename if c.isalnum() or c in (' ', '.', '_', '-')).rstrip()


def download_file(url, save_path):
    """Télécharge un fichier depuis une URL et l'enregistre."""
    try:
        response = requests.get(url, stream=True, timeout=15)
        if response.status_code == 200:
            with open(save_path, 'wb') as file:
                file.write(response.content)
            print(f"Fichier téléchargé : {save_path}")
        else:
            print(f"Échec du téléchargement : {url}")
    except requests.RequestException as e:
        print(f"Erreur lors du téléchargement de {url} : {e}")



# Parcourir les données et télécharger les documents
for provenance, provenance_info in provenances_data.items():
    provenance_name = sanitize_filename(provenance)
    provenance_path = os.path.join(DOWNLOAD_DIR, provenance_name)
    os.makedirs(provenance_path, exist_ok=True)

    for document_type_info in provenance_info.get("document_types", []):
        type_name = sanitize_filename(document_type_info["type_name"])
        type_path = os.path.join(provenance_path, type_name)
        os.makedirs(type_path, exist_ok=True)

        for document in document_type_info.get("documents", []):
            file_url = document.get("file_url")
            if not file_url:
                continue

            # Déterminer le nom de fichier à partir de l'URL
            parsed_url = urlparse(file_url)
            filename = os.path.basename(parsed_url.path)
            filename = sanitize_filename(filename)

            # Chemin complet pour le fichier téléchargé
            save_path = os.path.join(type_path, filename)

            # Télécharger le fichier
            download_file(file_url, save_path)

print("Téléchargement terminé.")