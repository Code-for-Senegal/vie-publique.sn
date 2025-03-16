import fs from 'fs-extra';
import path from 'path';
import dotenv from 'dotenv';
import * as pdfjs from 'pdfjs-dist';
import fetch from 'node-fetch';
import FormData from 'form-data';
import { createDirectus, rest, staticToken, createItem } from '@directus/sdk';

// Charger les variables d'environnement
dotenv.config();

// Vérifier que les variables d'environnement nécessaires sont définies
if (!process.env.DIRECTUS_URL || !process.env.DIRECTUS_ADMIN_TOKEN || !process.env.MISTRAL_API_KEY) {
  console.error('Erreur: Les variables d\'environnement DIRECTUS_URL, DIRECTUS_ADMIN_TOKEN et MISTRAL_API_KEY doivent être définies dans le fichier .env');
  process.exit(1);
}

// Définition des chemins
const PDF_DIR = path.join(__dirname, '../input-sommaire');
const OUTPUT_DIR = path.join(__dirname, '../sommaires');

// Configuration de l'API Mistral
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_MODEL = 'mistral-large-latest'; // Ou un autre modèle approprié

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
  htmlContent?: string; // HTML généré par Mistral
}

// Interfaces pour la réponse de Mistral
interface MistralActe {
  type: string;
  numero: string | null;
  date: string | null;
  description: string;
}

interface MistralSection {
  nom: string;
  actes: MistralActe[];
}

interface MistralResponse {
  info: {
    numero: string | null;
    date: string | null;
    type: string;
  };
  partieOfficielle: MistralSection[];
  partieNonOfficielle?: {
    contenu: string[];
  };
  html?: {
    content: string;
  };
}

// Fonction pour extraire le texte des premières pages d'un PDF
async function extractTextFromPdfFirstPages(pdfPath: string, numPagesToExtract: number = 2): Promise<string[]> {
  try {
    console.log(`Extraction du texte des ${numPagesToExtract} premières pages du fichier: ${pdfPath}`);
    
    // Charger le document PDF
    const data = new Uint8Array(await fs.readFile(pdfPath));
    const loadingTask = pdfjs.getDocument({ data });
    const pdfDocument = await loadingTask.promise;
    
    const totalPages = pdfDocument.numPages;
    console.log(`Nombre total de pages: ${totalPages}`);
    
    // Limiter le nombre de pages à extraire au nombre total de pages
    const pagesToExtract = Math.min(numPagesToExtract, totalPages);
    
    const textContent: string[] = [];
    
    // Extraire le texte des premières pages
    for (let i = 1; i <= pagesToExtract; i++) {
      const page = await pdfDocument.getPage(i);
      const content = await page.getTextContent();
      
      // Concaténer les éléments de texte
      const pageText = content.items
        .map((item) => 'str' in item ? item.str : '')
        .join(' ')
        .replace(/\s+/g, ' ');
      
      textContent.push(pageText);
    }
    
    return textContent;
  } catch (error) {
    console.error(`Erreur lors de l'extraction du texte du PDF ${pdfPath}:`, error);
    return [];
  }
}

// Fonction pour analyser le texte avec l'API Mistral
async function analyzeTextWithMistral(text: string): Promise<Sommaire | null> {
  try {
    console.log("Analyse du texte avec l'API Mistral...");
    
    // Limiter la taille du texte pour éviter de dépasser les limites de l'API
    // La plupart des modèles ont une limite de contexte (par exemple, 32K tokens)
    const truncatedText = text.substring(0, 30000); // Ajuster selon les besoins
    
    // Préparer le prompt avec des instructions claires
    const prompt = `
Tu es un expert en analyse de documents juridiques, spécialisé dans les Journaux Officiels du Sénégal.

Analyse ce texte extrait d'un Journal Officiel et extrais-en les informations suivantes au format JSON structuré :

1. Informations générales :
   - Numéro du JO: Extrait uniquement le numéro (ex: "7587")
   - Date de publication: Format JJ/MM/AAAA (ex: "05/01/2023")
   - Type: "Ordinaire" ou "Spécial"

2. Partie officielle :
   - Liste des ministères et institutions
   - Pour chaque ministère/institution, liste des actes juridiques avec :
     * Type d'acte (Décret, Arrêté, Loi, etc.)
     * Numéro de l'acte
     * Date de l'acte (format JJ/MM/AAAA)
     * Description complète

IMPORTANT: Pour la date du JO, assure-toi de la formater en JJ/MM/AAAA (jour/mois/année). 
Par exemple, si tu trouves "05 JANVIER 2023" ou "05 JAN 2023", convertis-la en "05/01/2023".

Réponds avec un objet JSON valide ayant la structure suivante, sans aucun texte supplémentaire.
Ce JSON sera ensuite converti en HTML pour être affiché sur un site web, donc assure-toi qu'il est bien structuré :

{
  "info": {
    "numero": "string ou null",
    "date": "string ou null (format JJ/MM/AAAA)",
    "type": "string"
  },
  "partieOfficielle": [
    {
      "nom": "string",
      "actes": [
        {
          "type": "string",
          "numero": "string ou null",
          "date": "string ou null (format JJ/MM/AAAA)",
          "description": "string"
        }
      ]
    }
  ],
  "partieNonOfficielle": {
    "contenu": ["string"]
  },
  "html": {
    "content": "string contenant le HTML complet et bien formaté du sommaire"
  }
}

Pour la partie "html.content", génère un code HTML bien structuré et formaté qui présente le sommaire de manière élégante et professionnelle.
Utilise des balises HTML appropriées (h1, h2, h3, ul, li, strong, em, etc.) et ajoute des classes CSS basiques pour la mise en forme.
Le HTML doit être prêt à être inséré directement dans un éditeur WYSIWYG.

Voici un exemple de structure HTML attendue :
\`\`\`html
<div class="jo-sommaire">
  <h3>Sommaire du Journal Officiel n°[numéro]</h3>
  
  <div class="jo-info">
    <p><strong>Numéro :</strong> [numéro]</p>
    <p><strong>Date :</strong> [date]</p>
    <p><strong>Type :</strong> [type]</p>
  </div>
  
  <div class="jo-partie-officielle">
    <div>PARTIE OFFICIELLE</div>
    
    <div class="jo-ministere">
      <h3>[NOM DU MINISTÈRE]</h3>
      <ul>
        <li><strong>[Type d'acte] n° [numéro] du [date]</strong> - [description]</li>
        <!-- Autres actes -->
      </ul>
    </div>
    
    <!-- Autres ministères -->
  </div>
  
</div>
\`\`\`

Voici le texte du Journal Officiel à analyser :

${truncatedText}
`;
    
    // Appel à l'API Mistral
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
        temperature: 0.1, // Valeur basse pour des réponses plus déterministes
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
    
    // Analyser la réponse JSON
    const content = data.choices[0].message.content;
    console.log("Réponse brute de Mistral reçue");
    
    try {
      const parsedData = JSON.parse(content) as MistralResponse;
      
      // Vérifier la structure de base
      if (!parsedData.info || !Array.isArray(parsedData.partieOfficielle)) {
        console.error("Structure JSON invalide dans la réponse Mistral");
        return null;
      }
      
      // Convertir au format Sommaire
      const sommaire: Sommaire = {
        info: {
          numero: parsedData.info.numero,
          date: parsedData.info.date,
          type: parsedData.info.type || 'Ordinaire'
        },
        partieOfficielle: parsedData.partieOfficielle.map((section: MistralSection) => ({
          nom: section.nom,
          actes: Array.isArray(section.actes) ? section.actes.map((acte: MistralActe) => ({
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
      
      // Stocker le HTML généré par Mistral si disponible
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
  <h3>Sommaire du Journal Officiel n°${sommaire.info.numero || ''}</h3>
  
  <div class="jo-info">
    <p><strong>Numéro :</strong> ${sommaire.info.numero || 'Non spécifié'}</p>
    <p><strong>Date :</strong> ${sommaire.info.date || 'Non spécifiée'}</p>
    <p><strong>Type :</strong> ${sommaire.info.type}</p>
  </div>
  
  <div class="jo-partie-officielle">
    <h4>PARTIE OFFICIELLE</h4>`;
  
  // Sections des ministères
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
  
  // Partie non officielle
  if (sommaire.partieNonOfficielle) {
    html += `
  <div class="jo-partie-non-officielle">
    <h4>PARTIE NON OFFICIELLE</h4>
    <ul>`;
    
    for (const element of sommaire.partieNonOfficielle.contenu) {
      html += `
      <li>${element}</li>`;
    }
    
    html += `
    </ul>
  </div>`;
  }
  
  html += `
</div>`;
  
  return html;
}

// Fonction pour uploader un fichier PDF sur Directus
async function uploadPdfToDirectus(filePath: string): Promise<string | null> {
  try {
    console.log(`Upload du fichier PDF vers Directus: ${filePath}`);
    
    // Lire le fichier en tant que Buffer
    const fileBuffer = await fs.readFile(filePath);
    const fileName = path.basename(filePath);
    
    // Créer un FormData pour l'upload
    const formData = new FormData();
    formData.append('file', fileBuffer, {
      filename: fileName,
      contentType: 'application/pdf'
    });
    
    // Uploader le fichier en utilisant l'API REST directement
    const url = `${process.env.DIRECTUS_URL}/files`;
    const headers = {
      'Authorization': `Bearer ${process.env.DIRECTUS_ADMIN_TOKEN}`,
      ...formData.getHeaders()
    };
    
    console.log(`Tentative d'upload du fichier ${fileName} vers ${url}...`);
    
    // Utiliser fetch pour l'upload
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData
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
  // Regrouper les actes par type
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
  
  // Générer la description concise
  const description = Object.entries(actesByType)
    .map(([type, numeros]) => {
      // Capitaliser le premier caractère du type
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
    
    // Extraire les informations nécessaires
    const { numero, date, type } = sommaire.info;
    
    if (!numero) {
      console.error("Impossible de créer le document: numéro manquant");
      return null;
    }
    
    // Traitement de la date
    let day = '';
    let month = '';
    let year = '';
    let publishDate = '';
    
    if (date) {
      console.log(`Traitement de la date: ${date}`);
      
      // Cas 1: Format JJ/MM/AAAA
      if (date.includes('/')) {
        const parts = date.split('/');
        if (parts.length === 3) {
          [day, month, year] = parts;
          publishDate = `${year}-${month}-${day}`;
          console.log(`Date convertie (format JJ/MM/AAAA): ${publishDate}`);
        }
      } 
      // Cas 2: Format YYYY-MM-DD
      else if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        publishDate = date;
        [year, month, day] = date.split('-');
        console.log(`Date déjà au bon format (YYYY-MM-DD): ${publishDate}`);
      }
      // Cas 3: Format JJ MMM AAAA (ex: 05 JAN 2023)
      else if (date.match(/^\d{1,2}\s+[A-Za-zéûôê]{3,}\s+\d{4}$/)) {
        const parts = date.trim().split(/\s+/);
        if (parts.length === 3) {
          day = parts[0].padStart(2, '0');
          const monthText = parts[1].toLowerCase();
          year = parts[2];
          
          // Convertir le mois en texte en numéro
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
          
          // Essayer de trouver une correspondance pour le mois
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
      // Cas 4: Autres formats possibles (à ajouter selon les besoins)
      
      // Vérifier si la date a été correctement convertie
      if (!publishDate) {
        console.error(`Format de date non reconnu: ${date}`);
        console.error(`Impossible de créer le document: format de date non reconnu. Veuillez vérifier le format de la date dans le PDF ou le nom du fichier.`);
        console.error(`Formats de date acceptés: JJ/MM/AAAA, YYYY-MM-DD, ou JJ MMM AAAA (ex: 05 JAN 2023)`);
        return null;
      }
    } else {
      // Si pas de date, signaler l'erreur
      console.error(`Aucune date n'a été extraite du document. Impossible de créer l'entrée dans Directus.`);
      console.error(`Veuillez vérifier le PDF ou ajouter manuellement la date dans le nom du fichier.`);
      return null;
    }
    
    // Convertir le mois en texte pour le slug et le titre
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
    
    // Créer le slug
    const slug = `JO-${numero}-du-${day}-${monthText}-${year}`;
    
    // Générer une description détaillée avec la liste des actes juridiques
    const detailedDescription = generateDetailedDescription(sommaire);
    
    // Données du document à créer
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
      is_processed_by_ocr: false,
      content_html: htmlContent,
      content_markdown: null
    };
    
    console.log("Données du document à créer:", JSON.stringify(documentData, null, 2));
    
    // Création du document
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
  
  // Cas 1: Format avec date explicite JJ/MM/AAAA ou JJ-MM-AAAA
  const datePattern1 = /(\d{1,2})[/-](\d{1,2})[/-](\d{4})/;
  const match1 = fileName.match(datePattern1);
  if (match1) {
    const [, day, month, year] = match1;
    console.log(`Date extraite du nom de fichier (format JJ/MM/AAAA): ${day}/${month}/${year}`);
    return `${day}/${month}/${year}`;
  }
  
  // Cas 2: Format avec mois en texte (ex: "05 JANVIER 2023" ou "05 JAN 2023")
  const datePattern2 = /(\d{1,2})[\s._-]([A-Za-zéûôê]{3,})[\s._-](\d{4})/i;
  const match2 = fileName.match(datePattern2);
  if (match2) {
    const [, day, monthText, year] = match2;
    console.log(`Date extraite du nom de fichier (format JJ MMM AAAA): ${day} ${monthText} ${year}`);
    return `${day} ${monthText} ${year}`;
  }
  
  // Cas 3: Format avec date inversée AAAA/MM/JJ ou AAAA-MM-JJ
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
    
    // Extraire le texte des premières pages du PDF
    const textPages = await extractTextFromPdfFirstPages(pdfPath, 2);
    
    if (textPages.length === 0) {
      console.error(`Aucun texte extrait du fichier ${pdfPath}`);
      return false;
    }
    
    // Concaténer les pages
    const fullText = textPages.join(' ');
    
    // Analyser le texte avec Mistral
    const sommaire = await analyzeTextWithMistral(fullText);
    
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
    
    // Créer le répertoire de sortie s'il n'existe pas (pour sauvegarder les sommaires localement)
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
      // Ne pas retourner false ici car le traitement a réussi même si la suppression a échoué
    }
    
    return true;
  } catch (error) {
    console.error(`Erreur lors du traitement du fichier ${pdfPath}:`, error);
    return false;
  }
}

// Fonction pour supprimer un fichier
async function deleteFile(filePath: string): Promise<boolean> {
  try {
    await fs.unlink(filePath);
    console.log(`Fichier supprimé: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Erreur lors de la suppression du fichier ${filePath}:`, error);
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
      console.log('Aucun fichier PDF trouvé dans le répertoire input-sommaire.');
      return;
    }
    
    console.log(`Traitement de ${pdfFiles.length} fichiers PDF...`);
    
    let successCount = 0;
    let errorCount = 0;
    const successfullyProcessedFiles: string[] = [];
    
    // Traiter chaque fichier PDF
    for (const file of pdfFiles) {
      const filePath = path.join(PDF_DIR, file);
      
      const success = await processJOPdf(filePath);
      
      if (success) {
        successCount++;
        successfullyProcessedFiles.push(filePath);
      } else {
        errorCount++;
      }
    }
    
    // Supprimer les fichiers traités avec succès
    if (successfullyProcessedFiles.length > 0) {
      console.log(`Suppression de ${successfullyProcessedFiles.length} fichiers traités avec succès...`);
      
      for (const filePath of successfullyProcessedFiles) {
        await deleteFile(filePath);
      }
    }
    
    if (errorCount === 0) {
      console.log(`Traitement terminé avec succès! ${successCount} fichiers traités et supprimés.`);
    } else {
      console.log(`Traitement terminé avec des erreurs: ${successCount} fichiers traités avec succès et supprimés, ${errorCount} échecs.`);
    }
  } catch (error) {
    console.error('Erreur lors du traitement des fichiers:', error);
  }
}

// Exécuter la fonction principale
processAllJOPdfs(); 