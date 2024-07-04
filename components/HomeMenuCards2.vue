<script setup lang="ts">

interface Menu {
    label: string
    description: string
    photo: string
    icon: any
    to: string
}

const props = defineProps<{
    menus: Menu[]
}>()
</script>

<template>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <UCard v-for="menu in menus" :key="menu.label" class="shadow-lg p-4 hover:shadow-xl border-green-700">

            <NuxtLink :to="menu.to" class="flex items-start">
                <!-- <UIcon :name="menu.icon" class="w-20 h-20 sm:w-16 sm:h-16 text-green-700 mr-4 align-top" /> -->
                <UIcon :name="menu.icon" class="w-20 h-14 text-green-700 mr-4" />
                <div>
                    <h2 class="text-md sm:text-xl font-semibold text-green-700">{{ menu.label }}</h2>
                    <p class="text-gray-600">{{ menu.description }}</p>
                </div>
            </NuxtLink>
        </UCard>
    </div>
</template>