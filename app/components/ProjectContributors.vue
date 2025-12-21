<script setup lang="ts">
const { contributors, loading, error } = useContributors();

const getAvatar = (contributor: any) => {
  if (contributor.image) {
    return useCmsImage(contributor.image);
  }
  return contributor.gender === 'M'
    ? '/adobe-default-profil-man.jpg'
    : '/adobe-default-profil-women.jpg';
};
</script>

<template>
  <div class="bg-white py-2 dark:text-black">
    <div class="container mx-auto">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-8">
        <UIcon name="i-heroicons-arrow-path" class="h-8 w-8 animate-spin" />
      </div>

      <!-- Error State -->
      <UAlert
        v-else-if="error"
        color="red"
        variant="soft"
        title="Erreur de chargement"
        description="Impossible de charger les contributeurs pour le moment."
        class="mx-auto mb-8 max-w-lg"
      />

      <div v-else class="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-3">
        <div
          v-for="contributor in contributors"
          :key="contributor.id"
          class="flex flex-col items-center rounded-lg bg-white p-2 shadow-md transition-all hover:shadow-lg"
        >
          <!-- Image du contributeur -->
          <div class="rounded-full">
            <UAvatar
              :src="getAvatar(contributor)"
              :alt="contributor.name"
              :ui="{ rounded: 'rounded-full' }"
              size="3xl"
              class="object-cover shadow-md"
              loading="lazy"
            />
          </div>

          <!-- Informations du contributeur -->
          <div class="mt-4 flex h-14 flex-col justify-center text-center">
            <p class="text-lg font-semibold leading-tight text-gray-900 md:text-xl">
              <span class="block">{{ contributor.first_name }}</span>
              <span class="block uppercase">{{ contributor.last_name }}</span>
            </p>
          </div>

          <p
            class="mt-1 w-full truncate px-2 text-center text-sm text-gray-500"
            :title="contributor.job"
          >
            {{ contributor.job }}
          </p>

          <!-- Lien LinkedIn -->
          <a
            v-if="contributor.linkedin"
            :href="contributor.linkedin"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-4 inline-flex hidden items-center text-blue-600 hover:text-blue-800"
          >
            <UIcon name="i-heroicons-link" class="mr-1 h-5 w-5" />
            LinkedIn
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
