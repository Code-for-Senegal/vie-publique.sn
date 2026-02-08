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
      return null;
    }

    if (messaging) return messaging;

    // Deduplicate concurrent calls
    if (!messagingPromise) {
      messagingPromise = navigator.serviceWorker.ready.then(() => {
        try {
          messaging = getMessaging(firebaseApp!);
          return messaging;
        } catch {
          return null;
        } finally {
          messagingPromise = null;
        }
      });
    }

    return messagingPromise;
  };

  const getFcmToken = async (): Promise<string | null> => {
    const msg = await initMessaging();
    if (!msg) return null;

    try {
      const registration = await navigator.serviceWorker.ready;

      const token = await getToken(msg, {
        vapidKey: config.public.firebaseVapidKey,
        serviceWorkerRegistration: registration,
      });

      return token || null;
    } catch {
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
