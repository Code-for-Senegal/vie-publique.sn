import fs from 'fs-extra';
import path from 'path';
import dotenv from 'dotenv';
import * as pdfjs from 'pdfjs-dist';
import fetch from 'node-fetch';

// Charger les variables d'environnement
dotenv.config();

// Vérifier que la clé API Mistral est définie
if (!process.env.MISTRAL_API_KEY) {
  console.error('Erreur: La variable d\'environnement MISTRAL_API_KEY doit être définie dans le fichier .env');
  process.exit(1);
}

// Définition des chemins
const PDF_DIR = path.join(__dirname, '../input-sommaire');
const OUTPUT_DIR = path.join(__dirname, '../sommaires');

// Configuration de l'API Mistral
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_MODEL = 'mistral-large-latest'; // Ou un autre modèle approprié

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

// Fonction pour extraire le texte d'un PDF
async function extractTextFromPdf(pdfPath: string): Promise<string[]> {
  try {
    console.log(`Extraction du texte du fichier: ${pdfPath}`);
    
    // Charger le document PDF
    const data = new Uint8Array(await fs.readFile(pdfPath));
    const loadingTask = pdfjs.getDocument({ data });
    const pdfDocument = await loadingTask.promise;
    
    const numPages = pdfDocument.numPages;
    console.log(`Nombre de pages: ${numPages}`);
    
    const textContent: string[] = [];
    
    // Extraire le texte de chaque page
    for (let i = 1; i <= numPages; i++) {
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
   - Numéro du JO
   - Date de publication (format JJ/MM/AAAA)
   - Type (Ordinaire ou Spécial)

2. Partie officielle :
   - Liste des ministères et institutions
   - Pour chaque ministère/institution, liste des actes juridiques avec :
     * Type d'acte (Décret, Arrêté, Loi, etc.)
     * Numéro de l'acte
     * Date de l'acte (format JJ/MM/AAAA)
     * Description complète

3. Partie non officielle (si présente) :
   - Liste des annonces et avis

Réponds avec un objet JSON valide ayant la structure suivante, sans aucun texte supplémentaire.
Ce JSON sera ensuite converti en HTML pour être affiché sur un site web, donc assure-toi qu'il est bien structuré :

{
  "info": {
    "numero": "string ou null",
    "date": "string ou null",
    "type": "string"
  },
  "partieOfficielle": [
    {
      "nom": "string",
      "actes": [
        {
          "type": "string",
          "numero": "string ou null",
          "date": "string ou null",
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
    console.log("Réponse brute de Mistral:", content);
    
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

// Fonction pour générer le sommaire au format Markdown
function generateMarkdownSommaire(sommaire: Sommaire): string {
  console.log("Génération du sommaire au format Markdown...");
  
  let markdown = `# Sommaire du Journal Officiel\n\n`;
  
  // Informations du JO
  markdown += `## Informations\n\n`;
  markdown += `- Numéro : ${sommaire.info.numero || 'Non spécifié'}\n`;
  markdown += `- Date : ${sommaire.info.date || 'Non spécifiée'}\n`;
  markdown += `- Type : ${sommaire.info.type}\n\n`;
  
  // Partie officielle
  markdown += `## Sommaire JORS ${sommaire.info.numero || ''}\n\n`;
  markdown += `_PARTIE OFFICIELLE_\n\n`;
  
  // Sections des ministères
  for (const section of sommaire.partieOfficielle) {
    markdown += `**${section.nom}**\n`;
    
    for (const acte of section.actes) {
      markdown += `* ${acte.type} n° ${acte.numero || ''} du ${acte.date || ''} ${acte.description}\n`;
    }
    
    markdown += '\n';
  }
  
  // Partie non officielle
  if (sommaire.partieNonOfficielle) {
    markdown += `_PARTIE NON OFFICIELLE_\n\n`;
    
    for (const element of sommaire.partieNonOfficielle.contenu) {
      markdown += `* ${element}\n`;
    }
  }
  
  return markdown;
}

// Fonction pour générer le HTML du sommaire
function generateHtmlSommaire(sommaire: Sommaire): string {
  console.log("Génération du HTML du sommaire...");
  
  let html = `<div class="jo-sommaire">
  <h1>Sommaire du Journal Officiel n°${sommaire.info.numero || ''}</h1>
  
  <div class="jo-info">
    <p><strong>Numéro :</strong> ${sommaire.info.numero || 'Non spécifié'}</p>
    <p><strong>Date :</strong> ${sommaire.info.date || 'Non spécifiée'}</p>
    <p><strong>Type :</strong> ${sommaire.info.type}</p>
  </div>
  
  <div class="jo-partie-officielle">
    <h2>PARTIE OFFICIELLE</h2>`;
  
  // Sections des ministères
  for (const section of sommaire.partieOfficielle) {
    html += `
    <div class="jo-ministere">
      <h3>${section.nom}</h3>
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
    <h2>PARTIE NON OFFICIELLE</h2>
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

// Fonction principale pour traiter un fichier PDF
async function processJOPdf(pdfPath: string): Promise<void> {
  try {
    console.log(`\nTraitement du fichier: ${pdfPath}`);
    
    // Extraire le texte du PDF
    const textPages = await extractTextFromPdf(pdfPath);
    
    if (textPages.length === 0) {
      console.error(`Aucun texte extrait du fichier ${pdfPath}`);
      return;
    }
    
    // Concaténer toutes les pages
    const fullText = textPages.join(' ');
    
    // Analyser le texte avec Mistral
    const sommaire = await analyzeTextWithMistral(fullText);
    
    if (!sommaire) {
      console.error(`Échec de l'analyse du texte avec Mistral pour ${pdfPath}`);
      return;
    }
    
    // Générer le sommaire au format Markdown
    const markdownSommaire = generateMarkdownSommaire(sommaire);
    
    // Utiliser le HTML généré par Mistral ou générer notre propre HTML
    const htmlSommaire = sommaire.htmlContent || generateHtmlSommaire(sommaire);
    
    // Créer le répertoire de sortie s'il n'existe pas
    await fs.ensureDir(OUTPUT_DIR);
    
    // Générer un nom de fichier pour le sommaire
    const baseFileName = sommaire.info.numero 
      ? `sommaire-JO-${sommaire.info.numero}${sommaire.info.date ? `-${sommaire.info.date.replace(/\//g, '-')}` : ''}`
      : `sommaire-JO-${path.basename(pdfPath, '.pdf')}`;
    
    const markdownPath = path.join(OUTPUT_DIR, `${baseFileName}.md`);
    const htmlPath = path.join(OUTPUT_DIR, `${baseFileName}.html`);
    const jsonPath = path.join(OUTPUT_DIR, `${baseFileName}.json`);
    
    // Écrire le sommaire dans les fichiers
    await fs.writeFile(markdownPath, markdownSommaire);
    await fs.writeFile(htmlPath, htmlSommaire);
    await fs.writeFile(jsonPath, JSON.stringify({
      ...sommaire,
      html: { content: htmlSommaire }
    }, null, 2));
    
    console.log(`Sommaire généré avec succès:`);
    console.log(`- Markdown: ${markdownPath}`);
    console.log(`- HTML: ${htmlPath}`);
    console.log(`- JSON: ${jsonPath}`);
  } catch (error) {
    console.error(`Erreur lors du traitement du fichier ${pdfPath}:`, error);
  }
}

// Fonction principale pour traiter tous les fichiers PDF
async function processAllJOPdfs() {
  try {
    console.log('Démarrage du traitement des Journaux Officiels avec Mistral AI...');
    
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
    
    // Traiter chaque fichier PDF
    for (const file of pdfFiles) {
      const filePath = path.join(PDF_DIR, file);
      await processJOPdf(filePath);
    }
    
    console.log('\nTraitement terminé avec succès!');
  } catch (error) {
    console.error('Erreur lors du traitement des fichiers:', error);
  }
}

// Exécuter la fonction principale
processAllJOPdfs(); 