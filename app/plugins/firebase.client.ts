import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging';

let firebaseApp: FirebaseApp | null = null;
let messaging: Messaging | null = null;

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

  const initMessaging = (): Messaging | null => {
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      !('Notification' in window)
    ) {
      return null;
    }

    if (!messaging && firebaseApp) {
      try {
        messaging = getMessaging(firebaseApp);
      } catch {
        return null;
      }
    }

    return messaging;
  };

  const getFcmToken = async (): Promise<string | null> => {
    const msg = initMessaging();
    if (!msg) return null;

    try {
      // Use existing PWA service worker if available (prod), otherwise register Firebase SW (dev)
      let registration = await navigator.serviceWorker.getRegistration('/');

      if (!registration) {
        registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
          scope: '/',
        });
      }

      const token = await getToken(msg, {
        vapidKey: config.public.firebaseVapidKey,
        serviceWorkerRegistration: registration,
      });

      return token || null;
    } catch {
      return null;
    }
  };

  const onForegroundMessage = (callback: (payload: unknown) => void): (() => void) | null => {
    const msg = initMessaging();
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
