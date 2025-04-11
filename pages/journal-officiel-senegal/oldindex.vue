<script setup lang="ts">
// Types pour les journaux officiels
interface JournalOfficiel {
  _path: string;
  title: string;
  subtitle: string;
  numero: string;
  date: string;
  description: string;
}

useHead({
  meta: [{ name: "robots", content: "noindex" }],
});

const searchQuery = ref("");
const currentView = ref<"grid" | "list">("list");

// État pour le tri
const sortOrder = ref<"asc" | "desc">("desc");
const sortField = ref<"date" | "numero">("date");

// Fetch des données
const {
  data: journaux,
  pending,
  error,
} = await useAsyncData<JournalOfficiel[]>(
  "journaux",
  () => queryContent("journal-officiel-senegal").find(),
  { server: true, lazy: false },
);

// Fonction de tri
const sortJournals = (a: JournalOfficiel, b: JournalOfficiel) => {
  if (sortField.value === "date") {
    return sortOrder.value === "desc"
      ? new Date(b.date).getTime() - new Date(a.date).getTime()
      : new Date(a.date).getTime() - new Date(b.date).getTime();
  } else {
    return sortOrder.value === "desc"
      ? b.numero.localeCompare(a.numero)
      : a.numero.localeCompare(b.numero);
  }
};

// Filtrage et tri des journaux
const filteredJournals = computed(() => {
  if (!journaux.value) return [];

  return journaux.value
    .filter(
      (journal) =>
        journal.title
          ?.toLowerCase()
          .includes(searchQuery.value.toLowerCase()) ||
        journal.numero
          ?.toLowerCase()
          .includes(searchQuery.value.toLowerCase()) ||
        journal.subtitle
          ?.toLowerCase()
          .includes(searchQuery.value.toLowerCase()),
    )
    .sort(sortJournals);
});

// Format de la date
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};
</script>

<template>
  <div class="container mx-auto px-4">
    <!-- En-tête -->
    <div class="prose prose-sm sm:prose mx-auto my-4">
      <h1 class="text-center">Journal Officiel du Sénégal</h1>
    </div>

    <!-- Barre d'outils -->
    <div class="mb-6 space-y-2">
      <!-- Statistiques et info -->
      <div class="text-center">
        <UBadge size="sm" color="gray" class="custom-shadow">
          {{ filteredJournals.length }} Journaux référencés
        </UBadge>
        <p class="mt-2 text-sm text-gray-500">
          💡 Travail de numérisation en cours, retrouvez ici bientôt
          l'historique complet des JO publiés en 2024
        </p>
      </div>

      <!-- Contrôles -->
      <div
        class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <UInput
          v-model="searchQuery"
          size="lg"
          placeholder="Rechercher par numéro, date ou contenu..."
          icon="i-heroicons-magnifying-glass"
          class="custom-shadow sm:w-full"
        />

        <!-- <div class="flex items-center gap-4">
          <USelect
            v-model="sortField"
            :options="[
              { label: 'Date', value: 'date' },
              { label: 'Numéro', value: 'numero' },
            ]"
            size="sm"
          />

          <UButton
            :icon="
              sortOrder === 'desc'
                ? 'i-heroicons-arrow-down'
                : 'i-heroicons-arrow-up'
            "
            color="gray"
            variant="ghost"
            @click="sortOrder = sortOrder === 'desc' ? 'asc' : 'desc'"
          />

          <UButtonGroup size="sm">
            <UButton
              :color="currentView === 'grid' ? 'primary' : 'gray'"
              :variant="currentView === 'grid' ? 'soft' : 'ghost'"
              icon="i-heroicons-squares-2x2"
              @click="currentView = 'grid'"
            />
            <UButton
              :color="currentView === 'list' ? 'primary' : 'gray'"
              :variant="currentView === 'list' ? 'soft' : 'ghost'"
              icon="i-heroicons-bars-3"
              @click="currentView = 'list'"
            />
          </UButtonGroup>
        </div> -->
      </div>
    </div>

    <!-- Loading et Error states -->
    <UCard v-if="pending" class="p-8 text-center">
      <UProgress />
      <p class="mt-4">Chargement des journaux officiels...</p>
    </UCard>

    <UAlert
      v-else-if="error"
      title="Erreur"
      description="Une erreur s'est produite lors du chargement des journaux."
      color="red"
      icon="i-heroicons-exclamation-triangle"
    />

    <!-- Résultats vides -->
    <UAlert
      v-else-if="filteredJournals.length === 0"
      title="Aucun résultat"
      description="Aucun journal officiel ne correspond à votre recherche."
      color="gray"
      icon="i-heroicons-inbox"
    />

    <!-- Liste des journaux -->
    <div
      v-else
      :class="{
        'grid gap-6 sm:grid-cols-2 lg:grid-cols-3': currentView === 'grid',
        'space-y-4': currentView === 'list',
      }"
    >
      <UCard
        v-for="journal in filteredJournals"
        :key="journal._path"
        :ui="{
          body: { padding: currentView === 'grid' ? 'sm:p-6' : 'sm:p-4' },
        }"
        class="rounded-none transition-shadow duration-200 hover:shadow-lg"
      >
        <NuxtLink :to="journal._path" class="block">
          <!-- Aperçu PDF (à implémenter) -->
          <div
            v-if="currentView === 'grid'"
            class="mb-4 aspect-[3/4] overflow-hidden rounded-lg bg-gray-100"
          >
            <img
              :src="`/api/pdf-preview/pdf/jors/JO-${journal.numero}.pdf/1`"
              :alt="`Aperçu JO ${journal.numero}`"
              class="h-full w-full object-cover"
            />
          </div>

          <div :class="{ 'flex gap-4': currentView === 'list' }">
            <div
              v-if="currentView === 'list'"
              class="w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100"
            >
              <img
                :src="`/images/default-journal-officiel.webp`"
                :alt="`Aperçu JO ${journal.numero}`"
                class="h-full w-full object-cover"
                loading="lazy"
                fetchpriority="high"
              />
            </div>

            <div>
              <div class="flex items-start justify-between gap-4">
                <h3 class="text-primary font-semibold">{{ journal.title }}</h3>
                <!-- <UBadge color="gray" size="sm">N° {{ journal.numero }}</UBadge> -->
              </div>

              <p class="mt-2 text-sm text-gray-600">{{ journal.subtitle }}</p>

              <div class="mt-3 flex items-center gap-2 text-sm text-gray-500">
                <UIcon name="i-heroicons-calendar" />
                <span>{{ formatDate(journal.date) }}</span>
              </div>
            </div>
          </div>
        </NuxtLink>
      </UCard>
    </div>
  </div>
</template>

<style scoped>
.hover\:shadow-lg {
  transition: box-shadow 0.2s ease-in-out;
}
</style>
