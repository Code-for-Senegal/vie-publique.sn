<!-- pages/assemblee-nationale/votes/[id].vue -->
<template>
  <div>
    <!-- Hero section avec image de fond -->
    <div class="relative h-48 bg-gray-900">
      <div class="absolute inset-0">
        <img
          src="/images/menu/assemblee-nationale-1.jpg"
          alt="Hémicycle"
          class="h-full w-full object-cover opacity-50"
        />
      </div>
      <div class="absolute right-4 top-4">
        <UBadge
          class="text-lg"
          :color="vote?.status === 'adopted' ? 'emerald' : 'red'"
        >
          # {{ vote?.type }}
        </UBadge>
      </div>
    </div>

    <!-- Contenu principal -->
    <!-- Contenu principal -->
    <UContainer class="relative -mt-24">
      <UCard class="mb-8">
        <!-- En-tête -->
        <div class="mb-6">
          <div class="mb-2 text-sm text-gray-600">
            LÉGISLATURE {{ vote?.legislature }} - VOTE n° {{ vote?.id }}
          </div>
          <h1 class="mb-4 text-3xl font-bold text-gray-900">
            {{ vote?.name }}
          </h1>
          <UBadge
            :color="vote?.status === 'adopted' ? 'emerald' : 'red'"
            class="text-lg font-medium uppercase"
          >
            {{ vote?.status === "adopted" ? "Adopté" : "Rejeté" }}
          </UBadge>
        </div>

        <!-- Barre de résultats -->
        <div class="mb-8">
          <div class="flex overflow-hidden rounded-lg">
            <!-- Pour -->
            <div
              class="flex-1 items-center justify-center bg-emerald-500 py-2 text-white"
            >
              <!-- :style="{ width: `${(vote?.voters_for / vote?.voters) * 100}%` }" -->
              <div class="text-center">
                <div class="text-xl font-bold">{{ vote?.voters_for }}</div>
                <div class="text-sm uppercase">Pour</div>
              </div>
            </div>
            <!-- Abstention -->
            <div
              class="flex-1 items-center justify-center bg-amber-400 py-2 text-white"
            >
              <div class="text-center">
                <div class="text-xl font-bold">
                  {{ vote?.voters_abstention }}
                </div>
                <div class="text-sm uppercase">Abstention</div>
              </div>
            </div>
            <!-- Contre -->
            <div
              class="flex-1 items-center justify-center bg-red-500 py-2 text-white"
            >
              <div class="text-center">
                <div class="text-xl font-bold">{{ vote?.voters_against }}</div>
                <div class="text-sm uppercase">Contre</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Résultats et Infos -->
        <div class="grid gap-8 md:grid-cols-2">
          <!-- Colonne gauche : Résultat -->
          <div>
            <h2 class="mb-4 text-2xl font-bold">Résultat du vote</h2>
            <div class="prose">
              <p>
                Les députés ont
                <span class="font-medium text-emerald-500">
                  {{ vote?.status === "adopted" ? "adopté" : "rejeté" }}
                </span>
                le {{ formatDate(vote?.date) }} {{ vote?.description }}
              </p>
              <p class="mt-4">
                Au total, <strong>{{ vote?.voters }} députés</strong> ont pris
                part au vote :
                {{ Math.round((vote?.voters_for / vote?.voters) * 100) }}% ont
                voté en faveur,
                {{ Math.round((vote?.voters_against / vote?.voters) * 100) }}%
                ont voté contre, et
                {{
                  Math.round((vote?.voters_abstention / vote?.voters) * 100)
                }}% se sont abstenus.
              </p>
            </div>
          </div>

          <!-- Colonne droite : Infos -->
          <div>
            <h2 class="mb-4 text-2xl font-bold">Infos</h2>
            <div class="space-y-4">
              <div class="flex items-center justify-between border-b py-2">
                <span class="text-gray-600">Date</span>
                <span class="font-medium">{{ formatDate(vote?.date) }}</span>
              </div>
              <div class="flex items-center justify-between border-b py-2">
                <span class="text-gray-600">Type de vote</span>
                <div class="flex items-center gap-2">
                  <span class="font-medium">{{ vote?.type }}</span>
                  <UIcon
                    name="i-heroicons-question-mark-circle"
                    class="text-gray-400"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </UCard>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const { fetchAssemblyVoteById, vote, loading, error } = useAssemblyVotes();

onMounted(() => {
  fetchAssemblyVoteById(route.params.id as string);
});

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};
</script>
