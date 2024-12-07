<script setup lang="ts">
import type { Deputy } from '@/types/deputy';

interface ProfileHeaderProps {
    deputy: Deputy;
}

defineProps<ProfileHeaderProps>();

</script>

<template>
    <div v-if="deputy" class="bg-white border rounded-lg p-6 shadow-sm">
        <div class="flex flex-col items-center text-center">
            <img v-if="deputy.photo" :src="$directusImageUrl(deputy.photo, '50')" :alt="deputy.first_name + ' ' + deputy.last_name" class="w-48 h-48 rounded-full mb-6" />
            <img v-else :src="deputy.gender === 'M' ? '/adobe-default-profil-man.jpg' : '/adobe-default-profil-women.jpg'" :alt="deputy.first_name + ' ' + deputy.last_name" class="w-48 h-48 rounded-full mb-6" />
            <h1 class="text-2xl font-bold mb-2 uppercase">
                {{ deputy.first_name }} <br>
                {{ deputy.last_name }}
            </h1>
            <a href="#" class="text-red-700 hover:underline mb-4">
                {{ deputy.electoral_list.coalition.name }}
            </a>
            <div class="space-y-2 text-gray-600 mb-4 flex flex-col items-start">
                <div class="flex items-center justify-center gap-2">
                    <font-awesome-icon icon="fa-solid fa-location-dot"/>
                    {{ deputy.birthplace }}
                </div>
                <div>
                    <font-awesome-icon :icon="['fas', 'cake-candles']" />
                    {{ $getAgeFromBirthdate(deputy.birthdate) }} ans
                </div>
                <div>
                    <font-awesome-icon :icon="['fas', 'briefcase']" />
                    {{ deputy.profession.toLowerCase() }}
                </div>
            </div>
            <div class="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                EN ACTIVITÉ
            </div>
        </div>
    </div>
</template>