import type { NotificationState, NotificationPermissionStatus } from '~/types/notification';
import { toast } from 'vue-sonner';

const STORAGE_KEY = 'vp_notifications_consent';
const STORAGE_KEY_ASKED = 'vp_notifications_asked';
const STORAGE_KEY_TOKEN = 'vp_notifications_token';

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

  /**
   * Check if running as installed PWA (standalone mode)
   */
  const isStandalonePWA = computed(() => {
    if (typeof window === 'undefined') return false;
    // iOS Safari standalone
    const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    // Standard display-mode media query (works on Android & iOS 16.4+)
    const displayModeStandalone = window.matchMedia('(display-mode: standalone)').matches;
    // Fallback for fullscreen PWA
    const displayModeFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;

    return iosStandalone || displayModeStandalone || displayModeFullscreen;
  });

  /**
   * Check if iOS device
   */
  const isIOS = computed(() => {
    if (typeof window === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  });

  /**
   * Check if iOS Safari browser (NOT installed PWA)
   * No Web Push support in Safari browser, only in standalone PWA (iOS 16.4+)
   */
  const isIOSSafari = computed(() => {
    if (typeof window === 'undefined') return false;
    // iOS but NOT running as standalone PWA
    return isIOS.value && !isStandalonePWA.value;
  });

  const hasBeenAsked = computed(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEY_ASKED) === 'true';
  });

  const hasConsent = computed(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEY) === 'granted';
  });

  /**
   * Validate and refresh token if needed
   * Called on init to ensure token is still valid
   */
  const validateAndRefreshToken = async (): Promise<void> => {
    if (!state.value.isSubscribed) return;
    if (!hasConsent.value) return;
    if (Notification.permission !== 'granted') return;

    try {
      const currentToken = await $firebase.getFcmToken();
      if (!currentToken) return;

      const savedToken = localStorage.getItem(STORAGE_KEY_TOKEN);

      // Token changed - re-subscribe with new token
      if (currentToken !== savedToken) {
        console.log('[Notifications] Token changed, re-subscribing...');

        // Unsubscribe old token if exists
        if (savedToken) {
          try {
            await $fetch('/api/notifications/unsubscribe', {
              method: 'POST',
              body: { token: savedToken, topic: 'news' },
            });
          } catch {
            // Ignore error - old token might already be invalid
          }
        }

        // Subscribe with new token
        const response = await $fetch('/api/notifications/subscribe', {
          method: 'POST',
          body: { token: currentToken, topic: 'news' },
        });

        if (response.success) {
          state.value.token = currentToken;
          localStorage.setItem(STORAGE_KEY_TOKEN, currentToken);
          console.log('[Notifications] Re-subscribed with new token');
        }
      } else {
        state.value.token = currentToken;
      }
    } catch (error) {
      console.error('[Notifications] Token validation failed:', error);
    }
  };

  const initState = () => {
    if (typeof window === 'undefined' || !isSupported.value) return;

    const browserPermission = Notification.permission as NotificationPermissionStatus;
    state.value.permission = browserPermission;

    // Sync localStorage with actual browser permission
    syncPermissionState(browserPermission);

    state.value.isSubscribed = hasConsent.value && browserPermission === 'granted';

    // Restore token from localStorage
    const savedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
    if (savedToken && state.value.isSubscribed) {
      state.value.token = savedToken;
    }

    // Validate and refresh token in background (don't block init)
    if (state.value.isSubscribed) {
      validateAndRefreshToken();
    }

    // Case: User granted permission but lost token/consent (localStorage cleared)
    // Re-subscribe silently since they already gave permission
    if (browserPermission === 'granted' && !hasConsent.value) {
      recoverSubscription();
    }
  };

  /**
   * Sync localStorage state with actual browser permission
   * Handles case where user manually revoked permission in browser settings
   */
  const syncPermissionState = (browserPermission: NotificationPermissionStatus): void => {
    const storedConsent = localStorage.getItem(STORAGE_KEY);

    // User manually denied in browser but localStorage says granted
    if (browserPermission === 'denied' && storedConsent === 'granted') {
      console.log('[Notifications] Permission revoked in browser, cleaning up...');
      localStorage.setItem(STORAGE_KEY, 'denied');
      localStorage.setItem(STORAGE_KEY_ASKED, 'true');
      // Don't remove token - might need it for cleanup on server
    }
  };

  /**
   * Recover subscription when user has granted permission but lost localStorage
   * This happens when user clears browser data but permission persists
   */
  const recoverSubscription = async (): Promise<void> => {
    if (isIOSSafari.value) return;

    console.log('[Notifications] Recovering subscription (permission granted but no local data)...');

    try {
      const token = await $firebase.getFcmToken();
      if (!token) {
        console.error('[Notifications] Could not get token for recovery');
        return;
      }

      const response = await $fetch('/api/notifications/subscribe', {
        method: 'POST',
        body: { token, topic: 'news' },
      });

      if (response.success) {
        state.value.token = token;
        state.value.isSubscribed = true;
        localStorage.setItem(STORAGE_KEY, 'granted');
        localStorage.setItem(STORAGE_KEY_ASKED, 'true');
        localStorage.setItem(STORAGE_KEY_TOKEN, token);
        console.log('[Notifications] Subscription recovered successfully');
      }
    } catch (error) {
      console.error('[Notifications] Recovery failed:', error);
    }
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
        localStorage.setItem(STORAGE_KEY_TOKEN, token);
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
    // Try to get token from state or localStorage
    const token = state.value.token || localStorage.getItem(STORAGE_KEY_TOKEN);

    if (!token) {
      state.value.isSubscribed = false;
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_KEY_TOKEN);
      return true;
    }

    state.value.loading = true;
    state.value.error = null;

    try {
      const response = await $fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        body: { token, topic: 'news' },
      });

      if (response.success) {
        state.value.isSubscribed = false;
        state.value.token = null;
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_KEY_TOKEN);
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

  /**
   * Mark that user has been asked about notifications (declined the consent modal)
   */
  const markAsAsked = (): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY_ASKED, 'true');
    localStorage.setItem(STORAGE_KEY, 'denied');
  };

  /**
   * Check if consent modal should be shown
   */
  const shouldShowConsentModal = computed(() => {
    if (typeof window === 'undefined') return false;
    if (!isSupported.value) return false;
    if (isIOSSafari.value) return false; // No Web Push on iOS Safari
    if (hasBeenAsked.value) return false;
    if (Notification.permission !== 'default') return false;
    return true;
  });

  const setupForegroundHandler = () => {
    if (typeof window === 'undefined') return;

    $firebase.onForegroundMessage?.((payload: unknown) => {
      // Type guard for FCM payload
      const isValidPayload = (p: unknown): p is {
        notification?: { title?: string; body?: string };
        data?: { url?: string };
      } => {
        return typeof p === 'object' && p !== null;
      };

      if (!isValidPayload(payload)) return;

      const title = payload.notification?.title || 'Nouvelle notification';
      const body = payload.notification?.body;
      const url = payload.data?.url;

      toast.info(title, {
        description: body,
        action: url
          ? { label: 'Voir', onClick: () => navigateTo(url) }
          : undefined,
      });
    });
  };

  return {
    state: readonly(state),
    isSupported,
    isIOS,
    isIOSSafari,
    isStandalonePWA,
    hasBeenAsked,
    hasConsent,
    shouldShowConsentModal,
    initState,
    requestPermission,
    subscribe,
    unsubscribe,
    markAsAsked,
    setupForegroundHandler,
    validateAndRefreshToken,
  };
};
