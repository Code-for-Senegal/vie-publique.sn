import os
import json
import requests
from urllib.parse import urlparse, urljoin
from bs4 import BeautifulSoup

# Configuration
DPG_URL = "https://dri.gouv.sn/les-d%C3%A9clarations-de-politiques-g%C3%A9n%C3%A9rales"


def extract_dpg_details():
    """Parcourt la page DPG et récupère les détails nécessaires."""
    try:
        response = requests.get(DPG_URL, timeout=15)
        if response.status_code != 200:
            print(f"Erreur lors de l'accès à la page DPG : {DPG_URL}")
            return []

        soup = BeautifulSoup(response.content, "html.parser")
        dpg_data = []

        for row in soup.find_all("div", class_=["views-row", "views-row-odd", "views-row-even"]):
            # Image du portrait
            image_element = row.find("div", class_="views-field-field-image")
            image_url = image_element.find("img")["src"] if image_element else ""
            image_url = urljoin(DPG_URL, image_url) if image_url else ""

            # Durée du mandat
            duration_element = row.find("div", class_="views-field-field-dur-e-mandat")
            duration = duration_element.find("div", class_="field-content").text.strip() if duration_element else ""

            # Lien vers la déclaration
            declaration_element = row.find("div", class_="views-field-field-lien-interventions")
            declaration_url = declaration_element.find("a")["href"] if declaration_element else ""
            declaration_url = urljoin(DPG_URL, declaration_url) if declaration_url else ""

            # Aller dans la page de la déclaration pour récupérer les détails
            # declaration_details = {}
            if declaration_url:
                try:
                    decl_response = requests.get(declaration_url, timeout=15)
                    if decl_response.status_code == 200:
                        decl_soup = BeautifulSoup(decl_response.content, "html.parser")

                        # Nom de l'intervenant
                        name_element = decl_soup.find("div", class_="field-name-field-pr-nom-et-nom-du-premier-m")
                        name = name_element.find("div", class_="field-item").text.strip() if name_element else ""

                        # Date
                        date_element = decl_soup.find("div", class_="field-name-field-date-de-la-d-claration")
                        date = date_element.find("span", class_="date-display-single").text.strip() if date_element else ""

                        # Fichier PDF
                        pdf_element = decl_soup.find("div", class_="field-name-field-fichier-d-claration")
                        file_url = pdf_element.find("a")["href"] if pdf_element else ""
                        file_url = urljoin(declaration_url, file_url) if file_url else ""

                        # declaration_details = {
                        #     "intervenant": name,
                        #     "date": date,
                        #     "pdf_url": pdf_url
                        # }
                        dpg_data.append({
                            "image_url": image_url,
                            "duration": duration,
                            "declaration_url": declaration_url,
                            "intervenant": name,
                            "date": date,
                            "file_url": file_url
                        })
                except requests.RequestException as e:
                    print(f"Erreur lors de l'accès à la déclaration : {declaration_url} : {e}")

            # Ajouter les informations collectées
            # if declaration_details:
            #     dpg_data.append({
            #         "image_url": image_url,
            #         "duration": duration,
            #         "declaration_url": declaration_url,
            #         "details": declaration_details
            #     })

        # # Enregistrement des données
        # with open("dpg_data.json", "w", encoding="utf-8") as f:
        #     json.dump(dpg_data, f, ensure_ascii=False, indent=4)

        # print("Extraction des DPG terminée.")
        return dpg_data

    except requests.RequestException as e:
        print(f"Erreur lors de l'extraction des DPG : {e}")
        return []


# Extraction des données des DPG
# extract_dpg_details()