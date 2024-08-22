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
    <div class="grid-container mt-2">
        <ULink v-for="link in menus" :key="link.to" :to="link.to" class="w-full mb-2">
            <UCard class="custom-shadow border-b-2 border-green-700 h-28 sm:h-28 ">

                <div class="flex flex-row gap-1">
                    <div class="flex-shrink-0 w-11 md:w-16">
                        <UIcon :name="link.icon" class="w-full text-2xl mt-1" />
                    </div>
                    <div class="flex-grow">
                        <h2 class="text-md font-semibold">{{ link.label }}</h2>
                        <p class="text-gray-500 text-sm">{{ link.description }}</p>
                    </div>
                </div>

            </UCard>
        </ULink>
    </div>
</template>