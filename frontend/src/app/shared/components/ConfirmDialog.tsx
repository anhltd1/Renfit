import React, { useContext } from 'react';
import { DeviceContext } from '../../device/DeviceContext';
import { Button } from '../primitives/Button';
import { Modal } from '../primitives/Modal';
import { Sheet } from '../primitives/Sheet';
import { cn } from '../primitives/cn';

/**
 * ConfirmDialog (U20 Ops Foundation, FR-3).
 * For rare or hard-to-reverse actions (archive a member, discard unsaved
 * changes). Frequent reversible actions use an undo toast instead
 * (`useUndoableAction`).
 *
 * Renders the shared `Modal` on desktop and `Sheet` on mobile. Reads
 * `DeviceContext` directly (same source as `useDevice()`) and falls back to
 * desktop when rendered outside a `<DeviceProvider>`, so forms/tests that
 * don't mount a provider still work.
 *
 * Escape / backdrop / close button map to `onCancel` (ignored while `busy`).
 */
export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  body?: React.ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: 'default' | 'danger';
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel = 'Huỷ',
  tone = 'default',
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const device = useContext(DeviceContext);
  const isMobile = device?.isMobile ?? false;
  const Overlay = isMobile ? Sheet : Modal;
  const close = () => {
    if (!busy) onCancel();
  };

  return (
    <Overlay open={open} onClose={close} title={title} ops>
      <div data-testid="confirm-dialog">
        {body && <div className="text-white/70 text-base leading-relaxed mb-6">{body}</div>}
        <div className={cn('flex gap-3', isMobile ? 'flex-col-reverse' : 'justify-end')}>
          <Button
            variant="secondary"
            data-testid="confirm-dialog-cancel"
            onClick={close}
            disabled={busy}
            className={cn('tap-target', isMobile && 'w-full')}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={tone === 'danger' ? 'secondary' : 'primary'}
            data-testid="confirm-dialog-confirm"
            onClick={onConfirm}
            loading={busy}
            className={cn(
              'tap-target',
              isMobile && 'w-full',
              // Error tone without a red fill: #f87171 text on a dark tint keeps
              // 7:1 contrast (white on #ef4444 would be ~3.8:1).
              tone === 'danger' &&
                'bg-[#f87171]/10 text-error-text border-error-text/60 hover:bg-[#f87171]/20 hover:scale-100',
            )}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Overlay>
  );
}
