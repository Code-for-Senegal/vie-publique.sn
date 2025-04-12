<script setup lang="ts">
const config = useRuntimeConfig();

const props = defineProps<{
  deputy: {
    id: number;
    first_name: string;
    last_name: string;
    profession: string;
    photo: string;
    gender: string;
    birthplace: string;
    birthdate: string;
    biography: string;
    group: {
      name: string;
      color: string;
    };
    electoral_list: {
      type: string;
      name: string;
      coalition: {
        name: string;
        color: string;
      };
      constituency: any;
    };
  };
}>();

const deputyUrl = computed(() => {
  const fullName = `${props.deputy.first_name}-${props.deputy.last_name}`
    .toLowerCase()
    .replace(/\s+/g, "-")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return `/assemblee-nationale/deputes/${props.deputy.id}/${fullName}`;
});
</script>

<template>
  <div class="relative flex h-56 flex-col overflow-hidden rounded-lg shadow-lg">
    <NuxtLink :to="deputyUrl" class="block">
      <!-- Image du candidat ou image par défaut -->
      <img
        v-if="deputy.photo"
        :src="$directusImageUrl(deputy.photo, '50')"
        :alt="deputy.first_name + ' ' + deputy.last_name"
        class="h-full w-full object-cover"
        loading="lazy"
        fetchpriority="high"
      />
      <img
        v-else
        :src="
          deputy.gender === 'M'
            ? '/adobe-default-profil-man.jpg'
            : '/adobe-default-profil-women.jpg'
        "
        alt="Default image"
        size="3xl"
        class="m-4 shadow-md"
      />

      <!-- Overlay sombre uniquement si c'est l'image par défaut -->
      <div
        v-if="!deputy.photo"
        class="absolute inset-0 bg-black bg-opacity-70"
      ></div>

      <!-- Overlay sombre si la photo est présente -->
      <div
        v-if="deputy.photo"
        class="absolute inset-0 bg-black bg-opacity-40"
      ></div>

      <!-- Texte superposé (Nom, prénom, profession) -->
      <div class="absolute inset-0 flex flex-col justify-end p-2 text-white">
        <h4 class="truncate text-sm font-bold capitalize">
          {{ deputy.first_name.toLowerCase() }}
          <span class="font-bold tracking-wider">
            {{ deputy.last_name.toUpperCase() }}
          </span>
        </h4>

        <p class="mb-1 truncate text-xs lowercase">
          {{ $getAgeFromBirthdate(deputy.birthdate) }} ans |
          {{ deputy.profession.toLowerCase() }}
        </p>
        <h4
          class="left-2 top-2 p-1 text-xs font-bold text-white"
          :style="{
            backgroundColor: deputy.group.color,
          }"
        >
          {{ deputy.group.name }}
          <span v-if="deputy.electoral_list.constituency">{{
            deputy.electoral_list.constituency.name
          }}</span>
        </h4>
      </div>
    </NuxtLink>
  </div>
</template>
