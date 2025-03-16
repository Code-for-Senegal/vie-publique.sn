import { createDirectus, rest, staticToken, updateItem } from '@directus/sdk';
import dotenv from 'dotenv';
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

// Interface pour les documents
interface Document {
  id: string;
  title?: string;
  slug?: string | null;
  jo_number?: string | null;
}

// Fonction pour extraire le numéro du JO à partir du titre
function extractJoNumberFromTitle(title: string): string | null {
  console.log(`Extraction du numéro JO à partir du titre: ${title}`);
  
  // Format attendu: "Journal Officiel n°7737 du 25 mai 2024"
  const numberMatch = title.match(/[Nn]°\s*(\d+)/);
  
  if (numberMatch && numberMatch[1]) {
    console.log(`Numéro JO extrait: ${numberMatch[1]}`);
    return numberMatch[1];
  }
  
  console.log('Aucun numéro JO trouvé dans le titre');
  return null;
}

// Fonction pour extraire la date à partir du titre
function extractDateFromTitle(title: string): { day: string; monthText: string; year: string } | null {
  console.log(`Extraction de la date à partir du titre: ${title}`);
  
  // Format attendu: "Journal Officiel n°7737 du 25 mai 2024"
  const dateMatch = title.match(/du\s+(\d{1,2})\s+([a-zéûôê]+)\s+(\d{4})/i);
  
  if (dateMatch && dateMatch[1] && dateMatch[2] && dateMatch[3]) {
    const day = dateMatch[1].padStart(2, '0');
    const monthText = dateMatch[2].toLowerCase();
    const year = dateMatch[3];
    
    console.log(`Date extraite: jour=${day}, mois=${monthText}, année=${year}`);
    return { day, monthText, year };
  }
  
  console.log('Aucune date trouvée dans le titre');
  return null;
}

// Fonction pour créer un slug à partir du numéro JO et de la date
function createSlug(joNumber: string, day: string, monthText: string, year: string): string {
  const slug = `JO-${joNumber}-du-${day}-${monthText}-${year}`;
  console.log(`Slug créé: ${slug}`);
  return slug;
}

// Fonction principale pour récupérer et mettre à jour les documents
async function updateMissingFields() {
  try {
    console.log('Récupération des documents officiels publiés sans slug ou jo_number...');
    
    // Construire l'URL de l'API
    const apiUrl = `${process.env.DIRECTUS_URL}/items/documents?filter[status]=published&filter[type]=official_journal&sort=-publish_date&filter[jo_type][_null]=true&fields=id,title,slug,jo_number`;
    
    // Faire la requête à l'API
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.DIRECTUS_ADMIN_TOKEN}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erreur HTTP ${response.status}: ${errorText}`);
      return;
    }
    
    const data = await response.json() as { data: Document[] };
    
    if (!data.data || data.data.length === 0) {
      console.log('Aucun document à mettre à jour.');
      return;
    }
    
    console.log(`${data.data.length} documents à mettre à jour.`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Traiter chaque document
    for (const document of data.data) {
      try {
        console.log(`\nTraitement du document ID: ${document.id}`);
        
        if (!document.title) {
          console.warn(`Le document ${document.id} n'a pas de titre. Impossible de continuer.`);
          errorCount++;
          continue;
        }
        
        // Extraire le numéro JO et la date du titre
        const joNumber = extractJoNumberFromTitle(document.title);
        const dateInfo = extractDateFromTitle(document.title);
        
        if (!joNumber || !dateInfo) {
          console.warn(`Impossible d'extraire les informations nécessaires du titre: ${document.title}`);
          errorCount++;
          continue;
        }
        
        // Créer le slug
        const slug = createSlug(joNumber, dateInfo.day, dateInfo.monthText, dateInfo.year);
        
        // Préparer les données à mettre à jour
        const updateData = {
          jo_number: joNumber,
          slug: slug,
          jo_type: "ordinary" // Valeur par défaut
        };
        
        console.log(`Mise à jour du document ${document.id} avec:`, JSON.stringify(updateData, null, 2));
        
        // Mettre à jour le document
        const _updateResponse = await directus.request(
          updateItem('documents', document.id, updateData)
        );
        
        console.log(`Document ${document.id} mis à jour avec succès.`);
        successCount++;
      } catch (error) {
        console.error(`Erreur lors de la mise à jour du document ${document.id}:`, error);
        errorCount++;
      }
    }
    
    console.log(`\nTraitement terminé: ${successCount} documents mis à jour avec succès, ${errorCount} échecs.`);
  } catch (error) {
    console.error('Erreur lors du traitement des documents:', error);
  }
}

// Exécuter la fonction principale
updateMissingFields(); 