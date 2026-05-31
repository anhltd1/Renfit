import React, { useState } from 'react';
import { InlineField } from './InlineField';
import type { CustomerFormData } from './types';

interface CustomerInfoFormProps {
  onSubmit: (data: CustomerFormData) => void;
  disabled?: boolean;
}

export function CustomerInfoForm({ onSubmit, disabled }: CustomerInfoFormProps) {
  const [form, setForm] = useState<CustomerFormData>({
    customer_name: '',
    phone: '',
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
    if (!form.phone.trim()) {
      setError('Vui lòng nhập số điện thoại.');
      return;
    }
    setError('');
    onSubmit({
      customer_name: form.customer_name.trim(),
      phone: form.phone.trim(),
      goal: form.goal.trim(),
      health_note: form.health_note.trim(),
      note: form.note.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3">
      <InlineField
        label="Tên bạn là:"
        required
        value={form.customer_name}
        onChange={(v) => setForm({ ...form, customer_name: v })}
        placeholder="Nguyễn Văn An"
        disabled={disabled}
      />
      <InlineField
        label="Số điện thoại của bạn:"
        required
        value={form.phone}
        onChange={(v) => setForm({ ...form, phone: v })}
        placeholder="0901234567"
        type="tel"
        disabled={disabled}
      />
      <InlineField
        label="Mục tiêu tập luyện:"
        value={form.goal}
        onChange={(v) => setForm({ ...form, goal: v })}
        placeholder="Giảm cân, tăng cơ..."
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
