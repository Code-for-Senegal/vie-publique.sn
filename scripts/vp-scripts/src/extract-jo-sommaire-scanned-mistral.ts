import fs from 'fs-extra';
import path from 'path';
import dotenv from 'dotenv';
import * as pdfjs from 'pdfjs-dist';
import fetch from 'node-fetch';
import { createCanvas } from 'canvas';
import { createWorker, PSM } from 'tesseract.js';
import { createDirectus, rest, staticToken, createItem } from '@directus/sdk';
import FormData from 'form-data';

// Charger les variables d'environnement
dotenv.config();

// Vérifier que les variables d'environnement nécessaires sont définies
if (!process.env.DIRECTUS_URL || !process.env.DIRECTUS_ADMIN_TOKEN || !process.env.MISTRAL_API_KEY) {
  console.error('Erreur: Les variables d\'environnement DIRECTUS_URL, DIRECTUS_ADMIN_TOKEN et MISTRAL_API_KEY doivent être définies dans le fichier .env');
  process.exit(1);
}

// Définition des chemins
const PDF_DIR = path.join(__dirname, '../output');
const OUTPUT_DIR = path.join(__dirname, '../sommaires');

// Configuration de l'API Mistral
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_MODEL = 'mistral-large-latest';

// Configuration Directus
const directus = createDirectus(process.env.DIRECTUS_URL)
  .with(staticToken(process.env.DIRECTUS_ADMIN_TOKEN))
  .with(rest());

// Interface pour la réponse de fichier Directus
interface DirectusFileResponse {
  id: string;
  title: string;
  [key: string]: unknown;
}

// Interfaces pour les données structurées
interface JOInfo {
  numero: string | null;
  date: string | null;
  type: string;
}

interface ActeJuridique {
  type: string;
  numero: string | null;
  date: string | null;
  description: string;
}

interface SectionMinistere {
  nom: string;
  actes: ActeJuridique[];
}

interface PartieNonOfficielle {
  contenu: string[];
}

interface Sommaire {
  info: JOInfo;
  partieOfficielle: SectionMinistere[];
  partieNonOfficielle: PartieNonOfficielle | null;
  htmlContent?: string;
}

// Fonction pour extraire les premières pages d'un PDF en images
async function extractFirstPagesAsImages(pdfPath: string, numPages: number = 2): Promise<string[]> {
  try {
    console.log(`Extraction des ${numPages} premières pages en images: ${pdfPath}`);
    
    const data = new Uint8Array(await fs.readFile(pdfPath));
    const loadingTask = pdfjs.getDocument({ data });
    const pdfDocument = await loadingTask.promise;
    
    const totalPages = pdfDocument.numPages;
    console.log(`Nombre total de pages: ${totalPages}`);
    
    const pagesToExtract = Math.min(numPages, totalPages);
    const imagePaths: string[] = [];
    
    for (let i = 1; i <= pagesToExtract; i++) {
      const page = await pdfDocument.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 });
      
      const canvas = createCanvas(viewport.width, viewport.height);
      const context = canvas.getContext('2d');
      
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;
      
      const imagePath = path.join(OUTPUT_DIR, `page_${i}.png`);
      const buffer = canvas.toBuffer('image/png');
      await fs.writeFile(imagePath, buffer);
      imagePaths.push(imagePath);
    }
    
    return imagePaths;
  } catch (error) {
    console.error(`Erreur lors de l'extraction des images du PDF ${pdfPath}:`, error);
    return [];
  }
}

// Fonction pour effectuer l'OCR sur une image
async function performOCR(imagePath: string): Promise<string> {
  try {
    console.log(`OCR sur l'image: ${imagePath}`);
    const worker = await createWorker('fra');
    
    // Configuration optimisée pour les documents juridiques
    await worker.setParameters({
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÀÂÇÈÉÊËÎÏÔÛÙÜàâçèéêëîïôûùü0123456789/-.,()[]{}°\'"',
      tessedit_pageseg_mode: PSM.AUTO, // Mode de segmentation automatique
      tessedit_ocr_engine_mode: '2', // Mode LSTM uniquement
      tessjs_create_pdf: '0',
      tessjs_create_hocr: '0',
      tessjs_create_tsv: '0',
      tessjs_create_box: '0',
      tessjs_create_unlv: '0',
      tessjs_create_osd: '0'
    });
    
    const { data: { text } } = await worker.recognize(imagePath);
    await worker.terminate();
    
    // Nettoyage basique du texte
    return text
      .replace(/\s+/g, ' ') // Remplacer les espaces multiples par un seul espace
      .replace(/\n\s*\n/g, '\n') // Supprimer les lignes vides multiples
      .trim();
  } catch (error) {
    console.error(`Erreur lors de l'OCR sur ${imagePath}:`, error);
    return '';
  }
}

// Fonction pour analyser le texte avec l'API Mistral
async function analyzeTextWithMistral(text: string): Promise<Sommaire | null> {
  try {
    console.log("Analyse du texte avec l'API Mistral...");
    
    const truncatedText = text.substring(0, 30000);
    
    const prompt = `
Tu es un expert en analyse de documents juridiques, spécialisé dans les Journaux Officiels du Sénégal.
Ta tâche est d'extraire EXACTEMENT les informations du sommaire, sans aucune modification ou hallucination.

RÈGLES STRICTES :
1. Ne crée PAS d'informations qui n'existent pas dans le texte
2. Ne modifie PAS les libellés exacts des actes juridiques
3. Si une information est ambiguë ou manquante, utilise null
4. Conserve la casse exacte des textes (majuscules/minuscules)
5. Ne fais PAS d'interprétation ou de reformulation

Analyse ce texte extrait d'un Journal Officiel et extrais-en les informations suivantes au format JSON structuré :

1. Informations générales :
   - Numéro du JO: Extrait uniquement le numéro (ex: "7587")
   - Date de publication: Format JJ/MM/AAAA (ex: "05/01/2023")
   - Type: "Ordinaire" ou "Spécial" (exactement comme indiqué)

2. Partie officielle :
   - Liste des ministères et institutions (conserver le libellé exact)
   - Pour chaque ministère/institution, liste des actes juridiques avec :
     * Type d'acte (conserver le libellé exact: Décret, Arrêté, Loi, etc.)
     * Numéro de l'acte (exactement comme indiqué)
     * Date de l'acte (format JJ/MM/AAAA)
     * Description complète (libellé exact, sans modification)

IMPORTANT: 
- Pour la date du JO, formater en JJ/MM/AAAA
- Ne pas modifier les libellés des actes juridiques
- Ne pas créer d'informations manquantes
- Utiliser null pour les champs non trouvés

Réponds avec un objet JSON valide ayant la structure suivante, sans aucun texte supplémentaire :

{
  "info": {
    "numero": "string ou null",
    "date": "string ou null (format JJ/MM/AAAA)",
    "type": "string"
  },
  "partieOfficielle": [
    {
      "nom": "string (libellé exact)",
      "actes": [
        {
          "type": "string (libellé exact)",
          "numero": "string ou null",
          "date": "string ou null (format JJ/MM/AAAA)",
          "description": "string (libellé exact)"
        }
      ]
    }
  ],
  "partieNonOfficielle": {
    "contenu": ["string"]
  }
}

Voici le texte du Journal Officiel à analyser :

${truncatedText}
`;
    
    const response = await fetch(MISTRAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model: MISTRAL_MODEL,
        messages: [
          { role: "user", content: prompt }
        ],
        temperature: 0.1, // Température très basse pour plus de précision
        response_format: { type: "json_object" }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erreur API Mistral (${response.status}): ${errorText}`);
      return null;
    }
    
    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      console.error("Format de réponse Mistral inattendu:", JSON.stringify(data));
      return null;
    }
    
    const content = data.choices[0].message.content;
    console.log("Réponse brute de Mistral reçue");
    
    try {
      const parsedData = JSON.parse(content);
      
      if (!parsedData.info || !Array.isArray(parsedData.partieOfficielle)) {
        console.error("Structure JSON invalide dans la réponse Mistral");
        return null;
      }
      
      const sommaire: Sommaire = {
        info: {
          numero: parsedData.info.numero,
          date: parsedData.info.date,
          type: parsedData.info.type || 'Ordinaire'
        },
        partieOfficielle: parsedData.partieOfficielle.map((section: SectionMinistere) => ({
          nom: section.nom,
          actes: Array.isArray(section.actes) ? section.actes.map((acte: ActeJuridique) => ({
            type: acte.type,
            numero: acte.numero,
            date: acte.date,
            description: acte.description
          })) : []
        })),
        partieNonOfficielle: parsedData.partieNonOfficielle ? {
          contenu: Array.isArray(parsedData.partieNonOfficielle.contenu) 
            ? parsedData.partieNonOfficielle.contenu 
            : []
        } : null
      };
      
      if (parsedData.html && parsedData.html.content) {
        sommaire.htmlContent = parsedData.html.content;
      }
      
      console.log("Analyse Mistral terminée avec succès");
      return sommaire;
    } catch (parseError) {
      console.error("Erreur lors de l'analyse de la réponse JSON de Mistral:", parseError);
      return null;
    }
  } catch (error) {
    console.error("Erreur lors de l'appel à l'API Mistral:", error);
    return null;
  }
}

// Fonction pour générer le HTML du sommaire (fallback si Mistral ne génère pas de HTML)
function generateHtmlSommaire(sommaire: Sommaire): string {
  console.log("Génération du HTML du sommaire...");
  
  let html = `<div class="jo-sommaire">  
  <div class="jo-info">
    <p><strong>Numéro :</strong> ${sommaire.info.numero || 'Non spécifié'}</p>
    <p><strong>Date :</strong> ${sommaire.info.date || 'Non spécifiée'}</p>
    <p><strong>Type :</strong> ${sommaire.info.type}</p>
  </div>
  
  <h3>Sommaire du Journal Officiel n°${sommaire.info.numero || ''}</h3>

  <div class="jo-partie-officielle">`;
  
  for (const section of sommaire.partieOfficielle) {
    html += `
    <div class="jo-ministere">
      <h5>${section.nom}</h5>
      <ul>`;
    
    for (const acte of section.actes) {
      html += `
        <li><strong>${acte.type} n° ${acte.numero || ''} du ${acte.date || ''}</strong> - ${acte.description}</li>`;
    }
    
    html += `
      </ul>
    </div>`;
  }
  
  html += `
  </div>`;
  
  html += `
</div>`;
  
  return html;
}

// Fonction pour uploader un fichier PDF sur Directus
async function uploadPdfToDirectus(filePath: string): Promise<string | null> {
  try {
    console.log(`Upload du fichier PDF vers Directus: ${filePath}`);
    
    const fileBuffer = await fs.readFile(filePath);
    const fileName = path.basename(filePath);
    
    const form = new FormData();
    form.append('file', fileBuffer, {
      filename: fileName,
      contentType: 'application/pdf'
    });
    
    const url = `${process.env.DIRECTUS_URL}/files`;
    const headers = {
      'Authorization': `Bearer ${process.env.DIRECTUS_ADMIN_TOKEN}`,
      ...form.getHeaders()
    };
    
    console.log(`Tentative d'upload du fichier ${fileName} vers ${url}...`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: form
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erreur HTTP ${response.status}: ${errorText}`);
      return null;
    }
    
    const data = await response.json() as { data: DirectusFileResponse };
    
    if (data && data.data && data.data.id) {
      console.log(`Fichier ${fileName} uploadé avec succès, ID: ${data.data.id}`);
      return data.data.id;
    } else {
      console.error(`Réponse inattendue lors de l'upload de ${fileName}:`, JSON.stringify(data));
      return null;
    }
  } catch (error) {
    console.error(`Erreur détaillée lors de l'upload du fichier ${filePath}:`, error);
    return null;
  }
}

// Fonction pour générer une description détaillée avec la liste des actes juridiques
function generateDetailedDescription(sommaire: Sommaire): string {
  const actesByType: { [key: string]: string[] } = {};
  
  for (const section of sommaire.partieOfficielle) {
    for (const acte of section.actes) {
      if (acte.type && acte.numero) {
        const type = acte.type.trim();
        if (!actesByType[type]) {
          actesByType[type] = [];
        }
        actesByType[type].push(acte.numero);
      }
    }
  }
  
  const description = Object.entries(actesByType)
    .map(([type, numeros]) => {
      const typeCapitalized = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
      return `${typeCapitalized}s N° ${numeros.join(' ')}`;
    })
    .join(' ');
  
  return description;
}

// Fonction pour créer un document dans Directus
async function createDocumentInDirectus(
  fileId: string, 
  sommaire: Sommaire, 
  htmlContent: string
): Promise<string | null> {
  try {
    console.log(`Création du document dans Directus pour le JO n°${sommaire.info.numero || 'inconnu'}`);
    
    const { numero, date, type } = sommaire.info;
    
    if (!numero) {
      console.error("Impossible de créer le document: numéro manquant");
      return null;
    }
    
    let day = '';
    let month = '';
    let year = '';
    let publishDate = '';
    
    if (date) {
      console.log(`Traitement de la date: ${date}`);
      
      if (date.includes('/')) {
        const parts = date.split('/');
        if (parts.length === 3) {
          [day, month, year] = parts;
          publishDate = `${year}-${month}-${day}`;
          console.log(`Date convertie (format JJ/MM/AAAA): ${publishDate}`);
        }
      } 
      else if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        publishDate = date;
        [year, month, day] = date.split('-');
        console.log(`Date déjà au bon format (YYYY-MM-DD): ${publishDate}`);
      }
      else if (date.match(/^\d{1,2}\s+[A-Za-zéûôê]{3,}\s+\d{4}$/)) {
        const parts = date.trim().split(/\s+/);
        if (parts.length === 3) {
          day = parts[0].padStart(2, '0');
          const monthText = parts[1].toLowerCase();
          year = parts[2];
          
          const monthMap: { [key: string]: string } = {
            'jan': '01', 'janvier': '01', 'janv': '01',
            'fev': '02', 'fév': '02', 'février': '02', 'fevrier': '02', 'févr': '02', 'fevr': '02',
            'mar': '03', 'mars': '03',
            'avr': '04', 'avril': '04',
            'mai': '05', 'may': '05',
            'juin': '06', 'jun': '06',
            'juil': '07', 'juillet': '07', 'jul': '07',
            'aou': '08', 'aoû': '08', 'août': '08', 'aout': '08', 'aug': '08',
            'sep': '09', 'sept': '09', 'septembre': '09',
            'oct': '10', 'octobre': '10',
            'nov': '11', 'novembre': '11',
            'dec': '12', 'déc': '12', 'décembre': '12', 'decembre': '12'
          };
          
          let monthNumber = '';
          for (const [key, value] of Object.entries(monthMap)) {
            if (monthText.startsWith(key)) {
              monthNumber = value;
              break;
            }
          }
          
          if (monthNumber) {
            month = monthNumber;
            publishDate = `${year}-${month}-${day}`;
            console.log(`Date convertie (format JJ MMM AAAA): ${publishDate}`);
          }
        }
      }
      
      if (!publishDate) {
        console.error(`Format de date non reconnu: ${date}`);
        console.error(`Impossible de créer le document: format de date non reconnu. Veuillez vérifier le format de la date dans le PDF ou le nom du fichier.`);
        console.error(`Formats de date acceptés: JJ/MM/AAAA, YYYY-MM-DD, ou JJ MMM AAAA (ex: 05 JAN 2023)`);
        return null;
      }
    } else {
      console.error(`Aucune date n'a été extraite du document. Impossible de créer l'entrée dans Directus.`);
      console.error(`Veuillez vérifier le PDF ou ajouter manuellement la date dans le nom du fichier.`);
      return null;
    }
    
    const monthsMap: { [key: string]: string } = {
      '01': 'janvier',
      '02': 'février',
      '03': 'mars',
      '04': 'avril',
      '05': 'mai',
      '06': 'juin',
      '07': 'juillet',
      '08': 'août',
      '09': 'septembre',
      '10': 'octobre',
      '11': 'novembre',
      '12': 'décembre'
    };
    
    const monthText = monthsMap[month] || month;
    
    const slug = `JO-${numero}-du-${day}-${monthText}-${year}`;
    const detailedDescription = generateDetailedDescription(sommaire);
    
    const documentData = {
      status: "draft",
      type: "official_journal",
      title: `Journal Officiel n°${numero} du ${day} ${monthText} ${year}`,
      description: detailedDescription,
      slug: slug,
      publish_date: publishDate,
      jo_number: numero,
      jo_type: type.toLowerCase() === 'spécial' ? "special" : "ordinary",
      file: fileId,
      is_watermarked: true,
      is_scanned: true,
      has_summary: true,
      is_processed_by_ocr: true,
      content_html: htmlContent,
      content_markdown: null
    };
    
    console.log("Données du document à créer:", JSON.stringify(documentData, null, 2));
    
    console.log(`Tentative de création du document dans la collection "documents"...`);
    const documentResponse = await directus.request(
      createItem("documents", documentData)
    );
    
    if (documentResponse && documentResponse.id) {
      console.log("Document créé avec ID:", documentResponse.id);
      console.log(`Document créé avec succès: Journal Officiel n°${numero} du ${day}/${month}/${year}`);
      return documentResponse.id;
    } else {
      console.error("Réponse inattendue lors de la création du document:", JSON.stringify(documentResponse));
      return null;
    }
  } catch (error) {
    console.error("Erreur lors de la création du document:", error);
    if (error && typeof error === 'object' && 'errors' in error) {
      console.error("Détails de l'erreur:", JSON.stringify((error as { errors: unknown }).errors, null, 2));
    }
    return null;
  }
}

// Fonction pour tenter d'extraire la date du nom du fichier
function extractDateFromFileName(fileName: string): string | null {
  console.log(`Tentative d'extraction de la date du nom de fichier: ${fileName}`);
  
  const datePattern1 = /(\d{1,2})[/-](\d{1,2})[/-](\d{4})/;
  const match1 = fileName.match(datePattern1);
  if (match1) {
    const [, day, month, year] = match1;
    console.log(`Date extraite du nom de fichier (format JJ/MM/AAAA): ${day}/${month}/${year}`);
    return `${day}/${month}/${year}`;
  }
  
  const datePattern2 = /(\d{1,2})[\s._-]([A-Za-zéûôê]{3,})[\s._-](\d{4})/i;
  const match2 = fileName.match(datePattern2);
  if (match2) {
    const [, day, monthText, year] = match2;
    console.log(`Date extraite du nom de fichier (format JJ MMM AAAA): ${day} ${monthText} ${year}`);
    return `${day} ${monthText} ${year}`;
  }
  
  const datePattern3 = /(\d{4})[/-](\d{1,2})[/-](\d{1,2})/;
  const match3 = fileName.match(datePattern3);
  if (match3) {
    const [, year, month, day] = match3;
    console.log(`Date extraite du nom de fichier (format AAAA/MM/JJ): ${day}/${month}/${year}`);
    return `${day}/${month}/${year}`;
  }
  
  console.log("Aucune date n'a pu être extraite du nom de fichier");
  return null;
}

// Fonction principale pour traiter un fichier PDF
async function processJOPdf(pdfPath: string): Promise<boolean> {
  try {
    console.log(`\nTraitement du fichier: ${pdfPath}`);
    
    // Extraction des premières pages en images
    const imagePaths = await extractFirstPagesAsImages(pdfPath);
    
    if (imagePaths.length === 0) {
      console.error(`Aucune image extraite du fichier ${pdfPath}`);
      return false;
    }
    
    // OCR sur chaque image
    let extractedText = '';
    for (const imagePath of imagePaths) {
      const text = await performOCR(imagePath);
      extractedText += text + '\n';
      
      // Nettoyage des fichiers temporaires
      await fs.unlink(imagePath);
    }
    
    // Analyse avec Mistral
    const sommaire = await analyzeTextWithMistral(extractedText);
    
    if (!sommaire) {
      console.error(`Échec de l'analyse du texte avec Mistral pour ${pdfPath}`);
      return false;
    }
    
    // Si la date est manquante, essayer de l'extraire du nom du fichier
    if (!sommaire.info.date) {
      const fileName = path.basename(pdfPath);
      const dateFromFileName = extractDateFromFileName(fileName);
      if (dateFromFileName) {
        console.log(`Date extraite du nom de fichier: ${dateFromFileName}`);
        sommaire.info.date = dateFromFileName;
      }
    }
    
    // Utiliser le HTML généré par Mistral ou générer notre propre HTML
    const htmlContent = sommaire.htmlContent || generateHtmlSommaire(sommaire);
    
    // Créer le répertoire de sortie s'il n'existe pas
    await fs.ensureDir(OUTPUT_DIR);
    
    // Générer un nom de fichier pour le sommaire
    const baseFileName = sommaire.info.numero 
      ? `sommaire-JO-${sommaire.info.numero}${sommaire.info.date ? `-${sommaire.info.date.replace(/\//g, '-')}` : ''}`
      : `sommaire-JO-${path.basename(pdfPath, '.pdf')}`;
    
    const htmlPath = path.join(OUTPUT_DIR, `${baseFileName}.html`);
    const jsonPath = path.join(OUTPUT_DIR, `${baseFileName}.json`);
    
    // Sauvegarder les fichiers localement
    await fs.writeFile(htmlPath, htmlContent);
    await fs.writeFile(jsonPath, JSON.stringify({
      ...sommaire,
      html: { content: htmlContent }
    }, null, 2));
    
    console.log(`Sommaire généré et sauvegardé localement:`);
    console.log(`- HTML: ${htmlPath}`);
    console.log(`- JSON: ${jsonPath}`);
    
    // Uploader le PDF sur Directus
    const fileId = await uploadPdfToDirectus(pdfPath);
    
    if (!fileId) {
      console.error(`Échec de l'upload du fichier ${pdfPath} vers Directus`);
      return false;
    }
    
    // Créer le document dans Directus
    const documentId = await createDocumentInDirectus(fileId, sommaire, htmlContent);
    
    if (!documentId) {
      console.error(`Échec de la création du document dans Directus pour ${pdfPath}`);
      return false;
    }
    
    console.log(`Traitement complet du fichier ${pdfPath} réussi!`);
    console.log(`- Document créé dans Directus avec ID: ${documentId}`);
    console.log(`- Fichier PDF uploadé avec ID: ${fileId}`);
    console.log(`- Sommaire HTML ajouté au champ content_html`);
    
    // Supprimer le fichier PDF après le traitement réussi
    try {
      await fs.unlink(pdfPath);
      console.log(`Fichier PDF supprimé avec succès: ${pdfPath}`);
    } catch (deleteError) {
      console.error(`Erreur lors de la suppression du fichier ${pdfPath}:`, deleteError);
    }
    
    return true;
  } catch (error) {
    console.error(`Erreur lors du traitement du fichier ${pdfPath}:`, error);
    return false;
  }
}

// Fonction principale pour traiter tous les fichiers PDF
async function processAllJOPdfs() {
  try {
    console.log('Démarrage du traitement des Journaux Officiels...');
    
    // Vérifier si le répertoire d'entrée existe
    await fs.ensureDir(PDF_DIR);
    
    // Lire tous les fichiers du répertoire
    const files = await fs.readdir(PDF_DIR);
    const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));
    
    if (pdfFiles.length === 0) {
      console.log('Aucun fichier PDF trouvé dans le répertoire output.');
      return;
    }
    
    console.log(`Traitement de ${pdfFiles.length} fichiers PDF...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Traiter chaque fichier PDF
    for (const file of pdfFiles) {
      const filePath = path.join(PDF_DIR, file);
      const success = await processJOPdf(filePath);
      
      if (success) {
        successCount++;
      } else {
        errorCount++;
      }
    }
    
    if (errorCount === 0) {
      console.log(`Traitement terminé avec succès! ${successCount} fichiers traités.`);
    } else {
      console.log(`Traitement terminé avec des erreurs: ${successCount} fichiers traités avec succès, ${errorCount} échecs.`);
    }
  } catch (error) {
    console.error('Erreur lors du traitement des fichiers:', error);
  }
}

// Exécuter la fonction principale
processAllJOPdfs(); 