<script setup lang="ts">
interface Tab {
  label: string
  name: string
  icon: string
  to: string
}

const route = useRoute()

const tabs: Tab[] = [
  { label: 'Accueil', name: 'accueil', icon: 'i-heroicons-home', to: '/' },
  { label: 'Actualités', name: 'actualites', icon: 'i-heroicons-newspaper', to: '/actualites' },
  { label: 'Documents', name: 'documents', icon: 'i-heroicons-rectangle-stack', to: '/documents' },
  { label: 'Assemblée', name: 'assemblee', icon: 'i-heroicons-building-library', to: '/assemblee-nationale' },
  { label: 'Menu', name: 'voirplus', icon: 'i-heroicons-squares-plus', to: '/menu' },
]

const activeTabName = computed(() => {
  const path = route.path
  if (path === '/') return 'accueil'
  const match = tabs.find(tab => tab.to !== '/' && path.startsWith(tab.to))
  return match?.name || ''
})

const isActiveTab = (tab: Tab) => tab.name === activeTabName.value
</script>

<template>
  <nav
    aria-label="Navigation principale"
    class="fixed bottom-0 left-0 right-0 z-50 lg:hidden safe-area-bottom"
  >
    <div class="px-3 pb-4">
      <div class="glass-nav mx-auto flex max-w-md items-center justify-around rounded-full px-1 py-1.5">
        <NuxtLink
          v-for="tab in tabs"
          :key="tab.name"
          :to="tab.to"
          class="nav-item relative flex flex-col items-center gap-0.5 px-5 py-2 transition-all duration-300 ease-out"
          :class="{ 'is-active': isActiveTab(tab) }"
          :aria-current="isActiveTab(tab) ? 'page' : undefined"
        >
          <!-- Active pill background behind icon+label -->
          <span
            v-if="isActiveTab(tab)"
            class="active-pill absolute inset-0"
          />
          <UIcon
            :name="tab.icon"
            class="relative z-10 h-5 w-5 shrink-0"
          />
          <span class="relative z-10 text-[10px] font-medium leading-none tracking-wide">
            {{ tab.label }}
          </span>
        </NuxtLink>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0);
}

/* ── Glass container ── */
.glass-nav {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px) saturate(150%);
  -webkit-backdrop-filter: blur(12px) saturate(150%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    inset 0 -1px 0 rgba(255, 255, 255, 0.03);
}

:root:not(.dark) .glass-nav {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px) saturate(150%);
  -webkit-backdrop-filter: blur(12px) saturate(150%);
  border: 1px solid rgba(255, 255, 255, 0.45);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.5),
    inset 0 -1px 0 rgba(255, 255, 255, 0.15);
}

/* ── Nav items ── */
.nav-item {
  min-width: 52px;
  color: rgba(255, 255, 255, 0.5);
  -webkit-tap-highlight-color: transparent;
  text-decoration: none;
}

.nav-item:hover {
  color: rgba(255, 255, 255, 0.75);
}

.nav-item.is-active {
  color: rgba(255, 255, 255, 0.95);
}

/* ── Active pill (capsule) ── */
.active-pill {
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 0 0 0.5px rgba(255, 255, 255, 0.08);
}

:root:not(.dark) .active-pill {
  background: rgba(0, 0, 0, 0.07);
  box-shadow: inset 0 0 0 0.5px rgba(0, 0, 0, 0.05);
}

/* ── Light mode text ── */
:root:not(.dark) .nav-item {
  color: rgba(0, 0, 0, 0.4);
}

:root:not(.dark) .nav-item:hover {
  color: rgba(0, 0, 0, 0.65);
}

:root:not(.dark) .nav-item.is-active {
  color: rgba(0, 0, 0, 0.85);
}
</style>
