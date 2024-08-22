<script setup lang="ts">
const currentYear = new Date().getFullYear();
const version = "22-Aout";

const links = [
  {
    label: 'À Propos',
    to: '/about/us',
  },
  {
    label: 'Contact',
    to: '/contact',
  },
  {
    label: 'Newsletter',
    to: '/newsletter',
  },
  {
    label: 'Règles de confidentialité',
    to: '/about/privacy',
  }, {
    label: 'Linkedin',
    to: 'https://www.linkedin.com/company/vie-publique-sn',
  },
  {
    label: 'Twitter',
    to: 'https://twitter.com/malick_yacine',
  }
]

</script>

<template>
  <div class="w-full h-px bg-gray-200 dark:bg-gray-800 flex items-center justify-center mt-5">
    <div class="bg-transparent dark:bg-gray-900 px-4">
    </div>
  </div>

  <footer class="relative mx-auto sm:px-6 lg:px-8 py-8 lg:py-4 lg:flex lg:items-center lg:justify-between lg:gap-x-3">
    <ul class="flex flex-col md:flex-row items-center justify-center gap-4 lg:gap-6">
      <li class="relative">
        <p class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          Version {{ version }}&copy;{{ currentYear }} </p>
      </li>
      <li class="relative" v-for="link in links">
        <ULink :to="link.to"
          class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 underline">
          {{ link.label }}
        </ULink>
      </li>
    </ul>
  </footer>
</template>

<style scoped>
footer {
  border-top: 2px solid #fff;
  -o-border-image: linear-gradient(45deg, green 33%, #ff0 67%, red) 5;
  border-image: linear-gradient(45deg, green 33%, #ff0 67%, red) 5;
  /* border-image: linear-gradient(90deg, green 33%, #ff0 34%, #ff0 66%, red 67%) 5; */
}
</style>