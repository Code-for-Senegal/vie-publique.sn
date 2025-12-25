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

// Computed pour détecter l'onglet actif (supporte les sous-routes)
const activeTabName = computed(() => {
  const path = route.path
  // Cas spécial pour l'accueil (match exact uniquement)
  if (path === '/') return 'accueil'
  // Pour les autres, vérifier si le path commence par la route du tab
  const match = tabs.find(tab => tab.to !== '/' && path.startsWith(tab.to))
  return match?.name || ''
})

const isActiveTab = (tab: Tab) => tab.name === activeTabName.value
</script>

<template>
  <nav
    aria-label="Navigation principale"
    class="fixed bottom-0 left-0 right-0 z-50 border-t bg-white shadow-lg lg:hidden dark:bg-gray-900 safe-area-bottom"
  >
    <div class="flex items-center justify-around px-2 py-3">
      <UButton
        v-for="tab in tabs"
        :key="tab.name"
        :icon="tab.icon"
        color="gray"
        size="xs"
        variant="ghost"
        class="flex flex-col items-center justify-center transition-colors"
        :class="{
          'bg-green-100 text-gray-900 dark:bg-slate-900': isActiveTab(tab),
          'text-gray-500 hover:text-gray-700': !isActiveTab(tab),
        }"
        :to="tab.to"
        :label="tab.label"
        :aria-current="isActiveTab(tab) ? 'page' : undefined"
      />
    </div>
  </nav>
</template>

<style scoped>
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0);
}
</style>
