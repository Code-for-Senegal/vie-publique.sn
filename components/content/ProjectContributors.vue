<script setup lang="ts">
import contributorsData from "@/assets/data/contributors.json";

interface Contributor {
  name: string;
  role: string | null;
  job: string;
  description: string;
  image: string | null;
  linkedin: string | null;
  gender: string;
}

interface ContributorsData {
  contributors: Contributor[];
}
const contributors = ref<ContributorsData>(contributorsData);
</script>

<template>
  <div class="bg-white py-2">
    <div class="container mx-auto">
      <div class="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-3">
        <div
          v-for="contributor in contributors.contributors"
          :key="contributor.name"
          class="flex flex-col items-center rounded-lg bg-white p-2 shadow-md"
        >
          <!-- Image du contributeur -->
          <div class="rounded-full">
            <UAvatar
              v-if="contributor.image"
              :src="contributor.image"
              :alt="contributor.name"
              loading="lazy"
              size="3xl"
              fetchpriority="high"
              class="shadow-md"
            />
            <UAvatar
              v-else
              :src="
                contributor.gender === 'M'
                  ? '/adobe-default-profil-man.jpg'
                  : '/adobe-default-profil-women.jpg'
              "
              alt="Default image"
              size="3xl"
              class="shadow-md"
            />
          </div>

          <!-- Informations du contributeur -->
          <p class="text-center text-xl font-semibold text-gray-900">
            {{ contributor.name }}
          </p>
          <p class="text-center text-sm text-gray-500">
            {{ contributor.job }}
          </p>

          <!-- Lien LinkedIn -->
          <a
            v-if="contributor.linkedin"
            :href="contributor.linkedin"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <UIcon name="i-heroicons-link" class="mr-1 h-5 w-5" />
            LinkedIn
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
