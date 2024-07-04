<script setup lang="ts">
const currentYear = new Date().getFullYear();
const version = "04.07.2024";

const links = [
  {
    label: 'À Propos',
    to: '/about/us',
  },
  {
    label: 'Règles de confidentialité',
    to: '/about/privacy',
  },
  {
    label: 'Twitter',
    to: 'https://twitter.com/malick_yacine',
  },
  {
    label: 'Linkedin',
    to: 'https://www.linkedin.com/in/malicktech',
  }
]

</script>

<template>
  <div class="w-full h-px bg-gray-200 dark:bg-gray-800 flex items-center justify-center mt-5">
    <div class="bg-transparent dark:bg-gray-900 px-4">
      <!-- <svg width="264" height="264" viewBox="0 0 264 264" fill="none" xmlns="http://www.w3.org/2000/svg"
        class="w-5 h-5">
        <path
          d="M146.496 211.2H234.822C237.627 211.2 240.383 210.468 242.813 209.078C245.242 207.688 247.259 205.688 248.662 203.279C250.064 200.871 250.801 198.139 250.8 195.359C250.799 192.579 250.059 189.847 248.655 187.44L189.337 85.612C187.935 83.2043 185.918 81.2049 183.489 79.8147C181.06 78.4246 178.305 77.6927 175.5 77.6927C172.695 77.6927 169.94 78.4246 167.511 79.8147C165.082 81.2049 163.065 83.2043 161.663 85.612L146.496 111.666L116.841 60.7179C115.438 58.3104 113.42 56.3113 110.991 54.9214C108.561 53.5315 105.805 52.7998 103 52.7998C100.195 52.7998 97.4386 53.5315 95.0089 54.9214C92.5793 56.3113 90.5615 58.3104 89.1583 60.7179L15.3453 187.44C13.9411 189.847 13.2012 192.579 13.2 195.359C13.1987 198.139 13.9363 200.871 15.3384 203.279C16.7405 205.688 18.7578 207.688 21.1873 209.078C23.6168 210.468 26.3728 211.2 29.1783 211.2H84.6219C106.589 211.2 122.789 201.636 133.937 182.979L161 136.526L175.496 111.666L219 186.34H161L146.496 211.2ZM83.7181 186.314L45.0255 186.306L103.026 86.7466L131.966 136.526L112.589 169.798C105.186 181.904 96.7763 186.314 83.7181 186.314Z"
          fill="currentColor"></path>
      </svg> -->
    </div>
  </div>

  <footer class="relative mx-auto sm:px-6 lg:px-8 py-8 lg:py-4 lg:flex lg:items-center lg:justify-between lg:gap-x-3 
    border-y-1">
    <ul class="flex flex-col md:flex-row items-center justify-center gap-4 lg:gap-6">
      <li class="relative">
        <p class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          Version {{ version }} &copy; {{ currentYear }} </p>
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