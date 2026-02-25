<script setup lang="ts">
const { office, loading, error } = useAssemblyOffice();

interface OfficeGroup {
  name: string;
  members: any[];
  columns: string;
  count: number;
}

// Configuration des groupes pour le skeleton et l'affichage réel
const groupsConfig = [
  {
    name: "Président",
    role: "president",
    columns: "max-w-xs mx-auto",
    count: 1,
  },
  {
    name: "Vice-présidents",
    role: "vice_president",
    columns: "grid-cols-2 md:grid-cols-4",
    count: 8,
  },
  {
    name: "Secrétaires",
    role: "secretary",
    columns: "grid-cols-2 md:grid-cols-3",
    count: 6,
  },
  {
    name: "Questeurs",
    role: "quaestor",
    columns: "grid-cols-2 max-w-2xl mx-auto",
    count: 2,
  },
];

const groupedMembers = computed<OfficeGroup[]>(() => {
  if (!office.value) return [];

  const groups: OfficeGroup[] = [];

  groupsConfig.forEach((config) => {
    const members =
      config.role === "president"
        ? office.value.find((member) => member.role === config.role)?.deputy
          ? [office.value.find((member) => member.role === config.role)!.deputy]
          : []
        : office.value
            .filter((member) => member.role === config.role)
            .sort((a, b) => (a.rank || 0) - (b.rank || 0))
            .map((member) => member.deputy);

    if (members.length) {
      groups.push({
        name: config.name,
        members,
        columns: config.columns,
        count: config.count,
      });
    }
  });

  return groups;
});

// Compter le total des membres
const totalMembers = computed(() => {
  return groupedMembers.value.reduce((acc, group) => acc + group.members.length, 0);
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-20 dark:bg-gray-950">
    <!-- Breadcrumb desktop -->
    <div class="container mx-auto hidden px-4 pt-2 md:block">
      <AppBreadcrumb :items="[
        { label: 'Assemblée nationale', to: '/assemblee-nationale' },
        { label: 'Bureau' }
      ]" />
    </div>

    <!-- Sticky Header Mobile Only -->
    <header class="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-sm md:hidden dark:border-gray-800 dark:bg-gray-900/95">
      <div class="container mx-auto px-4 py-3">
        <div class="flex items-center gap-3">
          <NuxtLink
            to="/assemblee-nationale"
            class="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
            aria-label="Retour"
          >
            <UIcon name="i-heroicons-arrow-left-20-solid" class="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </NuxtLink>
          <div class="min-w-0 flex-1">
            <h1 class="text-lg font-bold text-gray-900 dark:text-white">
              Bureau de l'Assemblée
            </h1>
            <p v-if="!loading && totalMembers" class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {{ totalMembers }} membres
            </p>
          </div>
        </div>
      </div>
    </header>

    <!-- Desktop Header -->
    <div class="hidden md:block">
      <div class="container mx-auto px-4 py-6">
        <h1 class="mb-2 text-center text-2xl font-bold text-gray-900 md:text-3xl dark:text-white">
          Bureau de l'Assemblée nationale
        </h1>
        <p v-if="!loading && totalMembers" class="text-center text-sm text-gray-600 dark:text-gray-400">
          {{ totalMembers }} membres · 15e législature
        </p>
      </div>
    </div>

    <div class="container mx-auto px-4">
      <div class="mx-auto max-w-7xl">
        <!-- Loading state with skeletons -->
        <div v-if="loading" class="space-y-12">
          <section v-for="group in groupsConfig" :key="group.name">
            <h2 class="mb-4 text-center text-xl font-semibold text-gray-700 dark:text-gray-300">
              {{ group.name }}
            </h2>
            <div :class="['grid gap-6', group.columns]">
              <AssemblyDeputyCardSkeleton v-for="n in group.count" :key="n" />
            </div>
          </section>
        </div>

        <!-- Error state -->
        <UAlert
          v-else-if="error"
          title="Erreur de chargement"
          description="Impossible de charger les informations du bureau"
          color="red"
          icon="i-heroicons-exclamation-triangle"
        />

        <!-- Content -->
        <div v-else class="space-y-8">
          <section v-for="group in groupedMembers" :key="group.name">
            <h2 class="mb-4 text-center text-xl font-semibold text-gray-800 dark:text-gray-200">
              {{ group.name }}
            </h2>
            <div :class="['grid gap-6', group.columns]">
              <AssemblyDeputyCard
                v-for="deputy in group.members"
                :key="deputy.id"
                :deputy="deputy"
              />
            </div>
          </section>
        </div>
      </div>
    </div>

    <ScrollToTopButton />
  </div>
</template>
