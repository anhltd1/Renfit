import { useCallback, useState } from 'react';
import type { UseToastResult } from './useToast';

/**
 * useUndoableAction (U20 Ops Foundation, FR-3).
 * Runs a frequent, reversible action and confirms it with a 5 s undo toast
 * (DESIGN.md ops_surface: undo instead of a confirm dialog). No silent
 * failures: action or undo errors always surface as an error toast.
 *
 *   const { show, node } = useToast();
 *   const { run, pending } = useUndoableAction(show);
 *   await run({
 *     action: () => updateStatus(id, 'rejected'),
 *     undo: () => updateStatus(id, 'pending'),
 *     successText: 'Đã từ chối lịch.',
 *     onError: () => restorePrevious(),
 *   });
 *
 * Error text precedence: the thrown Error's message (API clients already
 * normalise to Vietnamese) → `errorText` → a generic Vietnamese fallback.
 */
export const UNDO_LABEL = 'Hoàn tác';
export const DEFAULT_UNDONE_TEXT = 'Đã hoàn tác.';
export const DEFAULT_ERROR_TEXT = 'Có lỗi xảy ra. Vui lòng thử lại.';
export const DEFAULT_UNDO_ERROR_TEXT = 'Không thể hoàn tác. Vui lòng thử lại.';

export interface UndoableActionOptions {
  action: () => Promise<unknown>;
  undo?: () => Promise<unknown>;
  successText: string;
  undoneText?: string;
  errorText?: string;
  onError?: (e: unknown) => void;
}

function messageOf(e: unknown, fallback: string): string {
  return e instanceof Error && e.message ? e.message : fallback;
}

export function useUndoableAction(show: UseToastResult['show']): {
  run: (o: UndoableActionOptions) => Promise<boolean>;
  pending: boolean;
} {
  const [pending, setPending] = useState(false);

  const run = useCallback(
    async (o: UndoableActionOptions): Promise<boolean> => {
      setPending(true);
      try {
        await o.action();
      } catch (e) {
        show({ kind: 'err', text: messageOf(e, o.errorText ?? DEFAULT_ERROR_TEXT) });
        o.onError?.(e);
        return false;
      } finally {
        setPending(false);
      }

      const undo = o.undo;
      show({
        kind: 'ok',
        text: o.successText,
        action: undo
          ? {
              label: UNDO_LABEL,
              onClick: () => {
                void (async () => {
                  try {
                    await undo();
                    show({ kind: 'ok', text: o.undoneText ?? DEFAULT_UNDONE_TEXT });
                  } catch (e) {
                    show({ kind: 'err', text: messageOf(e, DEFAULT_UNDO_ERROR_TEXT) });
                  }
                })();
              },
            }
          : undefined,
      });
      return true;
    },
    [show],
  );

  return { run, pending };
}
