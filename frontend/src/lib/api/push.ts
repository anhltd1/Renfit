/**
 * Push notification API client (U17).
 */
const API_BASE = import.meta.env.VITE_API_URL ?? '';

function url(path: string) {
  return API_BASE ? `${API_BASE}${path}` : path;
}

export async function fetchVapidPublicKey(): Promise<string> {
  const res = await fetch(url('/api/v1/push/vapid-public-key'));
  if (!res.ok) return '';
  const data = await res.json();
  return data.public_key ?? '';
}

export async function subscribePush(
  subscription: PushSubscription,
  customerId?: string | null,
  isTrainer = false,
): Promise<void> {
  const sub = subscription.toJSON();
  await fetch(url('/api/v1/push/subscribe'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      endpoint: sub.endpoint,
      keys: sub.keys,
      customer_id: customerId ?? null,
      is_trainer: isTrainer,
    }),
  });
}

export async function unsubscribePush(endpoint: string): Promise<void> {
  await fetch(url('/api/v1/push/unsubscribe'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint }),
  });
}
