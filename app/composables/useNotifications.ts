import type { NotificationState, NotificationPermissionStatus } from '~/types/notification';
import { toast } from 'vue-sonner';

const STORAGE_KEY = 'vp_notifications_consent';
const STORAGE_KEY_ASKED = 'vp_notifications_asked';
const STORAGE_KEY_TOKEN = 'vp_notifications_token';
const PENDING_SUBSCRIBE_KEY = 'vp_notifications_pending_subscribe';

// TODO: remettre isDev après debug Android
const log = (...args: unknown[]) => {
  console.log('[Notifications]', ...args);
};

export const useNotifications = () => {
  const { $firebase } = useNuxtApp();

  const state = useState<NotificationState>('notifications', () => ({
    permission: 'default' as NotificationPermissionStatus,
    isSubscribed: false,
    token: null,
    loading: false,
    error: null,
  }));

  // Reactive refs backed by localStorage (P6 fix)
  const _hasBeenAsked = ref(false);
  const _hasConsent = ref(false);

  const syncFromStorage = () => {
    if (typeof window === 'undefined') return;
    _hasBeenAsked.value = localStorage.getItem(STORAGE_KEY_ASKED) === 'true';
    _hasConsent.value = localStorage.getItem(STORAGE_KEY) === 'granted';
  };

  const setAsked = (value: boolean) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY_ASKED, value ? 'true' : 'false');
    _hasBeenAsked.value = value;
  };

  const setConsent = (value: 'granted' | 'denied') => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, value);
    _hasConsent.value = value === 'granted';
  };

  const removeConsent = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
    _hasConsent.value = false;
  };

  const setToken = (token: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY_TOKEN, token);
    state.value.token = token;
  };

  const removeToken = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    state.value.token = null;
  };

  const isSupported = computed(() => {
    if (typeof window === 'undefined') return false;
    return 'Notification' in window && 'serviceWorker' in navigator;
  });

  const isStandalonePWA = computed(() => {
    if (typeof window === 'undefined') return false;
    const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    const displayModeStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const displayModeFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
    return iosStandalone || displayModeStandalone || displayModeFullscreen;
  });

  const isIOS = computed(() => {
    if (typeof window === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  });

  const isIOSSafari = computed(() => {
    if (typeof window === 'undefined') return false;
    return isIOS.value && !isStandalonePWA.value;
  });

  const hasBeenAsked = computed(() => _hasBeenAsked.value);
  const hasConsent = computed(() => _hasConsent.value);

  /**
   * Retry a pending subscribe that failed due to network error (P9 fix)
   */
  const retryPendingSubscribe = async (): Promise<void> => {
    const pending = localStorage.getItem(PENDING_SUBSCRIBE_KEY);
    if (!pending) return;

    try {
      const { token, topic } = JSON.parse(pending);
      const response = await $fetch('/api/notifications/subscribe', {
        method: 'POST',
        body: { token, topic },
      });

      if (response.success) {
        localStorage.removeItem(PENDING_SUBSCRIBE_KEY);
        state.value.isSubscribed = true;
        setConsent('granted');
        setToken(token);
        log('Pending subscribe retry succeeded');
      }
    } catch {
      log('Pending subscribe retry failed, will try again next init');
    }
  };

  /**
   * Validate and refresh token if needed
   */
  const validateAndRefreshToken = async (): Promise<void> => {
    if (!state.value.isSubscribed) return;
    if (!_hasConsent.value) return;
    if (Notification.permission !== 'granted') return;

    try {
      const currentToken = await $firebase.getFcmToken();
      if (!currentToken) return;

      const savedToken = localStorage.getItem(STORAGE_KEY_TOKEN);

      if (currentToken !== savedToken) {
        log('Token changed, re-subscribing...');

        if (savedToken) {
          try {
            await $fetch('/api/notifications/unsubscribe', {
              method: 'POST',
              body: { token: savedToken, topic: 'news' },
            });
          } catch {
            // Old token might already be invalid
          }
        }

        const response = await $fetch('/api/notifications/subscribe', {
          method: 'POST',
          body: { token: currentToken, topic: 'news' },
        });

        if (response.success) {
          setToken(currentToken);
          log('Re-subscribed with new token');
        }
      } else {
        state.value.token = currentToken;
      }
    } catch (error) {
      if (isDev) console.error('[Notifications] Token validation failed:', error);
    }
  };

  const initState = () => {
    if (typeof window === 'undefined' || !isSupported.value) {
      log('initState: not supported', { window: typeof window, supported: isSupported.value });
      return;
    }

    // Sync reactive refs from localStorage
    syncFromStorage();

    // TWA/Standalone PWA fix: if the user was asked in browser but is now
    // in standalone mode and hasn't actually subscribed, re-ask.
    // TWAs share Chrome's localStorage, so the "asked" flag from the browser
    // prevents the modal from showing inside the installed app.
    const STANDALONE_ASKED_KEY = 'vp_notifications_standalone_asked';
    if (isStandalonePWA.value && _hasBeenAsked.value && !_hasConsent.value) {
      const standaloneAsked = localStorage.getItem(STANDALONE_ASKED_KEY) === 'true';
      if (!standaloneAsked) {
        log('initState: standalone PWA detected — resetting asked flag to re-show modal');
        _hasBeenAsked.value = false;
      }
    }
    // Track that standalone has been asked separately
    if (isStandalonePWA.value && _hasBeenAsked.value) {
      localStorage.setItem(STANDALONE_ASKED_KEY, 'true');
    }

    const browserPermission = Notification.permission as NotificationPermissionStatus;
    state.value.permission = browserPermission;

    log('initState:', {
      browserPermission,
      hasConsent: _hasConsent.value,
      hasBeenAsked: _hasBeenAsked.value,
      isStandalonePWA: isStandalonePWA.value,
      isIOS: isIOS.value,
      userAgent: navigator.userAgent.substring(0, 80),
    });

    syncPermissionState(browserPermission);

    state.value.isSubscribed = _hasConsent.value && browserPermission === 'granted';

    const savedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
    if (savedToken && state.value.isSubscribed) {
      state.value.token = savedToken;
      log('initState: restored token from localStorage');
    }

    // Validate and refresh token in background
    if (state.value.isSubscribed) {
      validateAndRefreshToken();
    }

    // Retry any pending subscribe from a previous offline attempt
    retryPendingSubscribe();

    // Recovery: user granted permission but lost localStorage
    if (browserPermission === 'granted' && !_hasConsent.value) {
      recoverSubscription();
    }
  };

  const syncPermissionState = (browserPermission: NotificationPermissionStatus): void => {
    const storedConsent = localStorage.getItem(STORAGE_KEY);

    if (browserPermission === 'denied' && storedConsent === 'granted') {
      log('Permission revoked in browser, cleaning up...');
      setConsent('denied');
      setAsked(true);
    }
  };

  const recoverSubscription = async (): Promise<void> => {
    if (isIOSSafari.value) return;

    log('Recovering subscription (permission granted but no local data)...');

    try {
      const token = await $firebase.getFcmToken();
      if (!token) return;

      const response = await $fetch('/api/notifications/subscribe', {
        method: 'POST',
        body: { token, topic: 'news' },
      });

      if (response.success) {
        state.value.isSubscribed = true;
        setConsent('granted');
        setAsked(true);
        setToken(token);
        log('Subscription recovered successfully');
      }
    } catch (error) {
      if (isDev) console.error('[Notifications] Recovery failed:', error);
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

      setAsked(true);

      if (permission === 'granted') {
        setConsent('granted');
        return true;
      } else if (permission === 'denied') {
        setConsent('denied');
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
      log('subscribe: requesting permission...');
      const granted = await requestPermission();
      log('subscribe: permission result:', granted);
      if (!granted) return false;

      log('subscribe: getting FCM token...');
      const token = await $firebase.getFcmToken();
      log('subscribe: FCM token:', token ? `${token.substring(0, 20)}...` : 'NULL');
      if (!token) {
        // Diagnostic: check if SW is actually registered
        const swRegs = await navigator.serviceWorker?.getRegistrations();
        log('subscribe: token is null — SW registrations:', swRegs?.length ?? 0);
        state.value.error = swRegs?.length
          ? 'Impossible d\'obtenir le token de notification. Réessayez.'
          : 'Le service worker n\'est pas disponible. Rechargez la page et réessayez.';
        return false;
      }

      state.value.token = token;

      try {
        const response = await $fetch('/api/notifications/subscribe', {
          method: 'POST',
          body: { token, topic: 'news' },
        });

        if (response.success) {
          state.value.isSubscribed = true;
          setConsent('granted');
          setToken(token);
          // Clear any pending subscribe
          localStorage.removeItem(PENDING_SUBSCRIBE_KEY);
          toast.success('Notifications activées', {
            description: 'Vous recevrez les actualités de Vie Publique Sénégal',
          });
          return true;
        } else {
          throw new Error(response.error || 'Erreur lors de l\'abonnement');
        }
      } catch (fetchError) {
        // Network error: save for retry on next init (P9 fix)
        if (fetchError instanceof TypeError || (fetchError instanceof Error && fetchError.message.includes('fetch'))) {
          localStorage.setItem(PENDING_SUBSCRIBE_KEY, JSON.stringify({ token, topic: 'news' }));
          // Permission was granted, mark as subscribed optimistically
          state.value.isSubscribed = true;
          setConsent('granted');
          setToken(token);
          toast.success('Notifications activées', {
            description: 'La synchronisation se terminera à la prochaine connexion.',
          });
          return true;
        }
        throw fetchError;
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
    const token = state.value.token || localStorage.getItem(STORAGE_KEY_TOKEN);

    if (!token) {
      state.value.isSubscribed = false;
      removeConsent();
      removeToken();
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
        removeConsent();
        removeToken();
        localStorage.removeItem(PENDING_SUBSCRIBE_KEY);
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

  const markAsAsked = (): void => {
    if (typeof window === 'undefined') return;
    setAsked(true);
    setConsent('denied');
  };

  const shouldShowConsentModal = computed(() => {
    if (typeof window === 'undefined') return false;
    if (!isSupported.value) {
      log('shouldShowConsentModal: false — not supported', {
        notificationInWindow: 'Notification' in window,
        serviceWorkerInNavigator: 'serviceWorker' in navigator,
      });
      return false;
    }
    if (isIOSSafari.value) {
      log('shouldShowConsentModal: false — iOS Safari');
      return false;
    }
    if (_hasBeenAsked.value) {
      log('shouldShowConsentModal: false — already asked');
      return false;
    }
    if (Notification.permission !== 'default') {
      log('shouldShowConsentModal: false — permission is', Notification.permission);
      return false;
    }
    log('shouldShowConsentModal: true');
    return true;
  });

  const setupForegroundHandler = async () => {
    if (typeof window === 'undefined') return;

    await $firebase.onForegroundMessage?.((payload: unknown) => {
      const isValidPayload = (p: unknown): p is {
        notification?: { title?: string; body?: string };
        data?: { url?: string; openUrl?: string };
      } => {
        return typeof p === 'object' && p !== null;
      };

      if (!isValidPayload(payload)) return;

      const title = payload.notification?.title || 'Nouvelle notification';
      const body = payload.notification?.body;
      const url = payload.data?.openUrl || payload.data?.url;

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
