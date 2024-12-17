<!-- pages/deputes/[id].vue -->
<template>
  <div class="container mx-auto px-4 py-8">
    <UButton
      icon="i-heroicons-arrow-left"
      variant="ghost"
      label="Retour à la liste"
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
        <!-- <MotionVote
          :title="lastVote?.motion?.title"
          :description="lastVote?.motion?.description"
        /> -->
        <AssemblyBiography :deputy="deputy" />
        <!-- <RecentVotes :votes="deputy?.votes" /> -->

        <UCard v-if="deputiesCommissions.length">
          <h2 class="text-xl font-semibold">Commissions</h2>
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
                  {{ commission.assembly_commission_id.name }}
                </li>
              </ul>
            </NuxtLink>
          </div>
        </UCard>
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
  if (route.params.id) {
    await fetchElectedDeputyById(route.params.id as string);
    await fetchElectedDeputyCommissions(route.params.id as string);
  }
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
</script>
