<!-- pages/deputes/[id].vue -->
<template>
  <div class="container mx-auto px-4 py-4">
    <UButton
      icon="i-heroicons-arrow-left"
      class="mb-2"
      variant="ghost"
      label="Retour"
      color="gray"
      @click.native="router.back()"
    />

    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center py-8">
      <UIcon name="i-heroicons-arrow-path" class="h-8 w-8 animate-spin" />
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="py-8 text-center text-red-500">
      {{ error }}
    </div>

    <div v-else-if="deputy" class="mt-3 flex flex-col gap-4 md:flex-row">
      <div class="w-full md:w-1/3">
        <div class="md:z-1 sticky top-[84px] bg-gray-100 md:bg-transparent">
          <!-- <pre>{{ deputy }}</pre> -->

          <AssemblyProfileHeader :deputy="deputy" />
        </div>
      </div>

      <div class="flex w-full flex-col gap-5 md:w-2/3">
        <!-- VOTES -->
        <!-- <MotionVote
          :title="lastVote?.motion?.title"
          :description="lastVote?.motion?.description"
        /> -->
        <!-- <RecentVotes :votes="deputy?.votes" /> -->

        <!-- BIO -->
        <AssemblyBiography :deputy="deputy" />

        <!-- COMMISSIONS -->
        <UCard v-if="deputiesCommissions.length">
          <h2 class="mb-4 text-xl font-bold">Commissions</h2>

          <div v-if="deputiesCommissionsFiltered.length === 0">
            <p class="text-sm text-gray-500">Aucune commission</p>
          </div>
          <div v-else>
            <p class="my-4 text-sm text-gray-500">
              Membres des commissions suivantes:
            </p>

            <div
              v-for="commission in deputiesCommissionsFiltered"
              :key="commission.assembly_commission_id.id"
              class="transition-all hover:shadow-lg"
            >
              <NuxtLink
                :to="`/assemblee-nationale/commissions/${commission.assembly_commission_id.id}`"
              >
                <ul class="flex gap-4">
                  <li class="mb-2 text-sm underline">
                    <UIcon
                      name="i-heroicons-arrow-top-right-on-square"
                      size="sm"
                    />
                    {{ commission.assembly_commission_id.name }}
                  </li>
                </ul>
              </NuxtLink>
            </div>
          </div>
        </UCard>

        <!-- QUESTIONS ECRITES -->
        <AssemblyDeputyQuestion :deputy="deputy" />
        <!-- <UCard v-if="deputy.questions.length">
          <h2 class="text-xl font-semibold">Questions écrites</h2>
          <div
            v-for="question in deputy.questions"
            :key="question.id"
            class="transition-all hover:shadow-lg"
          >
            <NuxtLink :to="`/assemblee-nationale/questions/${question.id}`">
              <ul class="flex gap-4">
                <li class="mb-2 text-sm underline">{{ question.title }}</li>
              </ul>
            </NuxtLink>
          </div>
          </UCard>-->
      </div>
    </div>

    <!-- Not found state -->
    <div v-else class="py-8 text-center text-gray-500">Député non trouvée</div>
  </div>
</template>

<script setup lang="ts">
import { useDeputev2 } from "@/composables/parliament/useDeputev2";

const route = useRoute();
const router = useRouter();

// const { deputy, loading } = useDeputev2(parseInt(route.params?.id));
const {
  deputy,
  deputiesCommissions,
  loading,
  error,
  fetchElectedDeputyById,
  fetchElectedDeputyCommissions,
} = useDeputev2();

onMounted(async () => {
  const deputyId = route.params.id as string;

  if (deputyId) {
    await Promise.all([
      fetchElectedDeputyById(deputyId),
      fetchElectedDeputyCommissions(deputyId),
    ]);
  }
  await nextTick();
  setupSEO();
});

const deputiesCommissionsFiltered = computed(() => {
  return deputiesCommissions.value.filter(
    (commission) => commission.assembly_commission_id,
  );
});
const age = computed(() => {
  if (!deputy.birthdate) return null;
  const birthDate = new Date(deputy.birthdate);
  const today = new Date();

  return today.getFullYear() - birthDate.getFullYear();
});

// const lastVote = computed(() => {
//   return deputy.value?.votes[0];
// });

function setupSEO() {
  useHead({
    title: deputy.value
      ? `${deputy.value.first_name} ${deputy.value.last_name} - Député`
      : "Chargement...",
    meta: [
      {
        name: "description",
        content: deputy.value
          ? `Découvrez le profil et l'activité parlementaire de ${deputy.value.first_name} ${deputy.value.last_name}, député ${deputy.value.electoral_list.name}`
          : "",
      },
    ],
  });
}

onMounted(async () => {
  // Attendre que deputy soit chargé
  await nextTick();

  // Configuration SEO une fois deputy chargé
  useHead({
    title: computed(() =>
      deputy
        ? `${deputy.first_name} ${deputy.last_name} - Député`
        : "Chargement...",
    ),
    meta: [
      {
        name: "description",
        content: computed(() =>
          deputy
            ? `Découvrez le profil et l'activité parlementaire de ${deputy.first_name} ${deputy.last_name}, député ${deputy.electoral_list.name}`
            : "",
        ),
      },
    ],
  });
});

// Liste des routes valides pour le retour
const validReturnPaths = [
  "/assemblee-nationale/deputes",
  "/assemblee-nationale/commissions",
  "/assemblee-nationale/bureau",
  "/assemblee-nationale/groupes",
];

// Gestion du retour
const handleReturn = () => {
  // Vérifie si on a un referer dans l'historique de navigation
  const previousRoute = router.options.history.state.back;

  // Si on a un referer et qu'il fait partie des routes valides
  if (
    previousRoute &&
    validReturnPaths.some((path) => previousRoute.startsWith(path))
  ) {
    router.back();
  } else {
    // Sinon, redirection vers la liste des députés par défaut
    router.push("/assemblee-nationale/deputes");
  }
};
</script>
