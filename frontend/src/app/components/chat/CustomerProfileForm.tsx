import React, { useState } from 'react';
import { InlineField } from './InlineField';
import type { CustomerProfileFormData } from './types';

interface CustomerProfileFormProps {
  defaultCustomerName?: string;
  onSubmit: (data: CustomerProfileFormData) => void;
  disabled?: boolean;
}

export function CustomerProfileForm({
  defaultCustomerName = '',
  onSubmit,
  disabled,
}: CustomerProfileFormProps) {
  const [form, setForm] = useState<CustomerProfileFormData>({
    customer_name: defaultCustomerName,
    height: '',
    weight: '',
    goal: '',
    health_note: '',
    note: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_name.trim()) {
      setError('Vui lòng nhập họ tên.');
      return;
    }
    const hasAny =
      form.height.trim() ||
      form.weight.trim() ||
      form.goal.trim() ||
      form.health_note.trim() ||
      form.note.trim();
    if (!hasAny) {
      setError('Vui lòng điền ít nhất một mục (chiều cao, cân nặng, mục tiêu...).');
      return;
    }
    setError('');
    onSubmit({
      customer_name: form.customer_name.trim(),
      height: form.height.trim(),
      weight: form.weight.trim(),
      goal: form.goal.trim(),
      health_note: form.health_note.trim(),
      note: form.note.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3">
      {!defaultCustomerName && (
        <InlineField
          label="Họ tên của bạn:"
          required
          value={form.customer_name}
          onChange={(v) => setForm({ ...form, customer_name: v })}
          placeholder="Nguyễn Văn An"
          disabled={disabled}
        />
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InlineField
          label="Chiều cao (cm):"
          value={form.height}
          onChange={(v) => setForm({ ...form, height: v })}
          placeholder="170"
          disabled={disabled}
        />
        <InlineField
          label="Cân nặng (kg):"
          value={form.weight}
          onChange={(v) => setForm({ ...form, weight: v })}
          placeholder="65"
          disabled={disabled}
        />
      </div>
      <InlineField
        label="Mục tiêu tập luyện:"
        value={form.goal}
        onChange={(v) => setForm({ ...form, goal: v })}
        placeholder="Giảm mỡ, tăng cơ, sức khỏe..."
        disabled={disabled}
      />
      <InlineField
        label="Ghi chú sức khỏe:"
        value={form.health_note}
        onChange={(v) => setForm({ ...form, health_note: v })}
        placeholder="Chấn thương, bệnh nền... (tuỳ chọn)"
        disabled={disabled}
      />
      <InlineField
        label="Ghi chú khác:"
        value={form.note}
        onChange={(v) => setForm({ ...form, note: v })}
        placeholder="Tuỳ chọn"
        disabled={disabled}
      />
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <button
        type="submit"
        disabled={disabled}
        className="w-full bg-[#0F6B3E] hover:bg-[#0F6B3E]/90 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-xl transition-all duration-300 mt-1"
      >
        Gửi thông tin
      </button>
    </form>
  );
}
