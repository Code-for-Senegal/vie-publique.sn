<template>
  <UContainer>
    <!-- <UBreadcrumb
      class="mt-2"
      :links="[
        { label: 'Accueil', to: '/' },
        { label: 'Assemblée', to: '/assemblee-nationale' },
        { label: 'Groupes' },
      ]"
    /> -->
    <UButton
      icon="i-heroicons-arrow-left"
      variant="ghost"
      label="Retour à la liste"
      color="gray"
      @click.native="router.back()"
    />
    <!-- En-tête -->
    <div class="mb-8">
      <div class="prose prose-sm sm:prose my-2">
        <h1 class="">Les groupes parlementaires</h1>
      </div>
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
const router = useRouter();

onMounted(() => {
  fetchAssemblyGroups();
});
</script>
