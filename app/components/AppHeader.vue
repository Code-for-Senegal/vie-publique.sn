<template>
  <header class="header_top sticky top-0 z-50 w-full">
    <div class="sm:container-page flex items-center justify-between px-4 py-0">
      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center">
        <img
          src="~/assets/logos/vie-publique-logo-4.svg"
          loading="lazy"
          fetchpriority="high"
          alt="Logo Vie-Publique"
          class="h-auto w-40 lg:w-48"
        />
      </NuxtLink>

      <!-- Desktop Navigation -->
      <nav class="hidden flex-1 items-center justify-end lg:flex">
        <ul class="flex items-center gap-x-1">
          <li v-for="link in links" :key="link.to">
            <NuxtLink
              :to="link.to"
              class="group relative flex items-center gap-x-2 rounded-lg px-3 py-2 transition-all duration-200"
              :class="[
                isActive(link.to)
                  ? 'text-white'
                  : 'text-white/85 hover:bg-white/10 hover:text-white',
              ]"
            >
              <span class="nav-link-text">{{ link.label }}</span>

              <!-- Active indicator -->
              <span
                v-if="isActive(link.to)"
                class="absolute bottom-0 left-1/2 h-0.5 w-3/4 -translate-x-1/2 transform rounded-full bg-white"
              />
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <!-- Theme Toggle -->
      <ThemeToggle />
    </div>
  </header>
</template>

<script setup lang="ts">
interface NavLink {
  label: string;
  to: string;
}

const props = defineProps<{
  links: NavLink[];
}>();

const route = useRoute();

const isActive = (path: string) => {
  if (path === '/') {
    return route.path === '/';
  }
  return route.path.startsWith(path);
};
</script>

<style scoped>
/* Header background */
.header_top {
  background: linear-gradient(90deg, #0000d3 0%, #010272);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
}

/* Container with proper padding */
.container-page {
  margin: 0 auto;
  padding-left: 2.5rem;
  padding-right: 2.5rem;
}

@media (min-width: 768px) {
  .container-page {
    padding-left: 3.5rem;
    padding-right: 3.5rem;
  }
}

@media (min-width: 1024px) {
  .container-page {
    padding-left: 4.5rem;
    padding-right: 4.5rem;
  }
}

@media (min-width: 1280px) {
  .container-page {
    padding-left: 8rem;
    padding-right: 8rem;
  }
}

/* Typography for navigation */
.nav-link-text {
  font-family:
    'Quicksand',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  text-transform: capitalize;
}

/* Hover animation */
nav a {
  position: relative;
  overflow: hidden;
}

nav a::after {
  content: '';
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

/* Disable animation for active link */
nav a.router-link-active::after,
nav a.router-link-exact-active::after {
  display: none;
}

/* Mobile optimization */
@media (max-width: 1024px) {
  .nav-link-text {
    font-size: 0.875rem;
  }
}
</style>
