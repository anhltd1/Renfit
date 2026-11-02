import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Toast, type ToastAction } from '../primitives/Toast';

/**
 * useToast (U20 Ops Foundation, NFR-3).
 * One visible toast at a time: `show` replaces whatever is showing and
 * restarts the timer. Auto-hides after 3.5 s, or 5 s when an action is
 * present (DESIGN.md ops_surface: undo toast 5 s). Clicking the action hides
 * the toast, then runs the action's `onClick`.
 *
 *   const { show, node } = useToast();
 *   show({ kind: 'ok', text: 'Đã lưu.' });
 *   return <>{...}{node}</>;
 */
export const TOAST_DEFAULT_MS = 3500;
export const TOAST_ACTION_MS = 5000;

export interface ToastInput {
  kind: 'ok' | 'err';
  text: string;
  action?: ToastAction;
  durationMs?: number;
}

export interface ToastState extends ToastInput {
  /** Increments on every `show`, so a replacement toast remounts. */
  id: number;
  durationMs: number;
}

export interface UseToastResult {
  toast: ToastState | null;
  show: (t: ToastInput) => void;
  hide: () => void;
  node: React.ReactNode;
}

export function useToast(): UseToastResult {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seq = useRef(0);

  const clearTimer = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const hide = useCallback(() => {
    clearTimer();
    setToast(null);
  }, []);

  const show = useCallback(
    (t: ToastInput) => {
      clearTimer();
      const durationMs = t.durationMs ?? (t.action ? TOAST_ACTION_MS : TOAST_DEFAULT_MS);
      seq.current += 1;
      setToast({ ...t, id: seq.current, durationMs });
      timer.current = setTimeout(() => {
        timer.current = null;
        setToast(null);
      }, durationMs);
    },
    [],
  );

  useEffect(() => clearTimer, []);

  const node = toast
    ? React.createElement(Toast, {
        key: toast.id,
        kind: toast.kind,
        text: toast.text,
        action: toast.action
          ? {
              label: toast.action.label,
              onClick: () => {
                const fn = toast.action!.onClick;
                hide();
                fn();
              },
            }
          : undefined,
      })
    : null;

  return { toast, show, hide, node };
}
