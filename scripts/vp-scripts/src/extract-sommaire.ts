import fs from 'fs-extra';
import path from 'path';
import { createWorker } from 'tesseract.js';
import { PDFDocument } from 'pdf-lib';
import { getDocument } from 'pdfjs-dist';

// Définition des chemins d'entrée et de sortie
const INPUT_DIR = path.join(__dirname, '../output'); // Utilise les fichiers du dossier output
const SOMMAIRE_OUTPUT_DIR = path.join(__dirname, '../sommaires');

// Configuration pour la détection du sommaire
const SOMMAIRE_KEYWORDS = [
  'SOMMAIRE',
  'TABLE DES MATIÈRES',
  'TABLE DES MATIERES',
  'MINISTÈRE',
  'MINISTERE',
  'DÉCRET',
  'DECRET',
  'ARRÊTÉ',
  'ARRETE'
];

// Fonction pour extraire le texte d'une page PDF
async function extractTextFromPage(pdfPath: string, pageNum: number): Promise<string> {
  try {
    // Utiliser pdf.js pour rendre la page en canvas
    const pdfData = new Uint8Array(await fs.readFile(pdfPath));
    const pdfDoc = await getDocument({ data: pdfData }).promise;
    const page = await pdfDoc.getPage(pageNum);
    
    // Extraire le contenu texte si disponible (pour les PDF avec texte)
    const textContent = await page.getTextContent();
    if (textContent.items.length > 0) {
      return textContent.items.map(item => 'str' in item ? item.str : '').join(' ');
    }
    
    // Si pas de texte disponible, utiliser OCR avec Tesseract
    const worker = await createWorker('fra'); // Langue française
    
    // Obtenir les dimensions de la page
    const viewport = page.getViewport({ scale: 1.5 }); // Scale pour meilleure qualité OCR
    
    // Créer un canvas pour rendre la page
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    // Rendre la page sur le canvas
    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;
    
    // Extraire le texte avec OCR
    const { data } = await worker.recognize(canvas.toDataURL());
    await worker.terminate();
    
    return data.text;
  } catch (error) {
    console.error(`Erreur lors de l'extraction du texte de la page ${pageNum}:`, error);
    return '';
  }
}

// Fonction pour détecter si une page contient le sommaire
function isSommairePage(text: string): boolean {
  const textUpper = text.toUpperCase();
  return SOMMAIRE_KEYWORDS.some(keyword => textUpper.includes(keyword));
}

// Fonction pour extraire et structurer le sommaire
function extractSommaireStructure(text: string): string[] {
  // Diviser le texte en lignes
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Filtrer les lignes qui semblent faire partie du sommaire
  // (contiennent des mots-clés ou des numéros de page)
  const sommaireLines = lines.filter(line => {
    // Vérifier si la ligne contient un numéro de page (format: texte suivi d'un nombre)
    const hasPageNumber = /.*\s+\d+\s*$/.test(line);
    
    // Vérifier si la ligne contient un mot-clé du sommaire
    const hasKeyword = SOMMAIRE_KEYWORDS.some(keyword => 
      line.toUpperCase().includes(keyword)
    );
    
    return hasPageNumber || hasKeyword;
  });
  
  return sommaireLines;
}

// Fonction principale pour extraire le sommaire d'un PDF
async function extractSommaire(pdfPath: string): Promise<string[]> {
  try {
    // Charger le document PDF
    const pdfData = new Uint8Array(await fs.readFile(pdfPath));
    const pdfDoc = await getDocument({ data: pdfData }).promise;
    const numPages = pdfDoc.numPages;
    
    console.log(`Analyse du document ${path.basename(pdfPath)} (${numPages} pages)...`);
    
    // Parcourir les premières pages pour trouver le sommaire
    // (généralement dans les 5 premières pages)
    const pagesToCheck = Math.min(5, numPages);
    let sommaireText = '';
    
    for (let i = 1; i <= pagesToCheck; i++) {
      console.log(`Analyse de la page ${i}...`);
      const pageText = await extractTextFromPage(pdfPath, i);
      
      if (isSommairePage(pageText)) {
        console.log(`Sommaire détecté à la page ${i}`);
        sommaireText += pageText + '\n';
        
        // Si le sommaire continue sur la page suivante, l'extraire aussi
        if (i < pagesToCheck) {
          const nextPageText = await extractTextFromPage(pdfPath, i + 1);
          if (isSommairePage(nextPageText)) {
            sommaireText += nextPageText + '\n';
          }
        }
        
        break;
      }
    }
    
    // Extraire et structurer le sommaire
    return extractSommaireStructure(sommaireText);
  } catch (error) {
    console.error(`Erreur lors de l'extraction du sommaire:`, error);
    return [];
  }
}

// Fonction pour traiter tous les fichiers PDF
async function processAllPdfs() {
  try {
    // Vérifier si les répertoires existent, sinon les créer
    await fs.ensureDir(INPUT_DIR);
    await fs.ensureDir(SOMMAIRE_OUTPUT_DIR);
    
    // Lire tous les fichiers du répertoire d'entrée
    const files = await fs.readdir(INPUT_DIR);
    const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));
    
    if (pdfFiles.length === 0) {
      console.log('Aucun fichier PDF trouvé dans le répertoire d\'entrée.');
      return;
    }
    
    console.log(`Traitement de ${pdfFiles.length} fichiers PDF...`);
    
    // Traiter chaque fichier PDF
    for (const file of pdfFiles) {
      const inputPath = path.join(INPUT_DIR, file);
      const fileNameWithoutExt = path.basename(file, '.pdf');
      const outputPath = path.join(SOMMAIRE_OUTPUT_DIR, `${fileNameWithoutExt}-sommaire.txt`);
      
      console.log(`Extraction du sommaire de ${file}...`);
      
      // Extraire le sommaire
      const sommaire = await extractSommaire(inputPath);
      
      if (sommaire.length > 0) {
        // Écrire le sommaire dans un fichier texte
        await fs.writeFile(outputPath, sommaire.join('\n'));
        console.log(`Sommaire extrait et enregistré sous ${fileNameWithoutExt}-sommaire.txt`);
      } else {
        console.log(`Aucun sommaire détecté dans ${file}`);
      }
    }
    
    console.log('Traitement terminé avec succès!');
  } catch (error) {
    console.error('Erreur lors du traitement des fichiers:', error);
  }
}

// Exécuter la fonction principale
processAllPdfs(); 