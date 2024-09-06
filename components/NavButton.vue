<script setup lang="ts">
import { ref } from 'vue';

interface Link {
  label: string;
  to: string;
  children?: Link[];
}

const props = defineProps<{
  link: Link;
}>();

const isOpen = ref(false);
const dropdownRef = ref(null);

function toggleDropdown() {
  isOpen.value = !isOpen.value;
}

function handleClickOutside(event) {
    if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
        isOpen.value = false;
    }
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});

</script>

<template>
  <li class="relative border-b md:border-none" v-if="link.children">
    <button
      class="flex m-0 justify-between hover:bg-gray-100 items-center p-4 text-dark hover:rounded-none w-[100%]"
      @click="toggleDropdown" ref="dropdownRef"
    >
        <div>
            {{ link.label }}
        </div>
        <div>
            <UIcon name="i-heroicons-chevron-down"
            class="w-4 h-4 ml-2 transition-transform duration-200"
            :class="isOpen ? 'rotate-180' : 'rotate-0'"
        />
        </div>
    </button>
    <ul
      v-if="isOpen"
      class="md:absolute left-0 mt-2 md:w-[256px] md:ms-0 ms-3 bg-white md:rounded-md md:shadow-lg z-50 w-[100%]"
    >
      <li
        v-for="child in link.children"
        :key="child.label"
        class="border-b mx-4"
      >
        <NuxtLink
          :to="child.to"
          class="block py-3 text-gray-700 hover:bg-gray-100"
        >
          {{ child.label }}
        </NuxtLink>
      </li>
    </ul>
  </li>
  <li v-else>
    <NuxtLink
      :to="props.link.to"
      class="flex hover:bg-gray-100 items-center p-4 text-dark"
    >
      {{ props.link.label }}
    </NuxtLink>
  </li>
</template>
