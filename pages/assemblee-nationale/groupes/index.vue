<template>
  <UContainer>
    <UBreadcrumb
      class="mt-2"
      :links="[
        { label: 'Accueil', to: '/' },
        { label: 'Assemblée', to: '/assemblee-nationale' },
        { label: 'Groupes' },
      ]"
    />
    <!-- En-tête -->
    <div class="mb-8">
      <h1 class="mb-4 text-3xl font-bold">
        Les groupes parlementaires
        <!-- <span class="text-primary">{{ groups.length }}</span>  -->
      </h1>
      <p class="text-sm text-gray-600">
        Les groupes politiques rassemblent des députés selon leur affinité
        politique. Un groupe doit être composé au minimum de 16 députés.
      </p>
    </div>

    <!-- Loading state -->
    <template v-if="loading && !groups.length">
      <div class="space-y-4">
        <USkeleton v-for="i in 3" :key="i" class="h-64" />
      </div>
    </template>

    <!-- Error State -->
    <UAlert
      v-if="error"
      icon="i-heroicons-exclamation-triangle"
      color="red"
      variant="soft"
      class="mb-4"
    >
      {{ error }}
    </UAlert>

    <!-- Grille des groupes -->
    <!-- Content -->
    <div v-else>
      <div class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AssemblyGroupCard
          v-for="group in groups"
          :key="group.id"
          :group="group"
        />
      </div>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
const { groups, loading, error, fetchAssemblyGroups } = useAssemblyGroups();

onMounted(() => {
  fetchAssemblyGroups();
});
</script>
