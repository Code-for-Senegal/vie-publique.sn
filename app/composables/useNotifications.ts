import type { NotificationState, NotificationPermissionStatus } from '~/types/notification';
import { toast } from 'vue-sonner';

const STORAGE_KEY = 'vp_notifications_consent';
const STORAGE_KEY_ASKED = 'vp_notifications_asked';

export const useNotifications = () => {
  const { $firebase } = useNuxtApp();

  const state = useState<NotificationState>('notifications', () => ({
    permission: 'default' as NotificationPermissionStatus,
    isSubscribed: false,
    token: null,
    loading: false,
    error: null,
  }));

  const isSupported = computed(() => {
    if (typeof window === 'undefined') return false;
    return 'Notification' in window && 'serviceWorker' in navigator;
  });

  const hasBeenAsked = computed(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEY_ASKED) === 'true';
  });

  const hasConsent = computed(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEY) === 'granted';
  });

  const initState = () => {
    if (typeof window === 'undefined' || !isSupported.value) return;

    state.value.permission = Notification.permission as NotificationPermissionStatus;
    state.value.isSubscribed = hasConsent.value && Notification.permission === 'granted';
  };

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported.value) {
      state.value.error = 'Les notifications ne sont pas supportées sur ce navigateur';
      return false;
    }

    state.value.loading = true;
    state.value.error = null;

    try {
      const permission = await Notification.requestPermission();
      state.value.permission = permission as NotificationPermissionStatus;

      localStorage.setItem(STORAGE_KEY_ASKED, 'true');

      if (permission === 'granted') {
        localStorage.setItem(STORAGE_KEY, 'granted');
        return true;
      } else if (permission === 'denied') {
        localStorage.setItem(STORAGE_KEY, 'denied');
        state.value.error = 'Notifications refusées. Vous pouvez les réactiver dans les paramètres du navigateur.';
        return false;
      }

      return false;
    } catch {
      state.value.error = 'Erreur lors de la demande de permission';
      return false;
    } finally {
      state.value.loading = false;
    }
  };

  const subscribe = async (): Promise<boolean> => {
    state.value.loading = true;
    state.value.error = null;

    try {
      const granted = await requestPermission();
      if (!granted) return false;

      const token = await $firebase.getFcmToken();
      if (!token) {
        state.value.error = 'Impossible d\'obtenir le token de notification';
        return false;
      }

      state.value.token = token;

      const response = await $fetch('/api/notifications/subscribe', {
        method: 'POST',
        body: { token, topic: 'news' },
      });

      if (response.success) {
        state.value.isSubscribed = true;
        localStorage.setItem(STORAGE_KEY, 'granted');
        toast.success('Notifications activées', {
          description: 'Vous recevrez les actualités de Vie Publique Sénégal',
        });
        return true;
      } else {
        throw new Error(response.error || 'Erreur lors de l\'abonnement');
      }
    } catch (error) {
      state.value.error = error instanceof Error ? error.message : 'Erreur lors de l\'abonnement';
      toast.error('Erreur', { description: state.value.error });
      return false;
    } finally {
      state.value.loading = false;
    }
  };

  const unsubscribe = async (): Promise<boolean> => {
    if (!state.value.token) {
      state.value.isSubscribed = false;
      localStorage.removeItem(STORAGE_KEY);
      return true;
    }

    state.value.loading = true;
    state.value.error = null;

    try {
      const response = await $fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        body: { token: state.value.token, topic: 'news' },
      });

      if (response.success) {
        state.value.isSubscribed = false;
        state.value.token = null;
        localStorage.removeItem(STORAGE_KEY);
        toast.success('Notifications désactivées');
        return true;
      } else {
        throw new Error(response.error || 'Erreur lors du désabonnement');
      }
    } catch (error) {
      state.value.error = error instanceof Error ? error.message : 'Erreur lors du désabonnement';
      return false;
    } finally {
      state.value.loading = false;
    }
  };

  const autoSubscribe = async (delayMs: number = 5000): Promise<void> => {
    if (typeof window === 'undefined') return;
    if (!isSupported.value) return;
    if (hasBeenAsked.value) return;
    if (Notification.permission !== 'default') return;

    await new Promise((resolve) => setTimeout(resolve, delayMs));

    if (hasBeenAsked.value) return;

    await subscribe();
  };

  const setupForegroundHandler = () => {
    if (typeof window === 'undefined') return;

    $firebase.onForegroundMessage?.((payload: unknown) => {
      const data = payload as {
        notification?: { title?: string; body?: string };
        data?: { url?: string };
      };

      toast.info(data.notification?.title || 'Nouvelle notification', {
        description: data.notification?.body,
        action: data.data?.url
          ? { label: 'Voir', onClick: () => navigateTo(data.data?.url) }
          : undefined,
      });
    });
  };

  return {
    state: readonly(state),
    isSupported,
    hasBeenAsked,
    hasConsent,
    initState,
    requestPermission,
    subscribe,
    unsubscribe,
    autoSubscribe,
    setupForegroundHandler,
  };
};
