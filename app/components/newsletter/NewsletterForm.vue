<template>
  <div class="newsletter-form mx-auto max-w-lg">
    <form v-if="!formSubmitted" class="space-y-4" @submit.prevent="subscribe">
      <UFormGroup label="Adresse e-mail" name="email" class="w-full">
        <UInput
          v-model="email"
          type="email"
          name="email"
          autocomplete="email"
          required
          placeholder="contact@vie-publique.sn"
          :disabled="isLoading"
          class="w-full"
        />
      </UFormGroup>
      <UButton
        type="submit"
        :loading="isLoading"
        :disabled="!isValidEmail"
        color="primary"
        class="w-full"
      >
        {{ isLoading ? "Envoi en cours..." : "S'abonner à la newsletter" }}
      </UButton>
    </form>

    <!-- Alert dark-mode card -->
    <div
      v-if="formSubmitted"
      class="mt-4 flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700/50"
    >
      <UIcon
        :name="alertIcon"
        class="mt-0.5 h-5 w-5 shrink-0"
        :class="alertIconClass"
      />
      <div>
        <p class="font-medium text-gray-900 dark:text-white">{{ alertTitle }}</p>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ message }}</p>
      </div>
    </div>

    <p v-if="!formSubmitted" class="mt-2 text-sm text-gray-500 dark:text-gray-400">
      En vous abonnant, vous acceptez de recevoir nos newsletters. Vous pourrez
      vous désabonner à tout moment.
    </p>
  </div>
</template>

<script lang="ts" setup>
const { email, message, isLoading, formSubmitted, alertType, isValidEmail, subscribe } =
  useNewsletter();

const alertTitle = computed(() => {
  if (alertType.value === 'success') return 'Inscription réussie';
  if (alertType.value === 'info') return 'Déjà inscrit';
  return 'Erreur';
});

const alertIcon = computed(() => {
  if (alertType.value === 'success') return 'i-heroicons-check-circle';
  if (alertType.value === 'info') return 'i-heroicons-information-circle';
  return 'i-heroicons-exclamation-circle';
});

const alertIconClass = computed(() => {
  if (alertType.value === 'success') return 'text-green-500 dark:text-green-400';
  if (alertType.value === 'info') return 'text-blue-500 dark:text-blue-400';
  return 'text-red-500 dark:text-red-400';
});
</script>
