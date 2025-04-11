<!-- pages/assemblee-nationale/votes/index.vue -->
<template>
  <div class="min-h-screen">
    <UButton
      icon="i-heroicons-arrow-left"
      variant="ghost"
      label="15e législature"
      color="gray"
      @click.native="router.back()"
    />
    <UContainer>
      <!-- <UBreadcrumb
        class="mt-2"
        :links="[
          { label: 'Accueil', to: '/' },
          { label: '15e législature', to: '/assemblee-nationale' },
          { label: 'votes' },
        ]"
      /> -->

      <!-- En-tête avec titre et description -->
      <div class="mb-8">
        <h1 class="mb-4 text-4xl font-bold text-gray-900">
          Les votes décryptés par Vie Publique
        </h1>
        <div class="prose max-w-3xl text-sm text-gray-600">
          <p>
            L'équipe de Vie-Publique décrypte pour vous les votes de la
            législature en cours. chaque vote fait l'objet d'une reformulation
            et d'une contextualisation, afin de le rendre plus accessible et
            plus compréhensible.
          </p>
        </div>
      </div>

      <!-- Loading state -->
      <template v-if="loading && !votes.length">
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

      <!-- Liste des votes -->
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ULink
          v-for="vote in votes"
          :key="vote.id"
          :to="`/assemblee-nationale/votes/${vote.id}`"
          class="transition-shadow hover:shadow-md"
        >
          <UCard
            class="h-full rounded-none p-0 transition-shadow hover:shadow-md"
          >
            <div class="flex h-full flex-col p-0">
              <!-- Header: Date et Status -->
              <div class="mb-4 flex items-center justify-between">
                <span
                  class="rounded-full bg-gray-50 px-2 py-1 text-xs text-gray-600"
                >
                  {{ $getAssemblyVoteLabel(vote.type) }}
                </span>

                <UBadge
                  :color="vote.status === 'adopted' ? 'emerald' : 'red'"
                  class="font-medium uppercase"
                >
                  {{ vote.status === "adopted" ? "Adopté" : "Rejeté" }}
                </UBadge>
              </div>

              <!-- Titre -->
              <h2 class="mb-auto text-lg font-medium text-gray-900">
                {{ vote.name }}
              </h2>

              <!-- Tag catégorie -->
              <div>
                <span class="text-sm text-gray-500">
                  {{ $dateformat(vote.date) }}
                </span>
              </div>
            </div>
          </UCard>
        </ULink>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
const { fetchAssemblyVotes, votes, loading, error } = useAssemblyVotes();
const router = useRouter();

onMounted(() => {
  fetchAssemblyVotes();
});

// const formatDate = (date: string) => {
//   return new Date(date).toLocaleDateString("fr-FR", {
//     day: "numeric",
//     month: "long",
//     year: "numeric",
//   });
// };

const getBgColor = (voteType: string): string => {
  const colors: Record<string, string> = {
    government_bill: "yellow",
    election: "indigo",
  };
  return colors[voteType];
};
</script>
