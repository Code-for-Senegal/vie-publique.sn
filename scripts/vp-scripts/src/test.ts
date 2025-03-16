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
    documents: {
      id: string;
      status: string;
      title: string;
      description: string;
      publish_date: string;
      content_html: string;
      content_markdown: string;
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
  
  // Configuration de marked pour la conversion Markdown vers HTML
  marked.setOptions({
    gfm: true,
  });
  
  async function migrate() {
    try {
      const markdownFiles = await fs.readdir(
        "../content/journal-officiel-senegal",
      );
  
      for (const file of markdownFiles) {
        try {
          const filePath = path.join("../content/journal-officiel-senegal", file);
          const content = await fs.readFile(filePath, "utf-8");
          const { data: frontmatter, content: markdownContent } = matter(content);
  
          const cleanSlug = file.replace(/^\d+\./, "").replace(".md", "");
  
          // Conversion du Markdown en HTML
          const contentHtml = await marked(markdownContent);
  
          // Upload PDF si disponible
          let fileId;
          try {
            fileId = await uploadPDF(frontmatter.numero, content);
          } catch (error) {
            console.warn(
              `Warning: Could not upload PDF for ${frontmatter.numero}:`,
              error,
            );
          }
  
          // Créer le document
          const document = await directus.request(
            createItem("documents", {
              status: "published",
              title: frontmatter.title,
              description: frontmatter.description,
              publish_date: frontmatter.date,
              content_markdown: markdownContent,
              content_html: contentHtml, // Contenu HTML converti
              ...(fileId && { file: fileId }),
            }),
          );
  
          console.log("Document created with ID:", document.id);
  
          // Créer le journal officiel
          if (document) {
            const journalType: "special" | "ordinary" = frontmatter.subtitle
              ?.toLowerCase()
              .includes("spécial")
              ? "special"
              : "ordinary";
  
            const journalData = {
              number: frontmatter.numero,
              type: journalType,
              status: "published",
              slug: cleanSlug,
              document: document.id,
            };
  
            console.log("Creating journal with data:", journalData);
  
            await directus.request(createItem("official_journals", journalData));
  
            console.log(`Migrated: ${frontmatter.title} with slug ${cleanSlug}`);
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
  
  async function uploadPDF(
    joNumber: string,
    content: string,
  ): Promise<string | undefined> {
    try {
      const pdfLinkMatch = content.match(/<a href="(\/pdf\/jors\/.*?\.pdf)"/);
      if (!pdfLinkMatch) {
        console.log(`No PDF link found in markdown for JO ${joNumber}`);
        return undefined;
      }
  
      const pdfRelativePath = pdfLinkMatch[1];
      const pdfFileName = path.basename(pdfRelativePath);
      const pdfPath = path.join("../public", pdfRelativePath);
  
      try {
        await fs.access(pdfPath);
      } catch {
        console.log(`PDF file not found at ${pdfPath}, skipping file upload`);
        return undefined;
      }
  
      const pdfFile = await fs.readFile(pdfPath);
      const formData = new FormData();
  
      // Ajouter le fichier avec le bon type MIME
      const blob = new Blob([pdfFile], { type: "application/pdf" });
      formData.append("file", blob, pdfFileName);
  
      // Ajouter des métadonnées pour le fichier
      const metadata = {
        title: `Journal Officiel N°${joNumber}`,
        type: "application/pdf",
        filename_download: pdfFileName,
      };
      formData.append("metadata", JSON.stringify(metadata));
  
      const fileResponse = (await directus.request(
        uploadFiles(formData),
      )) as FileResponse;
  
      return fileResponse.id;
    } catch (error) {
      console.error(`Failed to upload PDF for JO ${joNumber}:`, error);
      return undefined;
    }
  }
  
  migrate();
  