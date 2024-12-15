<template>
  <div class="space-y-4 p-0">
    <div>
      <a
        class="text-sm text-blue-700"
        href="/pdf/communiques/MCTN_liste_des_médias_conformes_avec_le_code_de_la_presse_2.pdf"
        target="_blank"
        >📄 Source MCTN - Mis à jour du 03 Déc 2024</a
      >
    </div>
    <div class="grid grid-cols-3 gap-1 md:grid-cols-3 lg:grid-cols-6">
      <div
        v-for="stat in mediaStats"
        :key="stat.type"
        class="rounded-lg p-1"
        :class="getBgColor(stat.type)"
      >
        <div class="mb-2 flex items-center gap-2">
          <UIcon :name="getTypeIcon(stat.type)" class="h-4 w-4 text-gray-600" />
          <!-- class="h-5 w-5 text-yellow-400 transition-transform group-hover:scale-110" -->
          <h3
            class="truncate text-xs font-medium text-gray-600 sm:text-sm"
            :title="stat.type"
          >
            {{ stat.type }}
          </h3>
        </div>
        <p class="mt-1 text-xl font-bold sm:text-2xl">{{ stat.count }}</p>
      </div>
    </div>

    <UCard class="custom-shadow pt-0">
      <template #header>
        <div
          class="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center"
        >
          <h1 class="text-xl font-bold sm:text-2xl">
            Liste des 112 Médias reconnus au Sénégal
          </h1>
          <div class="hidden text-sm">
            <div class="text-gray-500">
              Total: {{ filteredMedias.length }} médias
            </div>
          </div>
        </div>
      </template>

      <!-- Filtres -->
      <div class="mb-2 flex flex-col gap-2 sm:flex-row">
        <UInput
          v-model="searchQuery"
          placeholder="Rechercher un média..."
          icon="i-heroicons-magnifying-glass"
          class="sm:w-64"
        />
        <USelect
          v-model="selectedType"
          :options="types"
          placeholder="Filtrer par type"
          clearable
          class="sm:w-64"
          icon="i-heroicons-funnel"
        />
        <USelect
          v-model="sortOrder"
          :options="[
            { label: 'A à Z', value: 'asc' },
            { label: 'Z à A', value: 'desc' },
          ]"
          placeholder="Trier par"
          class="sm:w-48"
          icon="i-heroicons-adjustments-horizontal"
        />
      </div>

      <!-- Table avec header fixe -->
      <div class="relative overflow-x-auto">
        <div class="max-h-[600px] overflow-y-auto">
          <table class="w-full">
            <thead class="sticky top-0 z-10 bg-white shadow-sm">
              <tr class="border-b">
                <th
                  class="w-3/4 cursor-pointer p-2 text-left hover:bg-gray-50"
                  @click="toggleSort('nom')"
                >
                  <div class="flex items-center gap-2">
                    Média
                    <UIcon
                      :name="
                        sortField === 'nom'
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
                  @click="toggleSort('type')"
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
                      class="h-4 w-4"
                    />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="media in sortedMedias"
                :key="media.nom"
                class="border-b hover:bg-gray-50"
              >
                <td class="p-2">
                  <div class="flex items-center gap-3">
                    <UAvatar
                      :src="media.logo"
                      :alt="media.nom"
                      :text="getInitials(media.nom)"
                      size="sm"
                      class="flex-shrink-0"
                    />
                    <div class="min-w-0 flex-1">
                      <!-- Ajout de flex-1 pour prendre l'espace disponible -->
                      <div
                        class="sm:text-normal break-words text-sm font-medium"
                      >
                        {{ media.nom }}
                      </div>
                      <div class="text-xs text-gray-500">
                        {{ media.type }}
                        <!-- Remplacer truncate par break-words -->
                        <a
                          v-if="media.url"
                          :href="media.url"
                          target="_blank"
                          class="break-words text-sm text-blue-500 hover:text-blue-700"
                        >
                          {{ media.url }}
                        </a>
                      </div>
                    </div>
                  </div>
                </td>
                <td class="p-2">
                  <div class="flex items-center gap-1">
                    <UIcon
                      :name="getTypeIcon(media.type)"
                      class="h-4 w-4 text-gray-600"
                    />
                    <UBadge
                      variant="soft"
                      color="gray"
                      class="whitespace-normal text-xs"
                      size="sm"
                    >
                      {{ media.type }}
                    </UBadge>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { Media, MediaType } from "~/types/media";
import { medias } from "~/assets/data/medias";

const seoTitle = "Liste des médias reconus au Sénégal";
const seoDescription = "Liste officielle des médias reconus au Sénégal";
const seoImgPath = "/images/share-media.JPG";
const seoPageUrl = "https://vie-publique.sn/medias";
useHead({
  title: seoTitle,
  meta: [
    {
      name: "description",
      content: seoDescription,
    },
    // Twitter Card Meta Tags
    {
      name: "twitter:title",
      content: seoTitle,
    },
    {
      name: "twitter:description",
      content: seoDescription,
    },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:image", content: seoImgPath },
    // Open Graph Meta Tags
    {
      property: "og:title",
      content: seoTitle,
    },
    {
      property: "og:description",
      content: seoDescription,
    },
    { property: "og:image", content: seoImgPath },
    { property: "og:url", content: seoPageUrl },
    { property: "og:type", content: "website" },
  ],
});

const searchQuery = ref("");
const selectedType = ref<MediaType | null>(null);
const sortOrder = ref<"asc" | "desc" | null>(null);
const sortField = ref<"nom" | "type" | null>(null);

const types = computed(() => {
  return [...new Set(medias.map((media) => media.type))];
});

const mediaStats = computed(() => {
  return types.value.map((type) => ({
    type,
    count: medias.filter((media) => media.type === type).length,
  }));
});

const filteredMedias = computed(() => {
  let filtered = [...medias];

  // Si un type est sélectionné, on filtre d'abord par type
  if (selectedType.value) {
    filtered = filtered.filter((media) => media.type === selectedType.value);
  }

  // Ensuite on applique la recherche textuelle si elle existe
  if (searchQuery.value.trim()) {
    filtered = filtered.filter((media) =>
      media.nom.toLowerCase().includes(searchQuery.value.toLowerCase()),
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
      sortField.value === "nom"
        ? a.nom.localeCompare(b.nom)
        : a.type.localeCompare(b.type);
    return sortOrder.value === "asc" ? comparison : -comparison;
  });
});

const toggleSort = (field: "nom" | "type") => {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    sortField.value = field;
    sortOrder.value = "asc";
  }
};

const getBadgeColor = (type: MediaType): string => {
  const colors: Record<MediaType, string> = {
    TV: "blue",
    RADIO: "green",
    PE: "yellow",
    PEL: "orange",
    "WEB TV": "purple",
    "RADIO COMMUNAUTAIRES": "red",
  };
  return colors[type];
};

const getBgColor = (type: MediaType): string => {
  const colors: Record<MediaType, string> = {
    TV: "bg-blue-50",
    RADIO: "bg-green-50",
    PE: "bg-yellow-50",
    PEL: "bg-orange-50",
    "WEB TV": "bg-purple-50",
    "RADIO COMMUNAUTAIRES": "bg-red-50",
  };
  return colors[type];
};

const getBadgeVariant = (type: MediaType): string => {
  return "solid";
};

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
};

const getTypeIcon = (type: MediaType): string => {
  const icons: Record<MediaType, string> = {
    TV: "i-lucide-tv",
    RADIO: "i-lucide-radio",
    PE: "i-lucide-newspaper",
    PEL: "i-lucide-globe",
    "WEB TV": "i-lucide-monitor-play",
    "RADIO COMMUNAUTAIRES": "i-lucide-radio-tower",
  };
  return icons[type];
};
</script>

<style scoped>
.table-container {
  max-height: 600px;
  overflow-y: auto;
}
</style>
