import fs from 'fs-extra';
import path from 'path';
import { createDirectus, rest, staticToken, createItem } from '@directus/sdk';
import dotenv from 'dotenv';
import FormData from 'form-data';
import fetch from 'node-fetch';

// Charger les variables d'environnement
dotenv.config();

// Vérifier que les variables d'environnement nécessaires sont définies
if (!process.env.DIRECTUS_URL || !process.env.DIRECTUS_ADMIN_TOKEN) {
  console.error('Erreur: Les variables d\'environnement DIRECTUS_URL et DIRECTUS_ADMIN_TOKEN doivent être définies dans le fichier .env');
  process.exit(1);
}

// Configuration Directus
const directus = createDirectus(process.env.DIRECTUS_URL)
  .with(staticToken(process.env.DIRECTUS_ADMIN_TOKEN))
  .with(rest());

// Définition des chemins
const PDF_DIR = path.join(__dirname, '../output');

// Interface pour la réponse de fichier
// Cette interface est utilisée pour typer les réponses de l'API Directus
interface DirectusFileResponse {
  id: string;
  title: string;
  [key: string]: unknown;
}

// Fonction pour extraire la date et le numéro du JO à partir du nom de fichier
function extractInfoFromFilename(filename: string): { date: string | null; number: string | null; slug: string | null } {
  console.log(`Extraction des informations du fichier: ${filename}`);
  
  // Formats attendus: 
  // - "JO-7737-du-25-mai-2024-vie-publique"
  // - "JO-7737-25-mai-2024" (sans "du")
  // - "JORS N° 7592 du 26 janvier 2023"
  
  // Extraire le numéro du JO
  const numberMatch = filename.match(/[Nn]°?\s*(\d+)/);
  const numberMatch2 = filename.match(/JO[-\s](\d+)/i);
  const number = numberMatch ? numberMatch[1] : (numberMatch2 ? numberMatch2[1] : null);
  
  console.log(`Numéro extrait: ${number}`);
  
  // Extraire la date
  // Format 1: "du 26 janvier 2023"
  const dateMatch = filename.match(/du\s+(\d{1,2})\s+([a-zéû]+)\s+(\d{4})/i);
  
  // Format 2: "du-25-mai-2024"
  const dateMatch2 = filename.match(/du-(\d{1,2})-([a-zéû]+)-(\d{4})/i);
  
  // Format 3: "JO-7737-25-mai-2024" (sans "du")
  const dateMatch3 = filename.match(/JO-\d+-(\d{1,2})-([a-zéû]+)-(\d{4})/i);
  
  let date = null;
  let day = null;
  let monthText = null;
  let year = null;
  const dateMatchUsed = dateMatch || dateMatch2 || dateMatch3;
  
  if (dateMatchUsed) {
    day = dateMatchUsed[1].padStart(2, '0');
    monthText = dateMatchUsed[2].toLowerCase();
    year = dateMatchUsed[3];
    
    // Convertir le mois en texte en numéro
    const monthMap: { [key: string]: string } = {
      'janvier': '01',
      'février': '02', 'fevrier': '02',
      'mars': '03',
      'avril': '04',
      'mai': '05',
      'juin': '06',
      'juillet': '07',
      'août': '08', 'aout': '08',
      'septembre': '09',
      'octobre': '10',
      'novembre': '11',
      'décembre': '12', 'decembre': '12'
    };
    
    const month = monthMap[monthText];
    if (month) {
      date = `${year}-${month}-${day}`;
    }
  }
  
  console.log(`Date extraite: ${date}`);
  
  // Créer un slug au format JO-7763-du-17-septembre-2024
  let slug = null;
  if (number && day && monthText && year) {
    slug = `JO-${number}-du-${day}-${monthText}-${year}`;
  }
  
  console.log(`Slug généré: ${slug}`);
  
  return { date, number, slug };
}

// Fonction pour uploader un fichier PDF sur Directus
async function uploadPdfToDirectus(filePath: string): Promise<string | null> {
  try {
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
async function processAllPdfs() {
  try {
    // Vérifier si le répertoire existe
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
    const successfullyProcessedFiles: string[] = [];
    
    // Traiter chaque fichier PDF
    for (const file of pdfFiles) {
      try {
        const filePath = path.join(PDF_DIR, file);
        const fileNameWithoutExt = path.basename(file, '.pdf');
        
        console.log(`Traitement de ${file}...`);
        
        const { number, date, slug } = extractInfoFromFilename(fileNameWithoutExt);
        
        if (!number || !date) {
          console.warn(`Impossible d'extraire les informations nécessaires du fichier ${file}`);
          errorCount++;
          continue;
        }
        
        // Extraire le jour, le mois et l'année à partir de la date (format: YYYY-MM-DD)
        const [year, month, day] = date.split('-');
        
        // Convertir le mois en texte
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
        
        // Upload du PDF
        const fileId = await uploadPdfToDirectus(filePath);
        
        if (!fileId) {
          console.error(`Échec de l'upload du fichier ${file}`);
          errorCount++;
          continue;
        }
        
        try {
          console.log(`Tentative de création du document avec type="official_journal"...`);
          
          // Données du document à créer - version complète
          const documentData = {
            status: "published",
            type: "official_journal",
            title: `Journal Officiel n°${number} du ${day} ${monthText} ${year}`,
            description: `Journal Officiel de la République du Sénégal n°${number}`,
            slug: slug,
            publish_date: date,
            jo_number: number,
            jo_type: "ordinary",
            file: fileId,
            is_watermarked: true,
            is_scanned: true,
            has_summary: false,
            is_processed_by_ocr: false,
            content_markdown: null,
            content_html: null
          };
          
          console.log("Données du document à créer:", JSON.stringify(documentData, null, 2));
          
          // Création du document
          console.log(`Tentative de création du document dans la collection "documents"...`);
          const documentResponse = await directus.request(
            createItem("documents", documentData)
          );
          
          console.log("Document créé avec ID:", documentResponse.id);
          console.log(`Document créé avec succès: Journal Officiel n°${number} du ${date.split('-').reverse().join('/')}`);
          successCount++;
          
          // Ajouter le fichier à la liste des fichiers traités avec succès
          successfullyProcessedFiles.push(filePath);
        } catch (documentError: unknown) {
          console.error(`Erreur lors de la création du document:`, documentError instanceof Error ? documentError.message : String(documentError));
          
          // Afficher les détails de l'erreur
          if (documentError && typeof documentError === 'object' && 'errors' in documentError) {
            console.error("Détails de l'erreur:", JSON.stringify((documentError as { errors: unknown }).errors, null, 2));
          }
          
          errorCount++;
        }
      } catch (error) {
        console.error(`Erreur lors du traitement du fichier ${file}:`, error);
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
processAllPdfs(); 