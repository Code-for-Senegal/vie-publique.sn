import { createDirectus, rest, staticToken, readItems } from "@directus/sdk";
import dotenv from "dotenv";

dotenv.config();

// Définir les types
type DirectusUser = {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
};

type Document = {
  id: string;
  title: string;
};

type OfficialJournal = {
  id: string;
  number: string;
};

type Schema = {
  directus_users: DirectusUser;
  directus_settings: {
    id: string;
    project_name: string;
  };
  documents: Document;
  official_journals: OfficialJournal;
};

async function testConnection() {
  try {
    console.log("Testing connection to Directus...");
    console.log("URL:", process.env.DIRECTUS_URL);
    console.log(
      "Token length:",
      process.env.DIRECTUS_ADMIN_TOKEN?.length || "Token not found",
    );

    const directus = createDirectus<Schema>(process.env.DIRECTUS_URL!)
      .with(rest())
      .with(staticToken(process.env.DIRECTUS_ADMIN_TOKEN!));

    // Test simple request sur la collection documents
    const response = await directus.request<Document[]>(
      readItems("documents", {
        limit: 1,
      }),
    );

    console.log("Connection successful!");
    console.log("Response:", response);
  } catch (error) {
    console.error("Connection failed:");
    if (error && typeof error === "object") {
      console.log("Error details:", JSON.stringify(error, null, 2));
    } else {
      console.log(error);
    }
  }
}

testConnection();
