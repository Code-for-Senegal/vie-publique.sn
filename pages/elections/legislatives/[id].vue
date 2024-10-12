<script setup lang="ts">
const route = useRoute();
const coalitionId = route.params.id as string;

const { data: lists, pending: loading, error } = useElectoralLists(coalitionId);

const listTypeFilter = ref<"all" | "national" | "departmental">("all");

const filteredLists = computed(() => {
  if (!lists.value) return [];
  if (listTypeFilter.value === "all") return lists.value;
  return lists.value.filter((list) => list.type === listTypeFilter.value);
});

// useHead({
//   title: `Détails de la coalition ${coalitionId}`,
//   meta: [
//     {
//       name: "description",
//       content: `Listes électorales et candidats de la coalition ${coalitionId}`,
//     },
//   ],
// });

useHead({
  meta: [{ name: "robots", content: "noindex" }],
});
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="mb-6 text-3xl font-bold">
      Détails de la coalition {{ coalitionId }}
    </h1>

    <UCard v-if="loading">
      <USkeleton class="h-32" />
    </UCard>

    <UAlert v-else-if="error" type="danger">
      {{ error }}
    </UAlert>

    <template v-else-if="lists">
      <div class="mb-4">
        <URadio
          v-model="listTypeFilter"
          name="listType"
          value="all"
          label="Toutes les listes"
        />
        <URadio
          v-model="listTypeFilter"
          name="listType"
          value="national"
          label="Liste nationale"
        />
        <URadio
          v-model="listTypeFilter"
          name="listType"
          value="departmental"
          label="Listes départementales"
        />
      </div>

      <div v-for="list in filteredLists" :key="list.name" class="mb-8">
        <UCard>
          <template #header>
            <h2 class="text-xl font-semibold">{{ list.name }}</h2>
            <p>
              Type:
              {{ list.type === "national" ? "Nationale" : "Départementale" }}
            </p>
            <p v-if="list.constituency">
              Département: {{ list.constituency.name }}
            </p>
            <p>
              {{ list.is_substitute ? "Liste suppléante" : "Liste titulaire" }}
            </p>
          </template>

          <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <UCard
              v-for="candidate in list.candidates"
              :key="candidate.voter_number"
              class="flex items-center p-4"
            >
              <div class="mr-4 flex-shrink-0">
                <UAvatar
                  v-if="candidate.photo"
                  :src="$directusImageUrl(candidate.photo)"
                  :alt="candidate.first_name + ' ' + candidate.last_name"
                  size="lg"
                />
                <div
                  v-else
                  class="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200"
                >
                  <span class="text-2xl font-bold">{{
                    candidate.position
                  }}</span>
                </div>
              </div>
              <div>
                <h3 class="text-lg font-semibold">
                  {{ candidate.first_name }} {{ candidate.last_name }}
                </h3>
                <p class="text-sm text-gray-600">{{ candidate.profession }}</p>
                <p class="text-sm text-gray-600">
                  Position: {{ candidate.position }}
                </p>
              </div>
            </UCard>
          </div>
        </UCard>
      </div>
    </template>
  </div>
</template>
