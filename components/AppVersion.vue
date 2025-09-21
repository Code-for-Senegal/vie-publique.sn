<template>
  <div class="app-version">
    <!-- Version desktop -->
    <span 
      v-if="!mobile"
      class="hidden sm:inline text-xs text-gray-500 dark:text-gray-400"
      :title="`Build: ${buildTime ? new Date(buildTime).toLocaleString('fr-FR') : 'N/A'} | Commit: ${gitCommit}`"
    >
      {{ fullVersion }}
    </span>
    
    <!-- Version mobile -->
    <span 
      v-else
      class="sm:hidden text-xs text-gray-500 dark:text-gray-400"
      :title="`Version ${version}`"
    >
      {{ shortVersion }}
    </span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  mobile?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  mobile: false
})

const { 
  version, 
  buildTime, 
  gitCommit, 
  fullVersion, 
  shortVersion 
} = useAppVersion()
</script>

<style scoped>
.app-version {
  font-family: 'Courier New', monospace;
  user-select: none;
}
</style>