<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 sm:gap-12">
      <!-- Success -->
      <div
        v-if="formSubmitted && alertType === 'success'"
        class="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-medium"
      >
        <Icon name="ph:check-circle-fill" class="w-5 h-5" />
        {{ message }}
      </div>

      <!-- Info (déjà inscrit) -->
      <div
        v-else-if="formSubmitted && alertType === 'info'"
        class="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-medium"
      >
        <Icon name="ph:info-fill" class="w-5 h-5" />
        {{ message }}
      </div>

      <!-- Form -->
      <form
        v-else
        class="flex items-center gap-2 w-full"
        @submit.prevent="subscribe"
      >
        <div class="relative flex-1">
          <input
            v-model="email"
            type="email"
            required
            placeholder="Votre adresse email"
            :disabled="isLoading"
            class="w-full px-4 py-2.5 text-sm bg-white dark:bg-dark-700 border border-gray-300 dark:border-dark-500 rounded-lg font-light text-gray-900 dark:text-dark-50 placeholder-gray-500 dark:placeholder-dark-300 focus:outline-none focus:ring-2 focus:ring-gray-300/30 dark:focus:ring-dark-400/30 focus:border-gray-500 dark:focus:border-dark-400 transition-colors"
          />
        </div>
        <button
          type="submit"
          :disabled="isLoading || !isValidEmail"
          class="shrink-0 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg md:hover:bg-blue-700 dark:md:hover:bg-blue-400 active:bg-blue-700 dark:active:bg-blue-400 transition-colors disabled:cursor-not-allowed disabled:bg-blue-300 disabled:text-white/80 dark:disabled:bg-blue-800 dark:disabled:text-blue-200"
        >
          <Icon
            v-if="isLoading"
            name="ph:circle-notch"
            class="w-4 h-4 animate-spin"
          />
          <span v-else>S'abonner</span>
        </button>
      </form>
    </div>
    <p
      v-if="formSubmitted && alertType === 'error'"
      class="text-xs text-red-500 dark:text-red-400 mt-2 text-center"
    >
      {{ message }}
    </p>
  </div>
</template>

<script lang="ts" setup>
const { email, message, isLoading, formSubmitted, alertType, isValidEmail, subscribe } =
  useNewsletter();
</script>
