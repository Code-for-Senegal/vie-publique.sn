export const useNewsletter = () => {
  const email = ref('');
  const message = ref('');
  const isLoading = ref(false);
  const formSubmitted = ref(false);
  const alertType = ref<'success' | 'error' | 'info'>('success');

  const isValidEmail = computed(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.value);
  });

  const subscribe = async () => {
    if (!isValidEmail.value) {
      message.value = 'Veuillez entrer une adresse e-mail valide.';
      alertType.value = 'error';
      formSubmitted.value = true;
      return;
    }

    isLoading.value = true;
    try {
      const data = await $fetch<{ success: boolean; message?: string; error?: string }>(
        '/api/brevo',
        {
          method: 'POST',
          body: { email: email.value },
        },
      );

      if (data?.success) {
        message.value = data.message ?? 'Inscription réussie ! Un email de bienvenue vous a été envoyé.';
        alertType.value = 'success';
        formSubmitted.value = true;
      } else {
        throw new Error(data?.error ?? 'Une erreur est survenue');
      }
    } catch (error: any) {
      const statusCode = error?.statusCode ?? error?.response?.status;
      if (statusCode === 409) {
        message.value = 'Cette adresse email est déjà inscrite à notre newsletter.';
        alertType.value = 'info';
      } else {
        console.error("Erreur lors de l'inscription:", error);
        message.value = 'Une erreur est survenue. Veuillez réessayer.';
        alertType.value = 'error';
      }
      formSubmitted.value = true;
    } finally {
      isLoading.value = false;
    }
  };

  const reset = () => {
    email.value = '';
    message.value = '';
    isLoading.value = false;
    formSubmitted.value = false;
    alertType.value = 'success';
  };

  return {
    email,
    message,
    isLoading,
    formSubmitted,
    alertType,
    isValidEmail,
    subscribe,
    reset,
  };
};
