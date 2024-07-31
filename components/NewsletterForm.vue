<template>
  <div class="newsletter-form mx-auto max-w-md">
    <form @submit.prevent="submitForm" v-if="!formSubmitted" class="space-y-4">
      <UFormGroup label="Adresse e-mail" name="email" class="w-full">
        <UInput v-model="email" type="email" name="email" autocomplete="email" required
          placeholder="votremail@exemple.com" :disabled="isLoading" class="w-full" />
      </UFormGroup>
      <UButton type="submit" :loading="isLoading" :disabled="!isValidEmail" color="primary" class="w-full">
        {{ isLoading ? 'Envoi en cours...' : 'S\'abonner à la newsletter' }}
      </UButton>
    </form>
    <UAlert v-if="formSubmitted" :type="isError ? 'danger' : 'success'" :title="isError ? 'Erreur' : 'Succès'"
      :description="message" class="mt-4" icon />
    <p v-if="!formSubmitted" class="text-sm text-gray-500 mt-2">
      En vous abonnant, vous acceptez de recevoir nos newsletters. Vous pourrez vous désabonner à tout moment.
    </p>
  </div>
</template>

<script lang="ts" setup>

const email = ref('')
const message = ref('')
const isLoading = ref(false)
const formSubmitted = ref(false)
const isError = ref(false)

const isValidEmail = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.value)
})

const submitForm = async () => {
  if (!isValidEmail.value) {
    message.value = "Veuillez entrer une adresse e-mail valide."
    isError.value = true
    formSubmitted.value = true
    return
  }

  isLoading.value = true
  try {
    const { data } = await useFetch('/api/brevo', {
      method: 'POST',
      body: { email: email.value }
    })

    if (data.value?.success) {
      message.value = 'Inscription réussie ! Merci de vous être abonné à notre newsletter.'
      formSubmitted.value = true
      isError.value = false
    } else {
      throw new Error(data.value?.error || 'Une erreur est survenue')
    }
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error)
    message.value = 'Une erreur est survenue. Veuillez réessayer.'
    formSubmitted.value = true
    isError.value = true
  } finally {
    isLoading.value = false
  }
}
</script>