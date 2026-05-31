# Renfit API Guidelines

Design-driven API behavior is defined in `frontend/rules/DESIGN.md` (`ai_ux`, `booking_flow_behavior`). Apply these rules when adding `fetch`, React Query, or a `frontend/src/lib/api/` layer.

## Principles

- **Vietnamese-first responses**: parse/display AI and API messages as Vietnamese; keep error messages clear and actionable.
- **Type everything**: shared types in `frontend/src/types/` (or colocated `*.types.ts`); no `any` on API payloads.
- **Single client**: one module (e.g. `lib/api/client.ts`) for base URL, headers, and error normalization.

## Client pattern

```ts
const API_BASE = import.meta.env.VITE_API_URL ?? '';

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.message ?? 'Đã xảy ra lỗi. Vui lòng thử lại.');
  }
  return res.json();
}
```

- Surface errors in UI with Vietnamese copy; log technical detail only in dev.
- Use `AbortController` for cancellable chat streams and in-flight booking submits.

## AI Coach endpoints

Align with design `ai_ux` and `ai_safety_rules`:

| Concern | Rule |
|--------|------|
| Tone | Professional, supportive Vietnamese (“bạn”); science-based; not hype |
| Length | Prefer ≤ 3 paragraphs per turn; split long answers into multiple messages |
| Structure | Text + optional **action cards** (icon, title, description) — max 3–4 cards |
| Safety | Never return medical diagnoses; flag pain/injury; suggest seeing a doctor when serious |
| UI state | `loading` → typing indicator; `streaming` → append tokens; `error` → retry CTA |

Suggested shapes:

```ts
// POST /api/ai/chat
interface ChatRequest { message: string; conversationId?: string }
interface ChatResponse {
  reply: string;
  cards?: { id: string; title: string; description: string; action: string }[];
}
```

- Demo/mock data in pages is OK until backend exists; swap to `api()` without changing component layout.

## Booking flow

From `booking_flow_behavior`:

- **5 steps**, progressive validation (block “next” until step valid).
- **Persist progress** (sessionStorage or API draft) so refresh does not lose data.
- **Confirmation**: detailed summary + QR placeholder when payment/confirm is integrated.

```ts
interface BookingDraft {
  step: number;
  trainerId?: string;
  slot?: string;
  // ...
}
```

## Environment and security

- Secrets only in `.env` (`VITE_*`); never commit API keys.
- Do not send PHI or full medical history in analytics events.
- Rate-limit chat on the server; debounce client submit (≥ 300ms) to prevent double-send.

## When backend is added

- Prefer REST JSON under `/api/v1/` or documented OpenAPI.
- Keep CORS and auth documented in repo README before wiring production URLs.
