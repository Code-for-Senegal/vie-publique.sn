<script setup lang="ts">
import type { Deputy } from "@/types/deputy";

interface ProfileHeaderProps {
  deputy: Deputy;
}

defineProps<ProfileHeaderProps>();
</script>

<template>
  <div v-if="deputy" class="rounded-lg border bg-white p-4 shadow-sm">
    <div class="flex flex-col items-center text-center">
      <img
        v-if="deputy.photo"
        :src="$directusImageUrl(deputy.photo, '50')"
        :alt="deputy.first_name + ' ' + deputy.last_name"
        class="mb-4 h-full w-full object-cover"
        loading="lazy"
        fetchpriority="high"
      />
      <UAvatar
        v-else
        :src="
          deputy.gender === 'M'
            ? '/adobe-default-profil-man.jpg'
            : '/adobe-default-profil-women.jpg'
        "
        :alt="deputy.first_name + ' ' + deputy.last_name"
        size="3xl"
        class="m-4 shadow"
      />
      <h1 class="mb-2 text-xl font-bold capitalize">
        {{ deputy.first_name.toLowerCase() }}
        <span class="font-bold tracking-wider">
          {{ deputy.last_name.toUpperCase() }}
        </span>
      </h1>
      <!-- <a href="#" class="mb-4 text-red-700 hover:underline">
        {{ deputy.electoral_list.coalition.name }}
      </a> -->
      <div class="mb-2 flex flex-col items-center space-y-2 text-gray-600">
        <div class="flex items-center justify-center gap-2">
          <font-awesome-icon icon="fa-solid fa-location-dot" />
          {{ deputy.gender === "M" ? "Né" : "Née" }} à {{ deputy.birthplace }}
        </div>
        <div>
          <font-awesome-icon :icon="['fas', 'cake-candles']" />
          {{ $getAgeFromBirthdate(deputy.birthdate) }} ans
        </div>
        <div class="capitalize">
          <font-awesome-icon :icon="['fas', 'briefcase']" />
          {{ deputy.profession.toLowerCase() }}
        </div>
      </div>

      <div class="flex items-center justify-center gap-6 pb-2">
        <ULink
          v-if="deputy.facebook"
          :to="deputy.facebook"
          class="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
          target="_blank"
          aria-label="social.label"
        >
          <UIcon name="i-simple-icons-facebook" class="h-8 w-8" />
        </ULink>
        <ULink
          v-if="deputy.twitter"
          :to="deputy.twitter"
          class="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
          target="_blank"
          aria-label="social.label"
        >
          <UIcon name="i-simple-icons-x" class="h-8 w-8" />
        </ULink>
        <ULink
          v-if="deputy.linkedin"
          :to="deputy.linkedin"
          class="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
          target="_blank"
          aria-label="social.label"
        >
          <UIcon name="i-simple-icons-linkedin" class="h-8 w-8" />
        </ULink>
      </div>

      <div
        class="inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800"
      >
        EN ACTIVITÉ
      </div>
    </div>
  </div>
</template>
