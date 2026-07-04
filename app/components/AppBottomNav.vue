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

/* ── Glass container (Liquid Glass optique) ── */
.glass-nav {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  /* dark : le verre laisse vivre les couleurs derrière, teinte très légère */
  background: rgba(15, 23, 42, 0.13);
  backdrop-filter: blur(33px) saturate(200%) contrast(110%) brightness(105%);
  -webkit-backdrop-filter: blur(33px) saturate(200%) contrast(110%) brightness(105%);
  border: 1px solid rgba(255, 255, 255, 0.09);
  /* ombre externe très diffuse — profondeur, pas de halo/glow blanc */
  box-shadow:
    0 8px 30px rgba(0, 0, 0, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

/* reflet optique supérieur */
.glass-nav::before {
  content: '';
  position: absolute;
  inset: 1px;
  border-radius: inherit;
  pointer-events: none;
  z-index: -1;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.28),
    rgba(255, 255, 255, 0.05) 35%,
    transparent 70%
  );
  opacity: 0.28;
}

/* profondeur — dégradé radial très léger, ne blanchit pas l'ensemble */
.glass-nav::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  z-index: -1;
  background: radial-gradient(
    120% 100% at 50% 0%,
    rgba(255, 255, 255, 0.06),
    transparent 60%
  );
}

:root:not(.dark) .glass-nav {
  /* opacité réduite ~40% : le verre disparaît presque sur fond clair (cf. Apple Podcasts) */
  background: rgba(255, 255, 255, 0.065);
  backdrop-filter: blur(33px) saturate(205%) contrast(108%) brightness(106%);
  -webkit-backdrop-filter: blur(33px) saturate(205%) contrast(108%) brightness(106%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow:
    0 8px 30px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.28);
}

/* reflet supérieur discret en light */
:root:not(.dark) .glass-nav::before {
  opacity: 0.5;
}

/* ── Nav items (dark mode - blanc pur) ── */
.nav-item {
  min-width: 52px;
  color: #ffffff;
  -webkit-tap-highlight-color: transparent;
  text-decoration: none;
  /* transition douce du matériau vivant (couleur icône + texte) */
  transition:
    color 250ms ease,
    transform 250ms ease;
}

.nav-item:hover {
  color: #ffffff;
}

/* actif dark : accent clair (meilleure lisibilité sur verre sombre) */
.nav-item.is-active {
  color: #8ab4f8;
}

/* ── Active pill : toujours du verre, seulement plus dense (jamais bleu/opaque) ── */
.active-pill {
  border-radius: 9999px;
  /* verre translucide, densité légèrement supérieure au conteneur */
  background: rgba(255, 255, 255, 0.09);
  backdrop-filter: blur(18px) saturate(180%);
  -webkit-backdrop-filter: blur(18px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  /* léger reflet supérieur interne */
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.14),
    inset 0 -1px 0 rgba(255, 255, 255, 0.04);
  animation: pill-in 250ms ease;
}

:root:not(.dark) .active-pill {
  background: rgba(255, 255, 255, 0.22);
  backdrop-filter: blur(18px) saturate(180%);
  -webkit-backdrop-filter: blur(18px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.45);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.5),
    inset 0 -1px 0 rgba(255, 255, 255, 0.12);
}

/* apparition douce du matériau (opacité + translation) */
@keyframes pill-in {
  from {
    opacity: 0;
    transform: translateY(2px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ── Light mode text (noir pur) ── */
:root:not(.dark) .nav-item {
  color: #000000;
}

:root:not(.dark) .nav-item:hover {
  color: #000000;
}

/* actif light : accent Vie Publique */
:root:not(.dark) .nav-item.is-active {
  color: #0c2146;
}
</style>
