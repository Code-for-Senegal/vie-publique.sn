<!-- pages/assemblee-nationale/votes/[id].vue -->
<template>
  <div>
    <!-- Hero section avec image de fond -->
    <div class="relative h-48 bg-gray-900 dark:bg-gray-900">
      <div class="absolute inset-0">
        <img
          src="/images/menu/assemblee-nationale-1.jpg"
          alt="Hémicycle"
          class="h-full w-full object-cover opacity-50"
        />
      </div>
      <div class="absolute left-4 top-4">
        <UButton
          icon="i-heroicons-arrow-left"
          variant="ghost"
          label="Retour à la liste"
          color="white"
          class="text-white"
          @click="handleReturn()"
        />
      </div>
      <div class="absolute right-4 top-4">
        <UBadge class="text-lg" :color="vote?.status === 'adopted' ? 'emerald' : 'red'">
          # {{ $getAssemblyVoteLabel(vote?.type) }}
        </UBadge>
      </div>
    </div>

    <!-- Contenu principal -->
    <UContainer class="relative -mt-24">
      <!-- Loading state -->
      <div v-if="loading" class="flex justify-center py-8">
        <UIcon name="i-heroicons-arrow-path" class="h-8 w-8 animate-spin" />
      </div>

      <!-- Error state -->
      <UAlert
        v-else-if="error"
        title="Erreur de chargement"
        description="Impossible de charger les informations du vote"
        color="red"
        icon="i-heroicons-exclamation-triangle"
      />

      <UCard v-else class="mb-8 dark:border-gray-700 dark:bg-gray-800">
        <!-- En-tête -->
        <div class="mb-6">
          <div class="mb-2 text-sm text-gray-600 dark:text-gray-300">
            VOTE n° {{ vote?.id }} du {{ formatDate(vote?.date) }}
          </div>
          <h1 class="mb-4 text-3xl font-bold text-gray-900 dark:text-gray-100">
            {{ vote?.name }}
          </h1>
          <UBadge
            :color="vote?.status === 'adopted' ? 'emerald' : 'red'"
            class="text-lg font-medium uppercase"
          >
            {{ vote?.status === 'adopted' ? 'Adopté' : 'Rejeté' }}
          </UBadge>
        </div>

        <!-- Barre de résultats -->
        <div v-if="vote?.voters_for" class="mb-8">
          <div class="flex overflow-hidden rounded-lg">
            <!-- Pour -->
            <div class="flex-1 items-center justify-center bg-emerald-500 py-2 text-white">
              <!-- :style="{ width: `${(vote?.voters_for / vote?.voters) * 100}%` }" -->
              <div class="text-center">
                <div class="text-xl font-bold">
                  {{ vote?.voters_for ?? 'N/A' }}
                </div>
                <div class="text-sm uppercase">Pour</div>
              </div>
            </div>
            <!-- Abstention -->
            <div class="flex-1 items-center justify-center bg-amber-400 py-2 text-white">
              <div class="text-center">
                <div class="text-xl font-bold">
                  {{ vote?.voters_abstention ?? 'N/A' }}
                </div>
                <div class="text-sm uppercase">Abstention</div>
              </div>
            </div>
            <!-- Contre -->
            <div class="flex-1 items-center justify-center bg-red-500 py-2 text-white">
              <div class="text-center">
                <div class="text-xl font-bold">
                  {{ vote?.voters_against ?? 'N/A' }}
                </div>
                <div class="text-sm uppercase">Contre</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Résultats et Infos -->
        <!-- Colonne gauche : Résultat -->
        <div>
          <h2 class="mb-4 text-2xl font-bold dark:text-gray-100">Résultat du vote</h2>
          <div class="prose dark:prose-invert">
            <p>
              Les députés ont
              <span class="font-medium text-emerald-500">
                {{ vote?.status === 'adopted' ? 'adopté' : 'rejeté' }}
              </span>
              le {{ formatDate(vote?.date) }}:
            </p>

            <div class="prose prose-gray max-w-none dark:prose-invert" v-html="vote?.desc"></div>
          </div>
        </div>
      </UCard>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const id = computed(() => route.params.id as string);
const { vote, loading, error } = useAssemblyVotes({ id });
const router = useRouter();

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const handleReturn = () => {
  const previousRoute = router.options.history.state.back;
  // Si on vient de la liste des votes, on fait retour arrière
  if (typeof previousRoute === 'string' && previousRoute.includes('/assemblee-nationale/votes')) {
    router.back();
  } else {
    // Sinon on redirige vers la liste
    router.push('/assemblee-nationale/votes');
  }
};
</script>
