// medias.vue
<script setup lang="ts">
import { ref, computed } from "vue";
import type { Media, MediaType } from "~/types/media";
import { typeDisplayMap, typeColorMap, typeIconMap } from "~/types/media";

// SEO
const seoTitle = "Liste des médias reconnus au Sénégal";
const seoDescription = "Liste officielle des médias reconnus au Sénégal";
const seoImgPath = "/images/share-media.JPG";
const seoPageUrl = "https://vie-publique.sn/medias";

useHead({
  title: seoTitle,
  meta: [
    { name: "description", content: seoDescription },
    { name: "twitter:title", content: seoTitle },
    { name: "twitter:description", content: seoDescription },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:image", content: seoImgPath },
    { property: "og:title", content: seoTitle },
    { property: "og:description", content: seoDescription },
    { property: "og:image", content: seoImgPath },
    { property: "og:url", content: seoPageUrl },
    { property: "og:type", content: "website" },
  ],
});

// État et composable
const { medias, loading, error } = useMedias();

const searchQuery = ref("");
const selectedType = ref<MediaType | null>(null);
const sortOrder = ref<"asc" | "desc" | null>(null);
const sortField = ref<"name" | "type" | null>(null);

// Computed properties
const types = computed(() => {
  if (!medias.value) return [];
  return [...new Set(medias.value.map((media) => media.type))];
});

const mediaStats = computed(() => {
  if (!medias.value) return [];
  return types.value.map((type) => ({
    type,
    count: medias.value.filter((media) => media.type === type).length,
  }));
});

const filteredMedias = computed<Media[]>(() => {
  if (!medias.value) return [];

  let filtered = [...medias.value];

  if (selectedType.value) {
    filtered = filtered.filter((media) => media.type === selectedType.value);
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter((media) =>
      media.name.toLowerCase().includes(query),
    );
  }

  return filtered;
});

const sortedMedias = computed(() => {
  if (!sortField.value || !sortOrder.value) {
    return filteredMedias.value;
  }

  return [...filteredMedias.value].sort((a, b) => {
    const comparison =
      sortField.value === "name"
        ? a.name.localeCompare(b.name)
        : a.type.localeCompare(b.type);
    return sortOrder.value === "asc" ? comparison : -comparison;
  });
});

const totalMedias = computed(() => medias.value?.length || 0);

// Méthodes
const toggleSort = (field: "name" | "type") => {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    sortField.value = field;
    sortOrder.value = "asc";
  }
};

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
};

const config = useRuntimeConfig();
const getLogoUrl = (logoId: string | null) => {
  if (!logoId) return null;
  return `${config.public.cmsApiUrl}/assets/${logoId}`;
};

// Ajoutez ces refs pour la modal
const isOpen = ref(false);
const selectedMedia = ref<Media | null>(null);

// Ajoutez cette méthode pour ouvrir la modal
const openMediaDetails = (media: Media) => {
  selectedMedia.value = media;
  isOpen.value = true;
};

// Méthode pour formater les URLs des réseaux sociaux
const getSocialIcon = (type: string): string => {
  const icons = {
    facebook: "i-simple-icons-facebook",
    instagram: "i-simple-icons-instagram",
    twitter: "i-simple-icons-x",
    tiktok: "i-simple-icons-tiktok",
    youtube: "i-simple-icons-youtube",
  };
  return icons[type as keyof typeof icons] || "i-heroicons-link";
};

const socialPlatforms = [
  "facebook",
  "instagram",
  "twitter",
  "tiktok",
  "youtube",
];

const availableSocialLinks = computed(() => {
  if (!selectedMedia.value) return [];
  return socialPlatforms.filter(
    (platform) =>
      typeof selectedMedia.value?.[platform as keyof Media] === "string",
  );
});

const hasSocialLinks = computed(() => availableSocialLinks.value.length > 0);
</script>

<template>
  <div class="space-y-2 p-0">
    <NuxtLink
      to="/annuaires"
      class="mb-2 inline-flex items-center text-gray-600 hover:text-gray-800"
    >
      <UIcon name="i-heroicons-arrow-left" class="mr-2 h-5 w-5" />
      Retour
    </NuxtLink>

    <UCard class="custom-shadow pt-0">
      <template #header>
        <div class="flex flex-col items-start gap-2">
          <h1 class="text-xl font-bold sm:text-2xl">
            Liste des {{ totalMedias }} médias reconnus au Sénégal
          </h1>

          <div class="text-center">
            <p class="mb-2 text-sm text-gray-500">Mis à jour 06 Février 2025</p>
          </div>

          <div
            class="grid w-full grid-cols-2 gap-1 md:grid-cols-3 lg:grid-cols-6"
          >
            <div
              v-for="stat in mediaStats"
              :key="stat.type"
              class="cursor-pointer rounded-lg p-1 transition-all hover:scale-105"
              :class="[
                typeColorMap[stat.type as MediaType],
                selectedType === stat.type ? 'ring-primary ring-2' : '',
              ]"
              @click="
                selectedType = selectedType === stat.type ? null : stat.type
              "
            >
              <div class="mb-2 flex items-center gap-2">
                <UIcon
                  :name="typeIconMap[stat.type as MediaType]"
                  class="h-4 w-4 text-gray-600"
                />
                <h3
                  class="truncate text-xs font-medium text-gray-600 sm:text-sm"
                  :title="typeDisplayMap[stat.type as MediaType]"
                >
                  {{ typeDisplayMap[stat.type as MediaType] }}
                </h3>
              </div>
              <p class="mt-1 text-xl font-bold sm:text-2xl">{{ stat.count }}</p>
            </div>
          </div>
        </div>
      </template>

      <!-- Loading state -->
      <div v-if="loading" class="p-8 text-center">
        <UProgress color="blue" />
        <p class="mt-4">Chargement des médias...</p>
      </div>

      <!-- Error state -->
      <UAlert
        v-else-if="error"
        title="Erreur"
        :description="error"
        color="red"
        icon="i-heroicons-exclamation-triangle"
      />

      <template v-else>
        <!-- Filtres -->
        <div class="mb-2 flex flex-col gap-2 sm:flex-row">
          <UInput
            v-model="searchQuery"
            placeholder="Rechercher un média..."
            icon="i-heroicons-magnifying-glass"
            class="w-full sm:w-1/2"
          />
          <USelect
            v-model="selectedType"
            :options="
              types.map((type) => ({
                label: typeDisplayMap[type as MediaType],
                value: type,
              }))
            "
            placeholder="Filtrer par type"
            clearable
            class="w-full sm:w-1/2"
            icon="i-heroicons-funnel"
          />
        </div>

        <!-- Table -->
        <div class="relative overflow-x-auto">
          <div class="max-h-[600px] overflow-y-auto">
            <table class="w-full">
              <thead class="sticky top-0 z-10 bg-white shadow-sm">
                <tr class="border-b">
                  <th
                    class="w-3/4 cursor-pointer p-2 text-left hover:bg-gray-50"
                    @click="toggleSort('name')"
                  >
                    <div class="flex items-center gap-2">
                      Média
                      <UIcon
                        :name="
                          sortField === 'name'
                            ? sortOrder === 'asc'
                              ? 'i-heroicons-arrow-up'
                              : 'i-heroicons-arrow-down'
                            : 'i-heroicons-arrows-up-down'
                        "
                        class="h-4 w-4"
                      />
                    </div>
                  </th>
                  <th
                    class="w-1/4 cursor-pointer p-2 text-left hover:bg-gray-50"
                  >
                    <div class="flex items-center gap-2">
                      Type
                      <UIcon
                        :name="
                          sortField === 'type'
                            ? sortOrder === 'asc'
                              ? 'i-heroicons-arrow-up'
                              : 'i-heroicons-arrow-down'
                            : 'i-heroicons-arrows-up-down'
                        "
                        class="hidden h-4 w-4"
                      />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="media in sortedMedias"
                  :key="media.id"
                  class="border-b hover:bg-gray-50"
                  @click="openMediaDetails(media)"
                >
                  <td class="p-2">
                    <div class="flex items-center gap-3">
                      <UAvatar
                        :src="getLogoUrl(media.logo)"
                        :alt="media.name"
                        :text="getInitials(media.name)"
                        size="sm"
                        class="flex-shrink-0"
                      />
                      <div class="min-w-0 flex-1">
                        <div
                          class="sm:text-normal break-words text-sm font-medium"
                        >
                          {{ media.name }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="p-2">
                    <div class="flex items-center gap-1">
                      <UBadge
                        variant="soft"
                        color="gray"
                        class="gray whitespace-normal text-xs"
                        size="sm"
                      >
                        <UIcon
                          :name="typeIconMap[media.type]"
                          class="h-4 w-4 text-gray-600"
                        />
                        {{ typeDisplayMap[media.type] }}
                      </UBadge>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </UCard>
    <div>
      <a
        class="text-sm text-blue-700"
        href="https://cms.vie-publique.sn/assets/e703d8f8-d175-4950-a909-92d567782b47/medias-2025.pdf"
        target="_blank"
      >
        📄 Source MCTN - Mis à jour du 06 Février 2025
      </a>
    </div>

    <!-- Ajoutez la modal à la fin de votre template, avant la fermeture de la div principale -->
    <UModal v-model="isOpen">
      <UCard v-if="selectedMedia">
        <template #header>
          <div class="flex items-center gap-4">
            <UAvatar
              :src="getLogoUrl(selectedMedia.logo)"
              :alt="selectedMedia.name"
              :text="getInitials(selectedMedia.name)"
              size="lg"
            />
            <div>
              <h3 class="text-xl font-semibold">{{ selectedMedia.name }}</h3>
              <UBadge variant="soft" class="gray" size="sm">
                <UIcon
                  :name="typeIconMap[selectedMedia.type as MediaType]"
                  class="mr-1 h-4 w-4"
                />
                {{ typeDisplayMap[selectedMedia.type as MediaType] }}
              </UBadge>
            </div>
          </div>
        </template>

        <div class="space-y-2">
          <div v-if="selectedMedia.group" class="mt-4">
            <p class="text-sm text-gray-500">Groupe de presse</p>
            <p class="font-medium">{{ selectedMedia.group.name }}</p>
          </div>

          <div v-if="selectedMedia.description" class="mb-4 mt-0">
            <p class="text-sm text-gray-500">Description</p>
            <p class="text-sm">{{ selectedMedia.description }}</p>
          </div>

          <div v-if="selectedMedia.website" class="mt-0">
            <p class="mb-2 text-sm text-gray-500">Site web</p>
            <div class="flex flex-row gap-2">
              <ULink
                :to="selectedMedia.website"
                class="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
                target="_blank"
                aria-label="social.label"
              >
                <UIcon name="i-heroicons-globe-alt" class="h-8 w-8" />
              </ULink>
            </div>
          </div>

          <div v-if="hasSocialLinks" class="mb-4 mt-0">
            <p class="mb-2 text-sm text-gray-500">Réseaux sociaux</p>
            <div class="flex flex-row gap-2">
              <ULink
                v-for="platform in availableSocialLinks"
                :key="platform"
                :to="selectedMedia[platform as keyof Media] as string"
                class="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
                target="_blank"
                aria-label="social.label"
              >
                <UIcon :name="getSocialIcon(platform)" class="h-8 w-8" />
                <!-- <span class="text-sm ">{{ platform }}</span> -->
              </ULink>
            </div>
          </div>
        </div>
        <template #footer>
          <div class="flex justify-end">
            <UButton color="gray" variant="soft" @click="isOpen = false">
              Fermer
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<style scoped>
.table-container {
  max-height: 600px;
  overflow-y: auto;
}
</style>
