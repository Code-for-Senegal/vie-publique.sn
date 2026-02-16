import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging';

let firebaseApp: FirebaseApp | null = null;
let messaging: Messaging | null = null;
let messagingPromise: Promise<Messaging | null> | null = null;

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  if (!firebaseApp) {
    firebaseApp = initializeApp({
      apiKey: config.public.firebaseApiKey,
      authDomain: config.public.firebaseAuthDomain,
      projectId: config.public.firebaseProjectId,
      storageBucket: config.public.firebaseStorageBucket,
      messagingSenderId: config.public.firebaseMessagingSenderId,
      appId: config.public.firebaseAppId,
      measurementId: config.public.firebaseMeasurementId,
    });
  }

  /**
   * Wait for SW ready with a timeout to avoid hanging forever
   * when no service worker is registered (e.g. dev mode without PWA_ENABLED).
   */
  const waitForSWReady = (timeoutMs = 10000): Promise<ServiceWorkerRegistration | null> => {
    return Promise.race([
      navigator.serviceWorker.ready,
      new Promise<null>((resolve) =>
        setTimeout(() => {
          console.warn('[Firebase] Service worker ready timeout after', timeoutMs, 'ms');
          resolve(null);
        }, timeoutMs),
      ),
    ]);
  };

  /**
   * Initialize Firebase Messaging AFTER the service worker is ready.
   * Firebase internally looks for a SW when getMessaging() is called.
   * Without waiting, it tries to fetch /firebase-messaging-sw.js which doesn't exist.
   */
  const initMessaging = async (): Promise<Messaging | null> => {
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      !('Notification' in window)
    ) {
      console.warn('[Firebase] Messaging prerequisites not met:', {
        window: typeof window !== 'undefined',
        serviceWorker: typeof navigator !== 'undefined' && 'serviceWorker' in navigator,
        notification: typeof window !== 'undefined' && 'Notification' in window,
      });
      return null;
    }

    if (messaging) return messaging;

    // Deduplicate concurrent calls
    if (!messagingPromise) {
      messagingPromise = (async (): Promise<Messaging | null> => {
        try {
          // Quick check: is any SW registered?
          const registrations = await navigator.serviceWorker.getRegistrations();
          if (registrations.length === 0) {
            console.warn('[Firebase] No service worker registered — FCM needs a SW. Is PWA_ENABLED=true?');
            return null;
          }

          const registration = await waitForSWReady();
          if (!registration) return null;

          messaging = getMessaging(firebaseApp!);
          return messaging;
        } catch (error) {
          console.error('[Firebase] initMessaging error:', error);
          return null;
        } finally {
          messagingPromise = null;
        }
      })();
    }

    return messagingPromise;
  };

  const getFcmToken = async (): Promise<string | null> => {
    const msg = await initMessaging();
    if (!msg) {
      console.warn('[Firebase] Messaging not available — cannot get FCM token');
      return null;
    }

    try {
      const registration = await waitForSWReady();
      if (!registration) {
        console.warn('[Firebase] SW not ready — cannot get FCM token');
        return null;
      }

      const token = await getToken(msg, {
        vapidKey: config.public.firebaseVapidKey,
        serviceWorkerRegistration: registration,
      });

      return token || null;
    } catch (error) {
      console.error('[Firebase] getFcmToken error:', error);
      return null;
    }
  };

  const onForegroundMessage = async (
    callback: (payload: unknown) => void,
  ): Promise<(() => void) | null> => {
    const msg = await initMessaging();
    if (!msg) return null;

    return onMessage(msg, callback);
  };

  return {
    provide: {
      firebase: {
        app: firebaseApp,
        initMessaging,
        getFcmToken,
        onForegroundMessage,
      },
    },
  };
});
