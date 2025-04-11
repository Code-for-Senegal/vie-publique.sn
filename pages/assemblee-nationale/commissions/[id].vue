<script setup lang="ts">
const route = useRoute();
const router = useRouter();

const config = useRuntimeConfig();
const { commission, loading, error, fetchAssemblyCommissionById } =
  useAssemblyCommissions();

onMounted(async () => {
  console.log("onMounted");
  if (route.params.id) {
    await fetchAssemblyCommissionById(route.params.id as string);
  }
});

// Function to get full image URL
const getImageUrl = (imageId: string) => {
  return `${config.public.cmsApiUrl}/assets/${imageId}`;
};

// Get bureau members IDs to filter them out from regular members
const getBureauMembersIds = computed(() => {
  if (!commission.value) return [];
  const ids = [];

  if (commission.value.president?.id) ids.push(commission.value.president.id);
  if (commission.value.vice_president?.id)
    ids.push(commission.value.vice_president.id);
  if (commission.value["1st_vice_president"]?.id)
    ids.push(commission.value["1st_vice_president"].id);
  if (commission.value["2nd_vice_president"]?.id)
    ids.push(commission.value["2nd_vice_president"].id);
  if (commission.value["secretary"]?.id)
    ids.push(commission.value["secretary"].id);
  if (commission.value["reporter"]?.id)
    ids.push(commission.value["reporter"].id);

  return ids;
});

// Filter regular members (excluding bureau members)
const regularMembers = computed(() => {
  if (!commission.value?.members) return [];

  return commission.value.members.filter(
    (member) =>
      !getBureauMembersIds.value.includes(member.assembly_deputy_id.id),
  );
});

const deputyUrl = computed((deputy: any) => {
  const fullName = `${deputy.first_name}-${deputy.last_name}`
    .toLowerCase()
    .replace(/\s+/g, "-")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return `/assemblee-nationale/deputes/${deputy.id}/${fullName}`;
});
</script>

<template>
  <div class="container mx-auto px-4 py-4">
    <div class="mx-auto max-w-6xl">
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

      <!-- Contenu de la commission -->
      <div v-else-if="commission" class="space-y-8">
        <!-- <pre>{{ commission }}</pre> -->
        <!-- En-tête de la commission -->
        <div class="rounded-lg bg-white p-2 shadow-sm">
          <h1 class="mb-2 text-2xl font-bold md:text-3xl">
            {{ commission.name }}
          </h1>

          <div class="prose prose-gray max-w-none">
            <p class="text-gray-600">{{ commission.description }}</p>
          </div>
        </div>

        <!-- Bureau de la commission -->
        <div class="rounded-lg bg-white p-2 shadow-sm">
          <h2 class="mb-6 text-xl font-bold">Bureau de la commission</h2>

          <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <!-- Président -->

            <NuxtLink
              v-if="commission.president"
              :to="`/assemblee-nationale/deputes/${commission.president.id}/${$getSlugifyUrlPath(commission.president.first_name + '-' + commission.president.last_name)}`"
              class="flex items-center space-x-4"
            >
              <img
                :src="getImageUrl(commission.president.photo)"
                :alt="commission.president.first_name"
                class="h-16 w-16 rounded-full object-cover"
              />

              <div>
                <div class="font-medium">
                  {{ commission.president.first_name }}
                  {{ commission.president.last_name }}
                </div>
                <div class="text-sm text-gray-500">Président(e)</div>
              </div>
            </NuxtLink>

            <div
              v-if="commission.vice_president"
              class="flex items-center space-x-4"
            >
              <img
                v-if="commission.vice_president.photo"
                :src="getImageUrl(commission.vice_president.photo)"
                :alt="commission.vice_president.first_name"
                class="h-16 w-16 rounded-full object-cover"
              />
              <UAvatar
                v-else
                :src="
                  commission.vice_president.gender === 'M'
                    ? '/adobe-default-profil-man.jpg'
                    : '/adobe-default-profil-women.jpg'
                "
                alt="Default image"
                size="3xl"
                class="m-4 shadow-md"
              />
              <div>
                <div class="font-medium">
                  {{ commission.vice_president.first_name }}
                  {{ commission.vice_president.last_name }}
                </div>
                <div class="text-sm text-gray-500">Vice-président(e)</div>
              </div>
            </div>

            <!-- 1er Vice-président -->

            <NuxtLink
              v-if="commission['1st_vice_president']"
              :to="`/assemblee-nationale/deputes/${commission['1st_vice_president'].id}/${$getSlugifyUrlPath(commission['1st_vice_president'].first_name + '-' + commission['1st_vice_president'].last_name)}`"
              class="flex items-center space-x-4"
            >
              <img
                v-if="commission['1st_vice_president'].photo"
                :src="getImageUrl(commission['1st_vice_president'].photo)"
                :alt="commission['1st_vice_president'].first_name"
                class="h-16 w-16 rounded-full object-cover"
              />
              <UAvatar
                v-else
                :src="
                  commission['1st_vice_president'].gender === 'M'
                    ? '/adobe-default-profil-man.jpg'
                    : '/adobe-default-profil-women.jpg'
                "
                alt="Default image"
                size="3xl"
                class="m-4 shadow-md"
              />
              <div>
                <div class="font-medium">
                  {{ commission["1st_vice_president"].first_name }}
                  {{ commission["1st_vice_president"].last_name }}
                </div>
                <div class="text-sm text-gray-500">1er Vice-président(e)</div>
              </div>
            </NuxtLink>

            <NuxtLink
              v-if="commission['2nd_vice_president']"
              :to="`/assemblee-nationale/deputes/${commission['2nd_vice_president'].id}/${$getSlugifyUrlPath(commission['2nd_vice_president'].first_name + '-' + commission['2nd_vice_president'].last_name)}`"
              class="flex items-center space-x-4"
            >
              <img
                :src="getImageUrl(commission['2nd_vice_president'].photo)"
                :alt="commission['2nd_vice_president'].first_name"
                class="h-16 w-16 rounded-full object-cover"
              />
              <div>
                <div class="font-medium">
                  {{ commission["2nd_vice_president"].first_name }}
                  {{ commission["2nd_vice_president"].last_name }}
                </div>
                <div class="text-sm text-gray-500">1er Vice-président(e)</div>
              </div>
            </NuxtLink>

            <!-- Vice-secretary -->
            <div
              v-if="commission.secretary"
              class="flex items-center space-x-4"
            >
              <img
                :src="getImageUrl(commission.secretary.photo)"
                :alt="commission.secretary.first_name"
                class="h-16 w-16 rounded-full object-cover"
              />
              <div>
                <div class="font-medium">
                  {{ commission.secretary.first_name }}
                  {{ commission.secretary.last_name }}
                </div>
                <div class="text-sm text-gray-500">Vice-président(e)</div>
              </div>
            </div>

            <!-- reporter -->
            <div v-if="commission.reporter" class="flex items-center space-x-4">
              <img
                :src="getImageUrl(commission.reporter.photo)"
                :alt="commission.reporter.first_name"
                class="h-16 w-16 rounded-full object-cover"
              />
              <div>
                <div class="font-medium">
                  {{ commission.reporter.first_name }}
                  {{ commission.reporter.last_name }}
                </div>
                <div class="text-sm text-gray-500">Vice-président(e)</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Membres de la commission -->
        <div class="rounded-lg bg-white p-6 shadow-sm">
          <h2 class="mb-6 text-xl font-bold">Membres de la commission</h2>

          <div class="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            <AssemblyDeputyCard
              v-for="deputy in regularMembers"
              :key="deputy.assembly_deputy_id.id"
              :deputy="deputy.assembly_deputy_id"
            />
            <!-- <div
              v-for="member in regularMembers"
              :key="member.assembly_deputy_id.id"
              class="flex flex-col items-center space-y-2 text-center"
            >
              <img
                :src="getImageUrl(member.assembly_deputy_id.photo)"
                :alt="member.assembly_deputy_id.first_name"
                class="h-24 w-24 rounded-full object-cover"
              />
              <div>
                <div class="font-medium">
                  {{ member.assembly_deputy_id.first_name }}
                </div>
                <div class="font-medium">
                  {{ member.assembly_deputy_id.last_name }}
                </div>
                <div class="text-sm text-gray-500">
                  {{ member.assembly_deputy_id.profession }}
                </div>
              </div>
            </div> -->
          </div>
        </div>
      </div>

      <!-- Not found state -->
      <div v-else class="py-8 text-center text-gray-500">
        Commission non trouvée
      </div>
    </div>
  </div>
</template>
