import React, { useCallback, useRef, useState } from 'react';
import { ConfirmDialog } from '../components/ConfirmDialog';

/**
 * useDirtyGuard (U20 Ops Foundation, FR-3/FR-8).
 * "Closing a form with unsaved changes asks before discarding."
 *
 *   const guard = useDirtyGuard(initialValues, values);
 *   <Modal onClose={() => guard.requestClose(onClose)} ...>
 *   {guard.dialog}
 *
 * Comparison: `Object.is`, then shallow key/value equality for plain objects,
 * then `JSON.stringify` (handles nested values/arrays). Clean → `onClose`
 * runs immediately; dirty → "Bỏ thay đổi?" confirm dialog.
 */
function isEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)) {
    const ka = Object.keys(a as object);
    const kb = Object.keys(b as object);
    if (ka.length === kb.length && ka.every((k) => Object.is((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]))) {
      return true;
    }
  }
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

export function useDirtyGuard<T>(
  initial: T,
  current: T,
): { isDirty: boolean; requestClose: (onClose: () => void) => void; dialog: React.ReactNode } {
  const isDirty = !isEqual(initial, current);
  const [open, setOpen] = useState(false);
  const pendingClose = useRef<(() => void) | null>(null);

  const requestClose = useCallback(
    (onClose: () => void) => {
      if (!isDirty) {
        onClose();
        return;
      }
      pendingClose.current = onClose;
      setOpen(true);
    },
    [isDirty],
  );

  const dialog = React.createElement(ConfirmDialog, {
    open,
    title: 'Bỏ thay đổi?',
    body: 'Những thay đổi chưa lưu sẽ bị mất.',
    confirmLabel: 'Bỏ thay đổi',
    cancelLabel: 'Tiếp tục sửa',
    tone: 'danger',
    onConfirm: () => {
      setOpen(false);
      const fn = pendingClose.current;
      pendingClose.current = null;
      fn?.();
    },
    onCancel: () => {
      setOpen(false);
      pendingClose.current = null;
    },
  });

  return { isDirty, requestClose, dialog };
}
