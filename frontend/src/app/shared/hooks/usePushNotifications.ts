/**
 * usePushNotifications — manage Web Push subscription lifecycle (U17).
 * Subscribe on mount if permission granted; expose subscribe/unsubscribe for UI.
 */
import { useCallback, useEffect, useState } from 'react';
import { fetchVapidPublicKey, subscribePush, unsubscribePush } from '../../../lib/api/push';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications(userId: string | null, isTrainer = false) {
  const [supported] = useState(() => 'serviceWorker' in navigator && 'PushManager' in window);
  const [permission, setPermission] = useState<NotificationPermission>(
    supported ? Notification.permission : 'denied',
  );
  const [subscribed, setSubscribed] = useState(false);

  const subscribe = useCallback(async () => {
    if (!supported || !userId) return;

    const perm = await Notification.requestPermission();
    setPermission(perm);
    if (perm !== 'granted') return;

    try {
      const vapidKey = await fetchVapidPublicKey();
      if (!vapidKey) return;

      const registration = await navigator.serviceWorker.ready;
      let sub = await registration.pushManager.getSubscription();

      if (!sub) {
        sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        });
      }

      await subscribePush(sub, isTrainer ? null : userId, isTrainer);
      setSubscribed(true);
    } catch {
      // Silent failure — push is optional
    }
  }, [supported, userId, isTrainer]);

  const unsubscribe = useCallback(async () => {
    if (!supported) return;
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      if (sub) {
        await unsubscribePush(sub.endpoint);
        await sub.unsubscribe();
      }
      setSubscribed(false);
    } catch {
      // Silent
    }
  }, [supported]);

  // Auto-subscribe on mount if permission already granted
  useEffect(() => {
    if (!supported || !userId || permission !== 'granted') return;

    (async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.getSubscription();
        if (sub) {
          // Already subscribed in browser — ensure backend knows
          await subscribePush(sub, isTrainer ? null : userId, isTrainer);
          setSubscribed(true);
        }
      } catch {
        // Silent
      }
    })();
  }, [supported, userId, permission, isTrainer]);

  return { supported, permission, subscribed, subscribe, unsubscribe };
}
