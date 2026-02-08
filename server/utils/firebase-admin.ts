import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getMessaging, type Messaging } from 'firebase-admin/messaging';

let adminApp: App | null = null;
let adminMessaging: Messaging | null = null;

export const getFirebaseAdmin = (): App => {
  if (adminApp) return adminApp;

  const apps = getApps();
  if (apps.length > 0) {
    adminApp = apps[0];
    return adminApp;
  }

  const config = useRuntimeConfig();
  const serviceAccountJson = config.firebaseServiceAccountJson;

  if (!serviceAccountJson) {
    throw new Error('NUXT_FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set.');
  }

  // Handle both string (needs parsing) and object (already parsed by Nuxt)
  // Spread to create a mutable copy (Nuxt may return a frozen object)
  let serviceAccount: Record<string, unknown>;
  if (typeof serviceAccountJson === 'string') {
    serviceAccount = JSON.parse(serviceAccountJson);
  } else {
    serviceAccount = { ...serviceAccountJson } as Record<string, unknown>;
  }

  adminApp = initializeApp({ credential: cert(serviceAccount) });

  return adminApp;
};

export const getFirebaseMessaging = (): Messaging => {
  if (adminMessaging) return adminMessaging;

  const app = getFirebaseAdmin();
  adminMessaging = getMessaging(app);

  return adminMessaging;
};

export const subscribeToTopic = async (token: string, topic: string): Promise<void> => {
  const messaging = getFirebaseMessaging();
  const response = await messaging.subscribeToTopic([token], topic);

  if (response.failureCount > 0) {
    throw new Error(`Failed to subscribe: ${response.errors[0].error.message}`);
  }
};

export const unsubscribeFromTopic = async (token: string, topic: string): Promise<void> => {
  const messaging = getFirebaseMessaging();
  const response = await messaging.unsubscribeFromTopic([token], topic);

  if (response.failureCount > 0) {
    throw new Error(`Failed to unsubscribe: ${response.errors[0].error.message}`);
  }
};

export const sendToTopic = async (
  topic: string,
  notification: { title: string; body: string; imageUrl?: string },
  data?: Record<string, string>
): Promise<string> => {
  const messaging = getFirebaseMessaging();

  return await messaging.send({
    topic,
    notification: {
      title: notification.title,
      body: notification.body,
      imageUrl: notification.imageUrl,
    },
    data: data || {},
    webpush: {
      fcmOptions: { link: data?.url || '/' },
      notification: {
        icon: '/pwa-192x192.png',
        badge: '/badge-72x72.png',
      },
    },
    android: {
      priority: 'high',
      notification: {
        icon: 'ic_notification',
        color: '#00a96e',
        defaultSound: true,
        clickAction: 'OPEN_URL',
      },
    },
  });
};
