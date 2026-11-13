/**
 * Add-InBody-record bottom sheet (U6 Trainer Mobile, TR-5, INBODY-ADMIN-1).
 * Built on the shared `Sheet` primitive (mobile convention — never Modal on mobile).
 *
 * U21 (FR-3/FR-8): decimal keyboards, per-field range errors (blocking),
 * a non-blocking warning when a value differs from "Lần trước" by > 10 %,
 * a dirty guard on every close path, and a success toast after saving.
 * Keep in sync with the desktop `AddInbodyModal` (same form, Modal chrome).
 */
import React, { useEffect, useId, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Sheet } from '../../shared/primitives/Sheet';
import { Button } from '../../shared/primitives/Button';
import { cn } from '../../shared/primitives/cn';
import { addInbody, type AddInbodyPayload, type InbodyRecord } from '../../../lib/api/admin';
import { InbodyPhotoPicker } from '../../shared/components/InbodyPhotoPicker';
import { useDirtyGuard } from '../../shared/hooks/useDirtyGuard';
import { useToast } from '../../shared/hooks/useToast';
import { inbodySavedText } from '../../shared/forms/inbodyDelta';
import {
  changeWarning,
  parseDecimal,
  validateInbodyField,
  type InbodyField,
} from '../../shared/forms/validation';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

const FIELDS: { key: InbodyField; label: string; unit: string; placeholder: (last: InbodyRecord | null) => string }[] = [
  { key: 'height', label: 'Chiều cao', unit: '(cm)', placeholder: (l) => (l ? String(l.height) : '170') },
  { key: 'weight', label: 'Cân nặng', unit: '(kg)', placeholder: (l) => (l ? String(l.weight) : '60') },
  { key: 'SMM', label: 'SMM', unit: '(kg) — Cơ xương', placeholder: () => '0.0' },
  { key: 'BFM', label: 'BFM', unit: '(kg) — Mỡ cơ thể', placeholder: () => '0.0' },
];

const UNIT: Record<InbodyField, string> = { height: 'cm', weight: 'kg', SMM: 'kg', BFM: 'kg' };

const INBODY_CHANGE_WARNING = 'Chênh lệch hơn 10% so với lần trước — kiểm tra lại.';
const INBODY_SAVED_TEXT = 'Đã lưu kết quả InBody.';

type Form = Record<InbodyField, string> & { date_recorded: string };

function freshForm(last: InbodyRecord | null): Form {
  return { height: last ? String(last.height) : '', weight: '', SMM: '', BFM: '', date_recorded: today() };
}

export interface AddInbodySheetProps {
  open: boolean;
  customerId: string;
  lastRecord: InbodyRecord | null;
  onClose: () => void;
  onAdded: (record: InbodyRecord) => void;
}

export function AddInbodySheet({ open, customerId, lastRecord, onClose, onAdded }: AddInbodySheetProps) {
  const uid = useId();
  const [baseline, setBaseline] = useState<Form>(() => freshForm(lastRecord));
  const [form, setForm] = useState<Form>(baseline);
  const [photos, setPhotos] = useState<string[]>([]);
  const [errors, setErrors] = useState<Partial<Record<InbodyField, string>>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { show, node: toastNode } = useToast();

  // Every open starts a clean entry (prefilled from the latest record, which
  // may have loaded after mount). Unsaved drafts are only discarded through
  // the dirty guard, so nothing is lost silently.
  useEffect(() => {
    if (!open) return;
    const fresh = freshForm(lastRecord);
    setBaseline(fresh);
    setForm(fresh);
    setPhotos([]);
    setErrors({});
    setError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const guard = useDirtyGuard({ ...baseline, photos: 0 }, { ...form, photos: photos.length });
  const requestClose = () => {
    if (loading) return;
    guard.requestClose(onClose);
  };

  const set = (field: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
    if (field in errors) setErrors((er) => ({ ...er, [field]: undefined }));
  };

  const warns = (field: InbodyField): boolean => {
    if (!lastRecord || validateInbodyField(field, form[field])) return false;
    return changeWarning(lastRecord[field], parseDecimal(form[field]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    const next: Partial<Record<InbodyField, string>> = {};
    for (const { key } of FIELDS) {
      const msg = validateInbodyField(key, form[key]);
      if (msg) next[key] = msg;
    }
    setErrors(next);
    const firstInvalid = FIELDS.find(({ key }) => next[key]);
    if (firstInvalid) {
      document.getElementById(`${uid}-${firstInvalid.key}`)?.focus();
      return;
    }
    setLoading(true);
    try {
      const payload: AddInbodyPayload = {
        height: parseDecimal(form.height),
        weight: parseDecimal(form.weight),
        SMM: parseDecimal(form.SMM),
        BFM: parseDecimal(form.BFM),
        date_recorded: form.date_recorded || today(),
        ...(photos.length ? { photos } : {}),
      };
      const record = await addInbody(customerId, payload);
      onAdded(record);
      // U24 (FR-12): show the change since the previous record.
      show({ kind: 'ok', text: inbodySavedText(INBODY_SAVED_TEXT, lastRecord, payload) });
      // Saved — close directly (no dirty prompt).
      onClose();
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : 'Lưu thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    'w-full bg-white/5 border rounded-control px-3 py-2.5 text-white placeholder:text-white/40 outline-none focus:border-[#3DBE7A] transition-colors text-base leading-relaxed tabular-nums';

  return (
    <>
      <Sheet open={open} onClose={requestClose} title="Nhập chỉ số InBody" ops>
        <p className="text-white/64 text-sm leading-relaxed -mt-2 mb-4">Kết quả đo từ máy InBody tại phòng gym</p>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor={`${uid}-date`} className="text-white/70 text-sm leading-relaxed mb-1.5 block">
              Ngày đo
            </label>
            <input
              id={`${uid}-date`}
              type="date"
              value={form.date_recorded}
              onChange={set('date_recorded')}
              className={cn(inputCls, 'border-line [color-scheme:dark]')}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {FIELDS.map(({ key, label, unit, placeholder }) => {
              const id = `${uid}-${key}`;
              const err = errors[key];
              const warn = !err && warns(key);
              const describedBy = [err && `${id}-error`, warn && `${id}-warn`].filter(Boolean).join(' ') || undefined;
              return (
                <div key={key}>
                  <label htmlFor={id} className="text-white/70 text-sm leading-relaxed mb-1.5 block">
                    {label} <span className="text-white/64">{unit}</span>
                  </label>
                  <input
                    id={id}
                    type="text"
                    inputMode="decimal"
                    data-testid={`inbody-input-${key}`}
                    value={form[key]}
                    onChange={set(key)}
                    placeholder={placeholder(lastRecord)}
                    aria-invalid={err ? true : undefined}
                    aria-required
                    aria-describedby={describedBy}
                    className={cn(inputCls, err ? 'border-error-text/70' : 'border-line')}
                  />
                  {lastRecord && (
                    <p className="text-white/64 text-xs leading-relaxed mt-1 tabular-nums">
                      Lần trước: {lastRecord[key]} {UNIT[key]}
                    </p>
                  )}
                  {err && (
                    <p id={`${id}-error`} data-testid={`inbody-error-${key}`} className="text-error-text text-sm leading-relaxed mt-1">
                      {err}
                    </p>
                  )}
                  {warn && (
                    <p
                      id={`${id}-warn`}
                      data-testid={`inbody-warning-${key}`}
                      className="text-warning-text text-sm leading-relaxed mt-1 flex items-start gap-1.5"
                    >
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                      {INBODY_CHANGE_WARNING}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <InbodyPhotoPicker value={photos} onChange={setPhotos} disabled={loading} />

          {error && (
            <p role="alert" className="text-error-text text-sm leading-relaxed bg-[#f87171]/10 border border-error-text/30 rounded-control px-4 py-2.5">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <Button variant="secondary" onClick={requestClose} disabled={loading} className="flex-1 tap-target ">
              Hủy
            </Button>
            <Button type="submit" loading={loading} className="flex-1 tap-target ">
              {loading ? 'Đang lưu...' : 'Lưu kết quả'}
            </Button>
          </div>
        </form>
      </Sheet>
      {guard.dialog}
      {toastNode}
    </>
  );
}
