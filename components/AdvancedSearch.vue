<template>
  <div>
    <UInput
      v-model="searchQuery"
      placeholder="Rechercher dans les journaux officiels..."
      icon="i-heroicons-magnifying-glass"
      @input="debounceSearch"
    />
    <div v-if="isLoading" class="mt-4">
      <UProgress />
    </div>
    <div v-else-if="searchResults.length > 0" class="mt-4">
      <h3 class="mb-2 text-lg font-semibold">Résultats de recherche</h3>
      <ul>
        <li v-for="result in searchResults" :key="result._path" class="mb-4">
          <NuxtLink
            :to="result._path"
            class="block rounded p-2 hover:bg-gray-100"
          >
            <h4 class="text-md font-semibold">{{ result.title }}</h4>
            <p class="text-sm text-gray-600">{{ result.description }}</p>
            <div v-if="result.excerpt" class="mt-2 text-sm">
              <p v-html="highlightExcerpt(result.excerpt)"></p>
            </div>
          </NuxtLink>
        </li>
      </ul>
    </div>
    <div v-else-if="searchQuery && !isLoading" class="mt-4">
      <p>Aucun résultat trouvé pour "{{ searchQuery }}"</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useDebounce } from "@vueuse/core";

const searchQuery = ref("");
const searchResults = ref<any[]>([]);
const isLoading = ref(false);

const search = async () => {
  if (!searchQuery.value) {
    searchResults.value = [];
    return;
  }

  isLoading.value = true;
  try {
    const results = await queryContent("journal-officiel-senegal")
      .where({
        $or: [
          { title: { $regex: searchQuery.value, $options: "i" } },
          { description: { $regex: searchQuery.value, $options: "i" } },
          { body: { $regex: searchQuery.value, $options: "i" } },
        ],
      })
      .find();

    searchResults.value = results.map((result) => ({
      ...result,
      excerpt: extractExcerpt(result.body, searchQuery.value),
    }));
  } catch (error) {
    console.error("Erreur lors de la recherche:", error);
    searchResults.value = [];
  } finally {
    isLoading.value = false;
  }
};

const debounceSearch = useDebounce(search, 300);

const extractExcerpt = (content: string, query: string): string => {
  const regex = new RegExp(`(.{0,50}${query}.{0,50})`, "gi");
  const match = content.match(regex);
  return match ? match[0] : "";
};

const highlightExcerpt = (excerpt: string): string => {
  const regex = new RegExp(`(${searchQuery.value})`, "gi");
  return excerpt.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
};

watch(searchQuery, () => {
  if (searchQuery.value === "") {
    searchResults.value = [];
  }
});
</script>
