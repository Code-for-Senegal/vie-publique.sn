<template>
  <UModal v-model="isOpen">
    <UCard>
      <template #header>
        <h3 class="text-lg font-bold">Abonnez-vous à notre newsletter</h3>
      </template>
      <NewsletterForm @success="handleSuccess" />
    </UCard>
  </UModal>
</template>

<script lang="ts" setup>

const isOpen = ref(false)

const open = () => {
  isOpen.value = true
}

const close = () => {
  isOpen.value = false
}

const handleSuccess = () => {
  // Fermer le modal après un court délai pour que l'utilisateur puisse voir le message de succès
  setTimeout(() => {
    close()
  }, 2000)
}

defineExpose({ open, close })
</script>