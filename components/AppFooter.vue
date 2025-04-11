<script setup lang="ts">
const currentYear = new Date().getFullYear();
const version = "0711";

const linksSocial = [
  {
    label: "Linkedin",
    to: "https://www.linkedin.com/company/vie-publique-sn",
    icon: "i-simple-icons-linkedin", // Exemple d'icône, peut être ajusté selon votre bibliothèque d'icônes
  },
  {
    label: "Twitter",
    to: "https://twitter.com/ViePubliqueSN",
    icon: "i-simple-icons-x",
  },
  {
    label: "Facebook",
    to: "https://www.facebook.com/ViePubliqueSenegal",
    icon: "i-simple-icons-facebook",
  },
];
const links = [
  {
    label: "À Propos",
    to: "/a-propos/qui-sommes-nous",
  },
  {
    label: "Contact",
    to: "/contact",
  },
  {
    label: "Newsletter",
    to: "/newsletter",
  },
  {
    label: "Règles de confidentialité",
    to: "/about/privacy",
  },
  {
    label: "Recrutement",
    to: "/a-propos/recrutement",
  },
  {
    label: "Partenariat",
    to: "/a-propos/travailler-avec-nous",
  },
];
</script>

<template>
  <div class="mt-5 h-px w-full bg-gray-200 dark:bg-gray-800"></div>

  <footer class="relative mx-auto hidden py-8 sm:px-6 md:block lg:px-8 lg:py-4">
    <!-- Social Links Row -->
    <div class="flex items-center justify-center gap-6 pb-4">
      <ULink
        v-for="social in linksSocial"
        :key="social.label"
        :to="social.to"
        class="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
        target="_blank"
        aria-label="social.label"
      >
        <UIcon :name="social.icon" class="h-8 w-8" />
      </ULink>
    </div>

    <!-- Footer Links Row -->
    <div
      class="flex flex-col items-center justify-center gap-4 md:flex-row lg:gap-6"
    >
      <ul class="flex flex-col items-center gap-4 md:flex-row lg:gap-6">
        <li v-for="link in links" :key="link.label">
          <ULink
            :to="link.to"
            class="text-sm text-gray-500 underline hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
          >
            {{ link.label }}
          </ULink>
        </li>
      </ul>
    </div>
    <div
      class="flex flex-col items-center py-4 text-sm text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
    >
      Version {{ version }} &copy; {{ currentYear }}
    </div>
  </footer>
</template>

<style scoped>
footer {
  border-top: 2px solid #fff;
  border-image: linear-gradient(45deg, green 33%, #ff0 67%, red) 5;
}
</style>
