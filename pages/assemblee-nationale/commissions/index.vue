<script setup lang="ts">
const { commissions, loading, error } = useAssemblyCommissions();

const searchQuery = ref("");

const filteredCommissions = computed(() => {
  if (!commissions.value) return [];
  return commissions.value.filter((commission) =>
    commission.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
  );
});
</script>

<template>
  <div class="container mx-auto px-2 py-4">
    <UBreadcrumb
      class="mt-2"
      :links="[
        { label: 'Accueil', to: '/' },
        { label: '15e législature', to: '/assemblee-nationale' },
        { label: 'Commissions' },
      ]"
    />
    <div class="mx-auto max-w-4xl">
      <h1 class="mb-8 text-center text-2xl font-bold md:text-3xl">
        Commissions de l'Assemblée
      </h1>

      <!-- Barre de recherche -->
      <div class="mb-4">
        <UInput
          v-model="searchQuery"
          placeholder="Rechercher une commission..."
          icon="i-heroicons-magnifying-glass-20-solid"
          size="lg"
          color="gray"
          class="w-full"
        />
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="flex justify-center py-8">
        <UIcon name="i-heroicons-arrow-path" class="h-8 w-8 animate-spin" />
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="py-8 text-center text-red-500">
        {{ error }}
      </div>

      <!-- Liste des commissions -->
      <div v-else class="grid gap-2">
        <UCard
          v-for="commission in filteredCommissions"
          :key="commission.id"
          class="rounded-none transition-all hover:shadow-lg"
        >
          <NuxtLink
            :to="`/assemblee-nationale/commissions/${commission.id}`"
            class="flex items-center justify-between"
          >
            <div>
              <!-- <p class="text-sm text-gray-500">
                Commission N°{{ commission.id }}
              </p> -->
              <h2 class="text-lg font-medium">
                {{ commission.name }}
              </h2>
              <p v-if="commission.president" class="text-sm text-gray-500">
                Président {{ commission.president.first_name }}
                {{ commission.president.last_name }}
              </p>
              <p class="text-sm text-gray-500">
                {{ commission.members.length }} membres
              </p>
            </div>
            <UIcon
              name="i-heroicons-chevron-right"
              class="h-5 w-5 text-gray-400"
            />
          </NuxtLink>
        </UCard>
      </div>

      <!-- Empty state -->
      <div
        v-if="!loading && !error && filteredCommissions.length === 0"
        class="py-8 text-center text-gray-500"
      >
        Aucune commission trouvée
      </div>
    </div>
  </div>
</template>
