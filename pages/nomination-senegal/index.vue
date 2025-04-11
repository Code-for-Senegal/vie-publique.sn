<script setup lang="ts">
import type { GovernmentMember } from "~/types/government-member";

// SEO configuration
const seoTitle = "Annuaire nominations Sénégal";
const seoDescription =
  "Liste des nominations du président Diomaye Faye au Sénégal";
const seoImgPath = "https://vie-publique.sn/nomination-3.png";
const seoPageUrl = "https://vie-publique.sn/nomination-senegal";

useHead({
  title: seoTitle,
  meta: [
    { name: "description", content: seoDescription },
    // Twitter Card Meta Tags
    { name: "twitter:title", content: seoTitle },
    { name: "twitter:description", content: seoDescription },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:image", content: seoImgPath },
    // Open Graph Meta Tags
    { property: "og:title", content: seoTitle },
    { property: "og:description", content: seoDescription },
    { property: "og:image", content: seoImgPath },
    { property: "og:url", content: seoPageUrl },
    { property: "og:type", content: "website" },
  ],
});

const { $dateformat } = useNuxtApp();

// Use the new nominations composable
const { nominations, loading, error, fetchNominations } = useNominations();

// Fetch data on component mount
onMounted(() => {
  fetchNominations();
});

/* Filters */
const searchQuery = ref("");
const selectedType = ref("Ministre");
const selectedGender = ref("");
const selectedDate = ref("");

const filteredMinisters = computed(() => {
  return (
    nominations.value?.filter(
      (member: GovernmentMember) =>
        (member.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
          member.role
            .toLowerCase()
            .includes(searchQuery.value.toLowerCase())) &&
        (!selectedType.value || member.type === selectedType.value) &&
        (!selectedGender.value || member.sexe === selectedGender.value) &&
        (!selectedDate.value || member.sexe === selectedDate.value),
    ) || []
  ).sort(
    (a, b) =>
      new Date(b.nominationDate).getTime() -
      new Date(a.nominationDate).getTime(),
  );
});

/* Pagination */
const page = ref(1);
const pageCount = 25;

const rowsfilteredMinisters = computed(() =>
  filteredMinisters.value.slice(
    (page.value - 1) * pageCount,
    page.value * pageCount,
  ),
);

const totalsByType = computed(() => {
  const totals: Record<string, number> = {};
  nominations.value?.forEach((member: GovernmentMember) => {
    if (member.type) {
      totals[member.type] = (totals[member.type] || 0) + 1;
    }
  });

  return Object.fromEntries(
    Object.entries(totals).sort(([a], [b]) => a.localeCompare(b)),
  );
});

const totalsByGender = computed(() => {
  let maleCount = 0,
    femaleCount = 0;
  nominations.value?.forEach((member: GovernmentMember) => {
    if (member.sexe === "Monsieur") {
      maleCount++;
    } else if (member.sexe === "Madame") {
      femaleCount++;
    }
  });
  return { maleCount, femaleCount };
});

const selectedMinister = ref<GovernmentMember | null>(null);
const isModalOpen = ref(false);

function openModal(minister: GovernmentMember) {
  selectedMinister.value = minister;
  isModalOpen.value = true;
}

watch(searchQuery, () => {
  selectedType.value = "";
  selectedGender.value = "";
  page.value = 1;
});

watch([selectedType, selectedGender], () => {
  page.value = 1;
});
</script>

<template>
  <div class="flex flex-col items-center px-4">
    <h1 class="sr-only mb-4 text-sm text-gray-500">
      Membres du gouvernement du Sénégal, Nouveau gouvernement Sénégal Diomaye
      Sonko, Conseil des ministres, Liste des ministres du Sénégal,
    </h1>
    <div class="container">
      <div class="prose prose-sm sm:prose my-2">
        <h1 class="">
          {{ nominations?.length }} Nominations
          <!--du président Diomaye-->
        </h1>
      </div>
    </div>

    <p class="sr-only mb-4 text-sm text-gray-500">
      Ministres, Secrétaires, Directeurs, PCA...
    </p>

    <!-- Modal pour afficher les détails du membre -->
    <UModal v-model="isModalOpen">
      <UCard
        v-if="selectedMinister"
        :ui="{
          ring: '',
          divide: 'divide-y divide-gray-100 dark:divide-gray-800',
        }"
      >
        <template #header>
          <!-- <Placeholder v-else class="h-8" /> -->
          <div class="flex items-center justify-center">
            <img
              :src="selectedMinister.photo || '/unknown_member.webp'"
              alt="Profile Photo"
              sizes="300px md:400px"
            />
          </div>
        </template>

        <div class="px-4 text-center">
          <h2 class="text-xl font-semibold">{{ selectedMinister.name }}</h2>
          <p class="text-sm">{{ selectedMinister.role }}</p>
          <p v-if="selectedMinister.organisation" class="text-sm text-gray-500">
            {{ selectedMinister.organisation }}
          </p>
          <div v-if="selectedMinister.nominationDate" class="mt-1">
            <p class="text-sm text-gray-500">Nommé le</p>
            <p class="text-sm">
              {{ $dateformat(selectedMinister.nominationDate) }}
            </p>
          </div>
          <div v-if="selectedMinister.endDate" class="mt-1">
            <p class="text-sm text-gray-500">Fin de fonction le</p>
            <p class="text-sm">{{ $dateformat(selectedMinister.endDate) }}</p>
          </div>
          <div v-if="selectedMinister.formation" class="mt-1">
            <p class="text-sm text-gray-500">Formation</p>
            <p class="text-sm">{{ selectedMinister.formation }}</p>
          </div>
          <div v-if="selectedMinister.predecessor" class="mt-1">
            <p class="text-sm text-gray-500">Prédécesseur</p>
            <p class="text-sm">{{ selectedMinister.predecessor }}</p>
          </div>

          <ULink
            v-if="selectedMinister.portrait"
            :to="selectedMinister.portrait"
            class="text-sm font-semibold text-blue-600 underline hover:text-blue-800"
          >
            Voir le portrait complet
          </ULink>
        </div>

        <template #footer>
          <Placeholder class="h-8" />
          <div class="p-2 text-right">
            <UButton color="white" @click="isModalOpen = false">Fermer</UButton>
          </div>
        </template>
      </UCard>
    </UModal>

    <div class="w-full max-w-4xl">
      <!-- Conteneur principal avec grid -->

      <div class="grid grid-cols-1 gap-2 lg:grid-cols-4">
        <!-- Colonne des filtres (1/4 en desktop) -->
        <div class="lg:col-span-1">
          <!-- recherche -->
          <UInput
            v-model="searchQuery"
            class="input custom-shadow mb-3 w-full"
            size="lg"
            icon="i-heroicons-magnifying-glass"
            placeholder="Rechercher une nomination..."
          >
          </UInput>

          <div class="mb-1 w-full text-center">
            <UButton
              :ui="{ rounded: 'rounded-full' }"
              class="custom-shadow mb-1 ml-1 text-sm font-normal transition-all duration-300 ease-in-out"
              :color="selectedGender === 'Monsieur' ? 'primary' : 'white'"
              size="sm"
              @click="
                selectedGender = selectedGender === 'Monsieur' ? '' : 'Monsieur'
              "
            >
              Hommes
              <UBadge
                :ui="{ rounded: 'rounded-full' }"
                :label="totalsByGender.maleCount"
                :color="selectedGender === 'Monsieur' ? 'primary' : 'primary'"
                :variant="selectedGender === 'Monsieur' ? 'soft' : 'solid'"
                size="xs"
              ></UBadge>
            </UButton>
            <UButton
              :ui="{ rounded: 'rounded-full' }"
              class="custom-shadow mb-1 ml-1 text-sm font-normal transition-all duration-300 ease-in-out"
              :color="selectedGender === 'Madame' ? 'primary' : 'white'"
              size="sm"
              @click="
                selectedGender = selectedGender === 'Madame' ? '' : 'Madame'
              "
            >
              Femmes
              <UBadge
                :ui="{ rounded: 'rounded-full' }"
                :label="totalsByGender.femaleCount"
                color="primary"
                :variant="selectedGender === 'Madame' ? 'soft' : 'solid'"
                size="xs"
              ></UBadge>
            </UButton>
          </div>

          <div class="mb-2 w-full text-center">
            <UButton
              v-for="(total, type) in totalsByType"
              :key="type"
              :ui="{ rounded: 'rounded-full' }"
              :color="selectedType === type ? 'primary' : 'white'"
              class="custom-shadow mb-1 ml-1 text-sm font-normal transition-all duration-300 ease-in-out"
              size="sm"
              @click="selectedType = selectedType === type ? '' : type"
            >
              {{ type }}
              <UBadge
                :ui="{ rounded: 'rounded-full' }"
                :label="total"
                color="primary"
                :variant="selectedType === type ? 'soft' : 'solid'"
                size="xs"
              ></UBadge>
            </UButton>
          </div>
        </div>
        <!-- Colonne de la liste des députés (3/4 en desktop) -->
        <div class="space-y-2 lg:col-span-3">
          <UCard
            v-for="minister in rowsfilteredMinisters"
            :key="minister.name"
            class="custom-shadow cursor-pointer"
            @click="openModal(minister)"
          >
            <div class="flex flex-row gap-2">
              <div class="h-16 w-16 flex-shrink-0 md:h-20 md:w-20">
                <img
                  :src="minister.photo || '/unknown_member.webp'"
                  alt="Photo ministre"
                  sizes="64px sm:80px"
                  class="h-full w-full rounded-full object-cover"
                  loading="lazy"
                />
              </div>
              <div class="flex-grow">
                <h2 class="font-semibold">{{ minister.name }}</h2>
                <p class="text-sm">{{ minister.role }}</p>
                <p v-if="minister.organisation" class="text-sm text-gray-500">
                  {{ minister.organisation }}
                </p>
                <p class="text-sm text-gray-500">
                  Nommé le
                  {{ $dateformat(minister.nominationDate) }}
                </p>
                <p v-if="minister.endDate" class="text-sm text-gray-500">
                  Limogé le
                  {{ $dateformat(minister.endDate) }}
                </p>
              </div>
            </div>
          </UCard>
        </div>
      </div>

      <div
        :class="{ hidden: rowsfilteredMinisters < pageCount }"
        class="flex justify-end border-t border-gray-200 px-3 py-3.5 dark:border-gray-700"
      >
        <UPagination
          v-model="page"
          size="md"
          :page-count="pageCount"
          :total="filteredMinisters.length"
        />
      </div>
    </div>
  </div>
</template>
