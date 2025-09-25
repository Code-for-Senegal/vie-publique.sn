<template>
  <nav class="hidden flex-1 items-center justify-end lg:flex">
    <ul class="flex items-center gap-x-1">
      <li v-for="link in links" :key="link.to">
        <NuxtLink
          :to="link.to"
          class="group flex items-center gap-x-1 rounded-lg px-3 py-2 transition-all duration-200"
          :class="[
            isActive(link.to)
              ? 'text-white'
              : 'text-white/85 hover:bg-white/10 hover:text-white',
          ]"
        >
          <UIcon
            v-if="link.icon"
            :name="link.icon"
            class="h-4 w-4 flex-shrink-0"
            :class="[
              isActive(link.to)
                ? 'text-white'
                : 'text-white/85 group-hover:text-white',
            ]"
          />
          <span class="nav-link-text">{{ link.label }}</span>

          <!-- Indicateur actif sous forme de ligne -->
          <span
            v-if="isActive(link.to)"
            class="absolute bottom-0 left-1/2 h-0.5 w-3/4 -translate-x-1/2 transform rounded-full bg-white"
          />
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
interface NavLink {
  label: string;
  icon?: string;
  to: string;
  description?: string;
}

defineProps<{
  links: NavLink[];
}>();

const route = useRoute();

const isActive = (path: string) => {
  if (path === "/") {
    return route.path === "/";
  }
  return route.path.startsWith(path);
};
</script>

<style scoped>
/* Typographie optimisée pour le menu */
.nav-link-text {
  font-family:
    "Quicksand",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  text-transform: capitalize;
}

/* Animation pour le hover */
nav a {
  position: relative;
  overflow: hidden;
}

/* Effet de survol avec underline animé */
nav a::after {
  content: "";
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, white, transparent);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

nav a:hover::after {
  width: 80%;
}

/* Désactiver l'animation pour le lien actif */
nav a.router-link-active::after,
nav a.router-link-exact-active::after {
  display: none;
}

/* Optimisation mobile */
@media (max-width: 1024px) {
  .nav-link-text {
    font-size: 0.875rem;
  }
}
</style>
