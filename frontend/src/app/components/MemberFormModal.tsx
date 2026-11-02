/**
 * MemberFormModal — Create or edit a member (PT-side, U14; rebuilt in U21).
 *
 * U21 (FR-3/FR-8): built on the shared `Modal` (desktop) / `Sheet` (mobile)
 * primitives — dialog semantics, focus trap, Esc. Labels are associated with
 * their inputs, phone/age/height/weight use the right mobile keyboards, age
 * has no default, every field reports its own error (`aria-invalid` +
 * `aria-describedby`), and closing with unsaved changes asks first
 * (`useDirtyGuard`). Create mode shows a generated temp password on success;
 * edit mode closes and reports "Đã lưu thay đổi." via `showToast`.
 *
 * Device choice reads `DeviceContext` directly (like `ConfirmDialog`) and
 * falls back to desktop when there is no `<DeviceProvider>`.
 */
import React, { useContext, useId, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import {
  createMember,
  editMember,
  type CreateMemberPayload,
  type CustomerSummary,
  type EditMemberPayload,
} from '../../lib/api/admin';
import { haptic } from '../shared/primitives/haptics';
import { DeviceContext } from '../device/DeviceContext';
import { Modal } from '../shared/primitives/Modal';
import { Sheet } from '../shared/primitives/Sheet';
import { Button } from '../shared/primitives/Button';
import { cn } from '../shared/primitives/cn';
import { useDirtyGuard } from '../shared/hooks/useDirtyGuard';
import type { ToastInput } from '../shared/hooks/useToast';
import { validateAge, validateInbodyField, validateVnPhone } from '../shared/forms/validation';

const PRESET_GOALS = ['Giảm cân', 'Tăng cơ', 'Cải thiện sức khỏe', 'Tăng sức bền', 'Linh hoạt & phục hồi'];

export interface MemberFormModalProps {
  mode: 'create' | 'edit';
  customer?: CustomerSummary;
  onClose: () => void;
  onSaved: () => void;
  /**
   * Shows the edit-success toast ("Đã lưu thay đổi."). Pass the parent's
   * `useToast().show` — the parent unmounts this form on save, so a toast
   * rendered here would vanish with it. Optional; omitted → no toast.
   */
  showToast?: (t: ToastInput) => void;
}

type FieldKey = 'name' | 'phone' | 'age' | 'goal' | 'healthNote' | 'address' | 'height' | 'weight';
type Values = Record<FieldKey, string>;
type Errors = Partial<Record<FieldKey, string>>;

const inputBase =
  'w-full bg-white/5 border rounded-2xl px-4 py-3 text-white text-base leading-relaxed placeholder:text-white/40 outline-none focus:border-[#3DBE7A] transition-colors';

function initialValues(customer?: CustomerSummary): Values {
  return {
    name: customer?.id ?? '',
    phone: customer?.phone_number ?? '',
    // FR-8: no default age — an empty field, never a silent "20".
    age: customer?.age != null ? String(customer.age) : '',
    goal: customer?.goal ?? '',
    healthNote: customer?.health_note ?? '',
    address: customer?.address ?? '',
    height: customer?.height ?? '',
    weight: customer?.weight ?? '',
  };
}

function validate(mode: 'create' | 'edit', v: Values, initial: Values): Errors {
  const e: Errors = {};
  if (mode === 'create') {
    if (!v.name.trim()) e.name = 'Vui lòng nhập họ và tên.';
    const phone = validateVnPhone(v.phone);
    if (phone) e.phone = phone;
  }
  const age = validateAge(v.age, { required: mode === 'create' });
  if (age) e.age = age;
  // Height/weight are optional; sanity-check only what the PT typed (legacy
  // free-text values on an untouched field don't block an unrelated edit).
  for (const f of ['height', 'weight'] as const) {
    if (v[f].trim() && v[f] !== initial[f]) {
      const msg = validateInbodyField(f, v[f]);
      if (msg) e[f] = msg;
    }
  }
  return e;
}

interface FieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: (a11y: {
    id: string;
    'aria-invalid'?: true;
    'aria-describedby'?: string;
    'aria-required'?: true;
    className: string;
  }) => React.ReactNode;
}

function Field({ id, label, required, error, children }: FieldProps) {
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id} className="text-white/70 text-sm leading-relaxed mb-1.5 block">
        {label}
        {required && (
          <span className="text-error-text ml-0.5" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children({
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': error ? errorId : undefined,
        'aria-required': required ? true : undefined,
        className: cn(inputBase, error ? 'border-error-text/70' : 'border-white/10'),
      })}
      {error && (
        <p id={errorId} data-testid={`member-form-error-${id.split('-').pop()}`} className="text-error-text text-sm leading-relaxed mt-1.5">
          {error}
        </p>
      )}
    </div>
  );
}

export function MemberFormModal({ mode, customer, onClose, onSaved, showToast }: MemberFormModalProps) {
  const device = useContext(DeviceContext);
  const isMobile = device?.isMobile ?? false;
  const Overlay = isMobile ? Sheet : Modal;

  const uid = useId();
  const fid = (k: FieldKey) => `${uid}-${k}`;

  const [initial] = useState(() => initialValues(customer));
  const [values, setValues] = useState<Values>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const guard = useDirtyGuard(initial, values);

  const setField = (k: FieldKey) => (next: string) => {
    setValues((v) => ({ ...v, [k]: next }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };
  const onInput =
    (k: FieldKey) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setField(k)(e.target.value);

  const requestClose = () => {
    if (submitting) return;
    guard.requestClose(onClose);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError('');
    const fieldErrors = validate(mode, values, initial);
    setErrors(fieldErrors);
    const firstInvalid = (Object.keys(fieldErrors) as FieldKey[]).find((k) => fieldErrors[k]);
    if (firstInvalid) {
      document.getElementById(fid(firstInvalid))?.focus();
      return;
    }

    const ageNum = values.age.trim() ? Number(values.age.trim()) : undefined;
    setSubmitting(true);
    haptic();
    try {
      if (mode === 'create') {
        const payload: CreateMemberPayload = {
          name: values.name.trim(),
          phone_number: values.phone.replace(/[\s.\-]/g, ''),
          age: ageNum as number,
          goal: values.goal.trim(),
          health_note: values.healthNote.trim(),
          address: values.address.trim(),
          height: values.height.trim(),
          weight: values.weight.trim(),
        };
        const result = await createMember(payload);
        setTempPassword(result.temporary_password);
      } else {
        const payload: EditMemberPayload = {};
        if (ageNum !== undefined) payload.age = ageNum;
        if (values.goal) payload.goal = values.goal.trim();
        payload.health_note = values.healthNote.trim();
        payload.address = values.address.trim();
        if (values.height) payload.height = values.height.trim();
        if (values.weight) payload.weight = values.weight.trim();
        await editMember(customer!.id, payload);
        showToast?.({ kind: 'ok', text: 'Đã lưu thay đổi.' });
        // Saved — close directly, no dirty prompt.
        onSaved();
      }
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : 'Thao tác thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = async () => {
    if (!tempPassword) return;
    try {
      await navigator.clipboard.writeText(tempPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be unavailable (insecure context) — the password stays visible.
    }
  };

  // Success screen for create mode — the member exists, so every close path
  // refreshes the list.
  if (tempPassword) {
    const finish = () => {
      onSaved();
      onClose();
    };
    return (
      <Overlay open onClose={finish} title="Tạo hội viên thành công" className="max-w-sm" ops>
        <div className="space-y-4" data-testid="member-form-success">
          <p className="text-white/70 text-sm leading-relaxed">
            Mật khẩu tạm thời (gửi cho hội viên để đăng nhập lần đầu):
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-white font-mono text-lg tracking-wider text-center">
              {tempPassword}
            </code>
            <button
              type="button"
              onClick={handleCopy}
              data-testid="member-form-copy-password"
              aria-label="Sao chép mật khẩu"
              className="tap-target flex items-center justify-center p-3 rounded-xl bg-[#0F6B3E]/20 border border-[#0F6B3E]/30 text-primary-text hover:bg-[#0F6B3E]/30 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#3DBE7A]"
            >
              {copied ? <Check className="w-4 h-4" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
            </button>
          </div>
          {copied && (
            <p className="text-primary-text text-sm leading-relaxed" role="status">
              Đã sao chép.
            </p>
          )}
          <Button className="w-full tap-target" onClick={finish} data-testid="member-form-done">
            Đóng
          </Button>
        </div>
      </Overlay>
    );
  }

  const title = mode === 'create' ? 'Tạo hội viên mới' : `Chỉnh sửa — ${customer?.id ?? ''}`;

  return (
    <>
      <Overlay open onClose={requestClose} title={title} className="max-w-lg" ops>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4" data-testid="member-form">
          {/* Name + Phone (create only) */}
          {mode === 'create' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field id={fid('name')} label="Họ và tên" required error={errors.name}>
                {(a) => (
                  <input
                    {...a}
                    type="text"
                    autoComplete="name"
                    value={values.name}
                    onChange={onInput('name')}
                    placeholder="Nguyễn Văn A"
                  />
                )}
              </Field>
              <Field id={fid('phone')} label="Số điện thoại" required error={errors.phone}>
                {(a) => (
                  <input
                    {...a}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={values.phone}
                    onChange={onInput('phone')}
                    placeholder="0912345678"
                  />
                )}
              </Field>
            </div>
          )}

          <Field id={fid('age')} label="Tuổi" required={mode === 'create'} error={errors.age}>
            {(a) => (
              <input
                {...a}
                type="text"
                inputMode="numeric"
                value={values.age}
                onChange={onInput('age')}
                placeholder="VD: 28"
              />
            )}
          </Field>

          {/* Goal */}
          <div>
            <label htmlFor={fid('goal')} className="text-white/70 text-sm leading-relaxed mb-1.5 block">
              Mục tiêu
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {PRESET_GOALS.map((g) => (
                <button
                  key={g}
                  type="button"
                  aria-pressed={values.goal === g}
                  onClick={() => setField('goal')(g)}
                  className={cn(
                    'tap-target px-3 py-1 rounded-full text-sm leading-relaxed border transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#3DBE7A]',
                    values.goal === g
                      ? 'bg-[#0F6B3E] border-[#0F6B3E] text-white'
                      : 'border-white/15 text-white/70 hover:border-white/30',
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
            <input
              id={fid('goal')}
              type="text"
              value={values.goal}
              onChange={onInput('goal')}
              className={cn(inputBase, 'border-white/10')}
              placeholder="Hoặc nhập mục tiêu khác..."
            />
          </div>

          <Field id={fid('healthNote')} label="Tình trạng sức khỏe">
            {(a) => (
              <textarea
                {...a}
                value={values.healthNote}
                onChange={onInput('healthNote')}
                rows={2}
                className={cn(a.className, 'resize-none')}
                placeholder="Bệnh lý, chấn thương..."
              />
            )}
          </Field>

          <Field id={fid('address')} label="Địa chỉ">
            {(a) => (
              <input
                {...a}
                type="text"
                autoComplete="street-address"
                value={values.address}
                onChange={onInput('address')}
                placeholder="TP. Hồ Chí Minh"
              />
            )}
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field id={fid('height')} label="Chiều cao (cm)" error={errors.height}>
              {(a) => (
                <input
                  {...a}
                  type="text"
                  inputMode="decimal"
                  value={values.height}
                  onChange={onInput('height')}
                  placeholder="170"
                />
              )}
            </Field>
            <Field id={fid('weight')} label="Cân nặng (kg)" error={errors.weight}>
              {(a) => (
                <input
                  {...a}
                  type="text"
                  inputMode="decimal"
                  value={values.weight}
                  onChange={onInput('weight')}
                  placeholder="60"
                />
              )}
            </Field>
          </div>

          {error && (
            <p
              role="alert"
              data-testid="member-form-submit-error"
              className="text-error-text text-sm leading-relaxed bg-[#f87171]/10 border border-error-text/30 rounded-xl px-4 py-2.5"
            >
              {error}
            </p>
          )}

          <div className={cn('flex gap-3 mt-1', isMobile && 'flex-col-reverse')}>
            <Button
              variant="secondary"
              onClick={requestClose}
              disabled={submitting}
              data-testid="member-form-cancel"
              className={cn('tap-target hover:scale-100', isMobile ? 'w-full' : 'flex-1')}
            >
              Huỷ
            </Button>
            <Button
              type="submit"
              loading={submitting}
              data-testid="member-form-submit"
              className={cn('tap-target hover:scale-100', isMobile ? 'w-full' : 'flex-1')}
            >
              {mode === 'create' ? 'Tạo hội viên' : 'Lưu thay đổi'}
            </Button>
          </div>
        </form>
      </Overlay>
      {guard.dialog}
    </>
  );
}
