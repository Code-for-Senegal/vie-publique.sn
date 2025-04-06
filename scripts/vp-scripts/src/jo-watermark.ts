import fs from "fs-extra";
import path from "path";
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";

// Définition des chemins d'entrée et de sortie
const INPUT_DIR = path.join(__dirname, "../input");
const OUTPUT_DIR = path.join(__dirname, "../output");
const LOGO_PATH = path.join(__dirname, "../logo2.jpg");
const WATERMARK_TEXT = "vie-publique.sn";
const FILE_SUFFIX = "vie-publique";
const METADATA_SOURCE = "Vie-publique.sn";

// Fonction pour ajouter un filigrane à un document PDF et modifier les métadonnées
async function processDocument(
  pdfBytes: Buffer,
  originalFileName: string,
): Promise<Uint8Array> {
  // Charger le document PDF
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();

  // Configurer la police pour le filigrane
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Charger l'image du logo
  const logoImageBytes = await fs.readFile(LOGO_PATH);
  let logoImage;

  // Déterminer le type d'image et l'incorporer
  if (LOGO_PATH.toLowerCase().endsWith(".png")) {
    logoImage = await pdfDoc.embedPng(logoImageBytes);
  } else if (
    LOGO_PATH.toLowerCase().endsWith(".jpg") ||
    LOGO_PATH.toLowerCase().endsWith(".jpeg")
  ) {
    logoImage = await pdfDoc.embedJpg(logoImageBytes);
  } else {
    console.warn(
      "Format de logo non supporté. Seuls PNG et JPEG sont pris en charge.",
    );
  }

  // Modifier les métadonnées
  const fileNameWithoutExt = path.basename(originalFileName, ".pdf");
  pdfDoc.setTitle(`${fileNameWithoutExt} - ${METADATA_SOURCE}`);
  pdfDoc.setAuthor(METADATA_SOURCE);
  pdfDoc.setSubject(METADATA_SOURCE);
  pdfDoc.setKeywords([METADATA_SOURCE, "vie-publique.sn", "document officiel"]);
  pdfDoc.setCreator(METADATA_SOURCE);
  pdfDoc.setProducer(METADATA_SOURCE);

  // Ajouter le filigrane à chaque page
  for (const [pageIndex, page] of pages.entries()) {
    const { width, height } = page.getSize();

    // Premier filigrane (diagonal au centre) uniquement sur la première page
    if (pageIndex === 5) {
      const fontSize = 50;
      const textWidth = helveticaFont.widthOfTextAtSize(
        WATERMARK_TEXT,
        fontSize,
      );

      // Dessiner le texte en diagonale au centre de la page
      page.drawText(WATERMARK_TEXT, {
        x: (width - textWidth) / 2,
        y: height / 2,
        size: fontSize,
        font: helveticaFont,
        color: rgb(0.8, 0.8, 0.8), // Gris clair
        opacity: 0.4, // Semi-transparent
        rotate: degrees(45), // 45 degrés
      });
    }

    if (logoImage) {
      // Définir la hauteur souhaitée pour le logo
      const logoHeight = 15;

      // Calculer la largeur proportionnelle
      const logoWidth = (logoImage.width / logoImage.height) * logoHeight;

      // Positionner le logo dans le coin droit en bas, remonté et décalé légèrement vers la gauche
      page.drawImage(logoImage, {
        x: width - logoWidth - 15, // 15 points de marge à droite (décalé vers la gauche)
        y: 10, // 10 points de marge en bas
        width: logoWidth,
        height: logoHeight,
        opacity: 1.0, // Opacité complète
      });

      // Ajouter le logo également en en-tête de page, même taille et alignement
      page.drawImage(logoImage, {
        x: width - logoWidth - 15, // 15 points de marge à droite (décalé vers la gauche)
        y: height - logoHeight - 10, // 10 points de marge en haut
        width: logoWidth,
        height: logoHeight,
        opacity: 1.0, // Opacité complète
      });
    }
  }

  // Sauvegarder le document modifié
  return await pdfDoc.save();
}

// Fonction principale pour traiter tous les fichiers
async function processFiles() {
  try {
    // Vérifier si les répertoires existent, sinon les créer
    await fs.ensureDir(INPUT_DIR);
    await fs.ensureDir(OUTPUT_DIR);

    // Lire tous les fichiers du répertoire d'entrée
    const files = await fs.readdir(INPUT_DIR);
    const pdfFiles = files.filter((file) =>
      file.toLowerCase().endsWith(".pdf"),
    );

    if (pdfFiles.length === 0) {
      console.log("Aucun fichier PDF trouvé dans le répertoire d'entrée.");
      return;
    }

    console.log(`Traitement de ${pdfFiles.length} fichiers PDF...`);

    // Traiter chaque fichier PDF
    for (const file of pdfFiles) {
      const inputPath = path.join(INPUT_DIR, file);

      // Générer le nouveau nom de fichier avec le suffixe
      const fileNameWithoutExt = path.basename(file, ".pdf");
      const newFileName = `${fileNameWithoutExt}-${FILE_SUFFIX}.pdf`;
      const outputPath = path.join(OUTPUT_DIR, newFileName);

      console.log(`Traitement de ${file}...`);

      // Lire le fichier PDF
      const pdfBytes = await fs.readFile(inputPath);

      // Traiter le document (ajouter filigrane et modifier métadonnées)
      const modifiedPdfBytes = await processDocument(pdfBytes, file);

      // Écrire le fichier modifié
      await fs.writeFile(outputPath, modifiedPdfBytes);

      console.log(`Fichier traité et enregistré sous ${newFileName}`);
    }

    console.log("Traitement terminé avec succès!");
  } catch (error) {
    console.error("Erreur lors du traitement des fichiers:", error);
  }
}

// Exécuter la fonction principale
processFiles();
