import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse, parse_qs
import logging
import json

from extract_dpg_details import extract_dpg_details


# Configuration
BASE_URL = "https://dri.gouv.sn"
MENU_PATH = "/provenances-ressources-documentaires" 
LOG_FILE = "scapping_metadata_log.txt"
DATA_FILE = "metadata.json"

# Configurer le logger
logging.basicConfig(
    filename=LOG_FILE,
    level=logging.INFO,
    format='%(asctime)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

provenances_data = {}

# Liste des liens pour chaque provenance
PROVENANCES = {
    "Assemblée Nationale": "/l%E2%80%99assembl%C3%A9e-nationale-du-s%C3%A9n%C3%A9gal-ou-la-survivance-d%E2%80%99une-tradition-parlementaire-s%C3%A9culaire",
    "Conseil Economique Social et Environnemental": "/cese/conseil-economique-social-et-environnemental",
    "Haut Conseil des Collectivités Territoriales": "/hcct/le-haut-conseil-des-collectivit%C3%A9s-t%C3%A9rritoriales",
    "Médiature de la République": "/le-m%C3%A9diateur-de-la-r%C3%A9publique-r%C3%A9gulateur-des-rapports-entre-les-pouvoirs-publics-et-les-citoyens",
    "Institutions Sous Régionales et Africaines": "/institution/institutions-sous-r%C3%A9gionales-africaines",
    "Les actes promotionnels de la Gouvernance": "/gouvernance/les-actes-promotionnels-de-la-gouvernance"
}


def log_message(message):
    print(message)
    logging.info(message)


def extract_document_types(full_url, provenance):
    """Explore les types de documents disponibles pour une provenance."""
    try:
        response = requests.get(full_url, timeout=10)
        if response.status_code != 200:
            log_message(f"Erreur lors de la requête pour {full_url}")
            return []

        soup = BeautifulSoup(response.content, "html.parser")
        types_section = soup.find("h2", string="Documents à consulter")
        if not types_section:
            log_message(f"Pas de section 'Documents à consulter' pour {full_url}")
            return []

        document_types = []
        for item in types_section.find_next("ul").find_all("li"):
            link = item.find("a")
            if link:
                type_name = link.text.strip()
                type_url = urljoin(BASE_URL, link["href"].strip())
                document_types.append({"name": type_name, "url": type_url})

        return document_types
    except Exception as e:
        log_message(f"Erreur lors de l'extraction des types de documents pour {full_url}: {e}")
        return []


def extract_documents(url, provenance, document_type_name):
    """Extrait les informations détaillées des documents téléchargeables."""
    document_list = []
    page_number = 0

    if provenance == "Assemblée Nationale" and document_type_name == "Déclaration de politique générale":
        document_list = extract_dpg_details()
        log_message(f"{len(document_list)} documents trouvés pour {document_type_name} ({url}).")
        return document_list

    while True:
        # Construire l'URL de la page courante
        paginated_url = f"{url}?page={page_number}" if page_number > 0 else url
        try:
            response = requests.get(paginated_url, timeout=10)
            if response.status_code != 200:
                log_message(f"Erreur lors de la requête pour {paginated_url}")
                break

            soup = BeautifulSoup(response.content, "html.parser")

            # Sélection de la bonne section view-content
            documents_sections = soup.find_all("div", class_="view-content")
            if not documents_sections:
                log_message(f"Pas de section de documents trouvée pour {paginated_url}")
                break

            # On utilise la dernière section qui nous intéresse
            # documents_section = documents_sections[1]
            for documents_section in documents_sections:
                rows = documents_section.find_all("div", class_=["views-row", "views-row-odd", "views-row-even"])
                if not rows:
                    log_message(f"Aucun document trouvé pour {paginated_url}")
                    break

                for row in rows:
                    # Titre
                    try:
                        title_element = row.find("div", class_="views-field-title")
                        title = title_element.find("span", class_="field-content").text.strip() if title_element else ""
                    except Exception as e:
                        # log_message(f"Erreur lors de l'extraction du titre pour {url}: {e}")
                        title = ""

                    # Legislature
                    try:
                        legislature_element = row.find("div", class_="views-field-field-l-gistature")
                        legislature = legislature_element.find("span", class_="field-content").text.strip() if legislature_element else "" 
                    except Exception as e:
                        # log_message(f"Erreur lors de l'extraction de la légende pour {url}: {e}")
                        legislature = ""

                    # Contenu
                    try:
                        body_element = row.find("div", class_="views-field-body")
                        content = body_element.find("div", class_="field-content").text.strip() if body_element else ""
                    except Exception as e:
                        # log_message(f"Erreur lors de l'extraction du contenu pour {url}: {e}")
                        content = ""

                    # Année
                    try:
                        year_element = row.find("div", class_="views-field-field-ann-e")
                        year = year_element.find("div", class_="field-content").text.strip() if year_element else ""
                    except Exception as e:
                        # log_message(f"Erreur lors de l'extraction de l'année pour {url}: {e}")
                        year = "" 

                    # Tags
                    try:
                        tags_element = row.find("div", class_="views-field-field-tags")
                        tags = [tag.text.strip() for tag in tags_element.find_all("a")] if tags_element else []
                    except Exception as e:
                        tags = []

                    # URL du fichier téléchargeable
                    file_url = ""

                    # Cherche un fichier PDF directement dans la section
                    link_elements = row.find_all("a", href=True)
                    for link_element in link_elements:
                        if link_element["href"].endswith(".pdf"):
                            file_url = urljoin(BASE_URL, link_element["href"].strip())
                            break

                    # Ajouter les informations collectées
                    if file_url:
                        document_list.append({
                            "title": title,
                            "content": content,
                            "legislature": legislature,
                            "year": year,
                            "tags": tags,
                            "file_url": file_url
                        })

            # Vérification de la pagination
            pagination = soup.find("ul", class_="pager")
            next_page = pagination and pagination.find("li", class_="pager-next")
            if not next_page:
                break

            page_number += 1

        except Exception as e:
            log_message(f"Erreur lors de l'extraction des documents pour {paginated_url}: {e}")
            break

    log_message(f"{len(document_list)} documents trouvés pour {document_type_name} ({url}).")
    return document_list


def Scraper():
    # Parcourt chaque provenance et collecte les informations
    for provenance, path in PROVENANCES.items():
        full_url = urljoin(BASE_URL, path)
        document_types = extract_document_types(full_url, provenance)

        provenance_data = {"url": full_url, "document_types": []}

        for doc_type in document_types:
            doc_type_name = doc_type["name"]
            doc_type_url = doc_type["url"]
            documents = extract_documents(doc_type_url, provenance, doc_type_name)
            if documents:
                provenance_data["document_types"].append({
                    "type_name": doc_type_name,
                    "url": doc_type_url,
                    "documents": documents
                })

        provenances_data[provenance] = provenance_data

    # Sauvegarde des données extraites
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(provenances_data, f, ensure_ascii=False, indent=4)

    log_message("Extraction terminée.")


# Collecter et Sauvegarder les Metadata des fichiers
Scraper()