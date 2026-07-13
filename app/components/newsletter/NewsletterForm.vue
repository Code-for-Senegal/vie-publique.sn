<template>
  <div>
    <div class="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-12">
      <!-- Success -->
      <div
        v-if="formSubmitted && alertType === 'success'"
        class="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400"
      >
        <Icon name="ph:check-circle-fill" class="h-5 w-5" />
        {{ message }}
      </div>

      <!-- Info (déjà inscrit) -->
      <div
        v-else-if="formSubmitted && alertType === 'info'"
        class="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400"
      >
        <Icon name="ph:info-fill" class="h-5 w-5" />
        {{ message }}
      </div>

      <!-- Form -->
      <form v-else class="flex w-full items-center gap-2" @submit.prevent="subscribe">
        <div class="relative flex-1">
          <input
            v-model="email"
            type="email"
            name="email"
            autocomplete="email"
            aria-label="Votre adresse email"
            required
            placeholder="Votre adresse email"
            :disabled="isLoading"
            class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-light text-gray-900 placeholder-gray-500 transition-colors focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300/30 dark:border-dark-500 dark:bg-dark-700 dark:text-dark-50 dark:placeholder-dark-300 dark:focus:border-dark-400 dark:focus:ring-dark-400/30"
          />
        </div>
        <button
          type="submit"
          :disabled="isLoading || !isValidEmail"
          class="shrink-0 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors active:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300 disabled:text-white/80 dark:bg-blue-500 dark:active:bg-blue-400 dark:disabled:bg-blue-800 dark:disabled:text-blue-200 md:hover:bg-blue-700 dark:md:hover:bg-blue-400"
        >
          <Icon v-if="isLoading" name="ph:circle-notch" class="h-4 w-4 animate-spin" />
          <span v-else>S'abonner</span>
        </button>
      </form>
    </div>
    <p
      v-if="formSubmitted && alertType === 'error'"
      class="mt-2 text-center text-xs text-red-500 dark:text-red-400"
    >
      {{ message }}
    </p>
  </div>
</template>

<script lang="ts" setup>
const { email, message, isLoading, formSubmitted, alertType, isValidEmail, subscribe } =
  useNewsletter();
</script>
