import fs from 'fs-extra';
import path from 'path';
import dotenv from 'dotenv';
import * as pdfjs from 'pdfjs-dist';

// Charger les variables d'environnement
dotenv.config();

// Définition des chemins
const PDF_DIR = path.join(__dirname, '../input-sommaire');
const OUTPUT_DIR = path.join(__dirname, '../sommaires');

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

// Fonction pour extraire les informations du JO (numéro, date, type)
function extractJOInfo(text: string): JOInfo {
  console.log("Extraction des informations du JO...");
  
  // Extraire le numéro du JO
  const numeroMatch = text.match(/[Jj]ournal [Oo]fficiel [Nn][°º]\s*(\d+)/);
  const numero = numeroMatch ? numeroMatch[1] : null;
  
  // Extraire la date
  const dateMatch = text.match(/(\d{1,2})[er]?\s+([a-zéûôêç]+)\s+(\d{4})/i);
  let date = null;
  
  if (dateMatch) {
    const jour = dateMatch[1].padStart(2, '0');
    const mois = dateMatch[2].toLowerCase();
    const annee = dateMatch[3];
    
    // Convertir le mois en texte en numéro
    const moisMap: { [key: string]: string } = {
      'janvier': '01', 'janv': '01',
      'février': '02', 'févr': '02', 'fevrier': '02', 'fevr': '02',
      'mars': '03',
      'avril': '04', 'avr': '04',
      'mai': '05',
      'juin': '06',
      'juillet': '07', 'juil': '07',
      'août': '08', 'aout': '08',
      'septembre': '09', 'sept': '09',
      'octobre': '10', 'oct': '10',
      'novembre': '11', 'nov': '11',
      'décembre': '12', 'decembre': '12', 'déc': '12', 'dec': '12'
    };
    
    const moisNum = moisMap[mois];
    if (moisNum) {
      date = `${jour}/${moisNum}/${annee}`;
    }
  }
  
  // Déterminer le type (Ordinaire/Spécial)
  const isSpecial = text.toLowerCase().includes('spécial') || text.toLowerCase().includes('special');
  const type = isSpecial ? 'Spécial' : 'Ordinaire';
  
  console.log(`Informations extraites: Numéro=${numero}, Date=${date}, Type=${type}`);
  
  return { numero, date, type };
}

// Fonction pour identifier les ministères et institutions
function identifyMinisteres(text: string): string[] {
  console.log("Identification des ministères et institutions...");
  
  // Rechercher les ministères et institutions (en majuscules généralement)
  const ministeresPattern = /\b(MINISTÈRE|MINISTERE|PRESIDENCE|PRIMATURE|ASSEMBLÉE|ASSEMBLEE|CONSEIL|COUR|SECRÉTARIAT|SECRETARIAT)[A-ZÉÈÊËÀÂÄÔÖÙÛÜÇ\s,''()-]+\b/g;
  const matches = text.match(ministeresPattern) || [];
  
  // Nettoyer les résultats
  const ministeres = matches.map(m => m.trim())
    .filter((value, index, self) => self.indexOf(value) === index); // Supprimer les doublons
  
  console.log(`${ministeres.length} ministères/institutions identifiés`);
  
  return ministeres;
}

// Fonction pour extraire les actes juridiques pour chaque ministère
function extractActesJuridiques(text: string, ministere: string): ActeJuridique[] {
  console.log(`Extraction des actes juridiques pour: ${ministere}`);
  
  // Trouver la section du ministère dans le texte
  const ministereSectionRegex = new RegExp(`${ministere.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?(?=(MINISTÈRE|MINISTERE|PRESIDENCE|PRIMATURE|ASSEMBLÉE|ASSEMBLEE|CONSEIL|COUR|SECRÉTARIAT|SECRETARIAT)[A-ZÉÈÊËÀÂÄÔÖÙÛÜÇ\\s,''()-]+|PARTIE NON OFFICIELLE|$)`, 'i');
  const ministereSection = text.match(ministereSectionRegex);
  
  if (!ministereSection) {
    console.log(`Aucune section trouvée pour: ${ministere}`);
    return [];
  }
  
  const sectionText = ministereSection[0];
  
  // Rechercher les actes juridiques
  // Formats possibles: Décret n° 2023-123 du 12 janvier 2023..., Arrêté n° 12345 du..., Loi n° 2023-01 du...
  const actesPattern = /(Décret|Arrêté|Arrete|Loi|Ordonnance|Décision|Decision)[\s\S]*?n[°º]\s*(\d+[-\d]*)[^\n.]*du\s+(\d{1,2}[^\d\n]*\d{4})[^\n]*/gi;
  
  const actes: ActeJuridique[] = [];
  let match;
  
  while ((match = actesPattern.exec(sectionText)) !== null) {
    const type = match[1].trim();
    const numero = match[2].trim();
    const dateTexte = match[3].trim();
    const description = match[0].trim();
    
    // Extraire la date au format JJ/MM/AAAA si possible
    const dateMatch = dateTexte.match(/(\d{1,2})[er]?\s+([a-zéûôêç]+)\s+(\d{4})/i);
    let date = null;
    
    if (dateMatch) {
      const jour = dateMatch[1].padStart(2, '0');
      const mois = dateMatch[2].toLowerCase();
      const annee = dateMatch[3];
      
      // Convertir le mois en texte en numéro
      const moisMap: { [key: string]: string } = {
        'janvier': '01', 'janv': '01',
        'février': '02', 'févr': '02', 'fevrier': '02', 'fevr': '02',
        'mars': '03',
        'avril': '04', 'avr': '04',
        'mai': '05',
        'juin': '06',
        'juillet': '07', 'juil': '07',
        'août': '08', 'aout': '08',
        'septembre': '09', 'sept': '09',
        'octobre': '10', 'oct': '10',
        'novembre': '11', 'nov': '11',
        'décembre': '12', 'decembre': '12', 'déc': '12', 'dec': '12'
      };
      
      const moisNum = moisMap[mois];
      if (moisNum) {
        date = `${jour}/${moisNum}/${annee}`;
      }
    }
    
    actes.push({ type, numero, date, description });
  }
  
  console.log(`${actes.length} actes juridiques extraits pour: ${ministere}`);
  
  return actes;
}

// Fonction pour extraire la partie non officielle
function extractPartieNonOfficielle(text: string): PartieNonOfficielle | null {
  console.log("Extraction de la partie non officielle...");
  
  const partieNonOfficielleMatch = text.match(/PARTIE NON OFFICIELLE[\s\S]*/i);
  
  if (!partieNonOfficielleMatch) {
    console.log("Aucune partie non officielle trouvée");
    return null;
  }
  
  const partieNonOfficielleText = partieNonOfficielleMatch[0];
  
  // Extraire les éléments de la partie non officielle
  const elements = partieNonOfficielleText
    .replace(/PARTIE NON OFFICIELLE/i, '')
    .split(/\n+/)
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  console.log(`${elements.length} éléments extraits dans la partie non officielle`);
  
  return { contenu: elements };
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
      markdown += `* ${acte.type} n° ${acte.numero || ''} du ${acte.date || ''} ${acte.description.replace(/^[^:]*:/, '')}\n`;
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
    
    // Extraire les informations du JO
    const joInfo = extractJOInfo(fullText);
    
    // Identifier les ministères et institutions
    const ministeres = identifyMinisteres(fullText);
    
    // Extraire les actes juridiques pour chaque ministère
    const sectionsMinisteres: SectionMinistere[] = [];
    
    for (const ministere of ministeres) {
      const actes = extractActesJuridiques(fullText, ministere);
      
      if (actes.length > 0) {
        sectionsMinisteres.push({ nom: ministere, actes });
      }
    }
    
    // Extraire la partie non officielle
    const partieNonOfficielle = extractPartieNonOfficielle(fullText);
    
    // Créer l'objet sommaire
    const sommaire: Sommaire = {
      info: joInfo,
      partieOfficielle: sectionsMinisteres,
      partieNonOfficielle
    };
    
    // Générer le sommaire au format Markdown
    const markdownSommaire = generateMarkdownSommaire(sommaire);
    
    // Créer le répertoire de sortie s'il n'existe pas
    await fs.ensureDir(OUTPUT_DIR);
    
    // Générer un nom de fichier pour le sommaire
    const fileName = joInfo.numero 
      ? `sommaire-JO-${joInfo.numero}${joInfo.date ? `-${joInfo.date.replace(/\//g, '-')}` : ''}.md`
      : `sommaire-JO-${path.basename(pdfPath, '.pdf')}.md`;
    
    const outputPath = path.join(OUTPUT_DIR, fileName);
    
    // Écrire le sommaire dans un fichier
    await fs.writeFile(outputPath, markdownSommaire);
    
    console.log(`Sommaire généré avec succès: ${outputPath}`);
    
    // Générer également un fichier JSON pour une utilisation ultérieure
    const jsonOutputPath = outputPath.replace('.md', '.json');
    await fs.writeFile(jsonOutputPath, JSON.stringify(sommaire, null, 2));
    
    console.log(`Données JSON générées avec succès: ${jsonOutputPath}`);
  } catch (error) {
    console.error(`Erreur lors du traitement du fichier ${pdfPath}:`, error);
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
      console.log('Aucun fichier PDF trouvé dans le répertoire input.');
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