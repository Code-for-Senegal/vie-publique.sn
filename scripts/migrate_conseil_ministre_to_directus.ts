import {
  createDirectus,
  rest,
  staticToken,
  createItem,
  uploadFiles,
} from "@directus/sdk";
import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";
import dotenv from "dotenv";

dotenv.config();

type Schema = {
  news: {
    id: string;
    status: string;
    title: string;
    content: string;
    date_published: string;
    cover_image?: string;
    document?: string;
    slug: string;
  };
  documents: {
    id: string;
    status: string;
    title: string;
    file: string;
    publish_date: string;
  };
  directus_files: {
    id: string;
  };
};

const directus = createDirectus<Schema>(process.env.DIRECTUS_URL!)
  .with(rest())
  .with(staticToken(process.env.DIRECTUS_ADMIN_TOKEN!));

// Configuration de marked
marked.setOptions({
  gfm: true,
});

async function uploadImage(
  imagePath: string,
  title: string,
): Promise<string | undefined> {
  try {
    const fullPath = path.join("../public", imagePath);
    const imageFile = await fs.readFile(fullPath);

    const formData = new FormData();
    const blob = new Blob([imageFile], { type: "image/jpeg" }); // Ajuster le type selon l'image
    formData.append("file", blob, path.basename(imagePath));

    const fileResponse = await directus.request(uploadFiles(formData));
    return fileResponse.id;
  } catch (error) {
    console.error(`Failed to upload image for ${title}:`, error);
    return undefined;
  }
}

async function uploadPDF(
  pdfPath: string,
  title: string,
  publishDate: string,
): Promise<string | undefined> {
  try {
    const fullPath = path.join(
      "../public/pdf/communiques",
      path.basename(pdfPath),
    );
    const pdfFile = await fs.readFile(fullPath);

    const formData = new FormData();
    const blob = new Blob([pdfFile], { type: "application/pdf" });
    formData.append("file", blob, path.basename(pdfPath));

    // Upload PDF file
    const fileResponse = await directus.request(uploadFiles(formData));

    // Create document entry
    const document = await directus.request(
      createItem("documents", {
        status: "draft",
        title: title,
        file: fileResponse.id,
        publish_date: publishDate,
      }),
    );

    return document.id;
  } catch (error) {
    console.error(`Failed to upload PDF for ${title}:`, error);
    return undefined;
  }
}

async function migrate() {
  try {
    const markdownFiles = await fs.readdir("../content/conseil-des-ministres");

    for (const file of markdownFiles) {
      try {
        const filePath = path.join("../content/conseil-des-ministres", file);
        const content = await fs.readFile(filePath, "utf-8");
        const { data: frontmatter, content: markdownContent } = matter(content);

        // Conversion Markdown vers HTML
        const contentHtml = await marked(markdownContent);

        // Upload de l'image de couverture si elle existe
        let coverImageId;
        if (frontmatter.image) {
          coverImageId = await uploadImage(
            frontmatter.image,
            frontmatter.title,
          );
        }

        // Recherche et upload du PDF
        const pdfMatch = content.match(
          /<a href="(\/pdf\/communiques\/.*?\.pdf)"/,
        );
        let documentId;
        if (pdfMatch) {
          documentId = await uploadPDF(
            pdfMatch[1],
            frontmatter.title,
            frontmatter.date,
          );
        }

        // Extraction du slug directement du nom de fichier, on retire juste l'extension .md
        const slug = file.replace(".md", "");

        // Création de l'entrée news
        await directus.request(
          createItem("news", {
            status: "draft",
            title: frontmatter.title,
            content: contentHtml,
            date_published: frontmatter.date,
            cover_image: coverImageId,
            document: documentId,
            slug: slug,
          }),
        );

        console.log(`Migrated: ${frontmatter.title}`);
      } catch (error) {
        console.error(`Failed to migrate ${file}:`, error);
        continue;
      }
    }
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

migrate();
