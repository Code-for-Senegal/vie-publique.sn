import {
  createDirectus,
  rest,
  staticToken,
  createItem,
  uploadFiles,
} from "@directus/sdk";
import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

type Schema = {
  documents: {
    id: string;
    status: string;
    title: string;
    description: string;
    publish_date: string;
    file?: string;
  };
  official_journals: {
    id: string;
    number: string;
    document: string;
    type: "special" | "ordinary";
    status: string;
    slug: string;
  };
  directus_files: {
    id: string;
  };
};

interface DirectusError {
  response?: {
    data?: any;
  };
}

type FileResponse = {
  id: string;
};

const directus = createDirectus<Schema>(process.env.DIRECTUS_URL!)
  .with(rest())
  .with(staticToken(process.env.DIRECTUS_ADMIN_TOKEN!));

function extractInfoFromFilename(filename: string): {
  number: string;
  date: string;
  slug: string;
} {
  // Format attendu: JO-7648-du-04-aout-2023
  const parts = filename.split("-");
  const number = parts[1]; // 7648

  // Récupération de la date
  const day = parts[3];
  const month = parts[4];
  const year = parts[5].replace(".pdf", "");

  // Conversion du mois en format numérique
  const monthMap: { [key: string]: string } = {
    janvier: "01",
    fevrier: "02",
    mars: "03",
    avril: "04",
    mai: "05",
    juin: "06",
    juillet: "07",
    aout: "08",
    septembre: "09",
    octobre: "10",
    novembre: "11",
    decembre: "12",
  };

  const monthNumber = monthMap[month.toLowerCase()] || "01";
  const date = `${year}-${monthNumber}-${day}`;

  return {
    number,
    date,
    slug: filename.replace(".pdf", ""),
  };
}

async function migratePDFs(pdfFolderPath: string) {
  try {
    const files = await fs.readdir(pdfFolderPath);
    const pdfFiles = files.filter((file) => file.endsWith(".pdf"));

    for (const file of pdfFiles) {
      try {
        const filePath = path.join(pdfFolderPath, file);
        const { number, date, slug } = extractInfoFromFilename(file);

        // Upload du PDF
        const pdfFile = await fs.readFile(filePath);
        const formData = new FormData();

        // Ajout du fichier avec le type MIME
        const blob = new Blob([pdfFile], { type: "application/pdf" });
        formData.append("file", blob, file);

        // Métadonnées du fichier
        const metadata = {
          title: `Journal Officiel N°${number}`,
          type: "application/pdf",
          filename_download: file,
        };
        formData.append("metadata", JSON.stringify(metadata));

        const fileResponse = (await directus.request(
          uploadFiles(formData),
        )) as FileResponse;

        if (!fileResponse.id) {
          throw new Error("File upload failed");
        }

        // Création du document
        const document = await directus.request(
          createItem("documents", {
            status: "published",
            title: `Journal Officiel n°${number} du ${date}`,
            description: `Journal Officiel de la République du Sénégal n°${number}`,
            publish_date: date,
            file: fileResponse.id,
          }),
        );

        console.log("Document created with ID:", document.id);

        // Création du journal officiel
        if (document) {
          const journalData = {
            number,
            type: "ordinary", // Par défaut ordinaire
            status: "published",
            slug,
            document: document.id,
          };

          await directus.request(createItem("official_journals", journalData));
          console.log(`Migrated: JO n°${number} with slug ${slug}`);
        }
      } catch (error) {
        console.error(`Failed to migrate ${file}:`, error);
        if (error && typeof error === "object" && "response" in error) {
          const directusError = error as DirectusError;
          if (directusError.response?.data) {
            console.error("Error details:", directusError.response.data);
          }
        }
        continue;
      }
    }
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

// Utilisation du script
const PDF_FOLDER_PATH = "./nouveaux-pdf"; // Ajustez le chemin selon votre structure
migratePDFs(PDF_FOLDER_PATH);
