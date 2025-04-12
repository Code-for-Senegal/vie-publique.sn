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
  positions: {
    id: string;
    status: string;
    name: string;
    sexe: "Monsieur" | "Madame";
    type: string;
    role: string;
    organisation: string;
    nominationDate: string;
    endDate?: string;
    formation?: string;
    predecessor?: string;
    description?: string;
    photo?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
    tiktok?: string;
    linkedin?: string;
    website?: string;
    rating?: number;
  };
  directus_files: {
    id: string;
  };
};

const directus = createDirectus<Schema>(process.env.DIRECTUS_URL!)
  .with(rest())
  .with(staticToken(process.env.DIRECTUS_ADMIN_TOKEN!));

async function uploadPhoto(photoPath: string): Promise<string | undefined> {
  try {
    if (!photoPath) return undefined;

    const fullPath = path.join("../public", photoPath);
    const photoFile = await fs.readFile(fullPath);

    const formData = new FormData();
    const blob = new Blob([photoFile], { type: "image/jpeg" });
    formData.append("file", blob, path.basename(photoPath));

    const fileResponse = (await directus.request(uploadFiles(formData))) as {
      id: string;
    };
    return fileResponse.id;
  } catch (error) {
    console.error(`Failed to upload photo:`, error);
    return undefined;
  }
}

async function migrate() {
  try {
    const nominations = JSON.parse(
      await fs.readFile("../assets/data/nominations.json", "utf-8"),
    );

    for (const nomination of nominations) {
      try {
        // Upload photo
        let photoId;
        if (nomination.photo) {
          photoId = await uploadPhoto(nomination.photo);
        }

        // Create nomination entry
        await directus.request(
          createItem("positions", {
            status: "draft",
            name: nomination.name,
            sexe: nomination.sexe,
            type: nomination.type,
            role: nomination.role,
            organisation: nomination.organisation,
            nominationDate: nomination.nominationDate,
            endDate: nomination.endDate,
            formation: nomination.formation,
            predecessor: nomination.predecessor,
            description: nomination.description,
            photo: photoId,
            facebook: nomination.facebook,
            twitter: nomination.twitter,
            instagram: nomination.instagram,
            tiktok: nomination.tiktok,
            linkedin: nomination.linkedin,
            website: nomination.website,
            rating: nomination.rating,
          }),
        );

        console.log(`Migrated: ${nomination.name}`);
      } catch (error) {
        console.error(`Failed to migrate ${nomination.name}:`, error);
        continue;
      }
    }
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

migrate();
