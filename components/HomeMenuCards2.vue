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
        <UCard v-for="menu in menus" :key="menu.label" class="p-4 custom-shadow hover:shadow-xl">

            <NuxtLink :to="menu.to" class="flex items-start">
                <div class="flex-shrink-0 mr-4">
                <div class="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                        <UIcon :name="menu.icon" class="w-8 h-8 text-green-700" />
                    </div>
                </div>
                <!-- <UIcon :name="menu.icon" class="w-14 h-14 text-green-700 mr-4" /> -->
                <div>
                    <h2 class="text-md sm:text-xl font-semibold text-green-700">{{ menu.label }}</h2>
                    <p class="text-gray-700">{{ menu.description }}</p>
                </div>
            </NuxtLink>
        </UCard>
    </div>
</template>