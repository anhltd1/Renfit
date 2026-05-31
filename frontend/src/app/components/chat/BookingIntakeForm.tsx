import React, { useState } from 'react';
import { InlineField } from './InlineField';
import type { IntakeFormData } from './types';

interface BookingIntakeFormProps {
  onSubmit: (data: IntakeFormData) => void;
  disabled?: boolean;
}

export function BookingIntakeForm({ onSubmit, disabled }: BookingIntakeFormProps) {
  const [form, setForm] = useState<IntakeFormData>({
    customer_name: '',
    phone: '',
    date: '',
    time: '',
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
    if (!form.date.trim() || !form.time.trim()) {
      setError('Vui lòng chọn ngày và giờ tập.');
      return;
    }
    setError('');
    onSubmit({
      customer_name: form.customer_name.trim(),
      phone: form.phone.trim(),
      date: form.date.trim(),
      time: form.time.trim(),
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InlineField
          label="Ngày tập:"
          required
          value={form.date}
          onChange={(v) => setForm({ ...form, date: v })}
          type="date"
          disabled={disabled}
        />
        <InlineField
          label="Giờ tập:"
          required
          value={form.time}
          onChange={(v) => setForm({ ...form, time: v })}
          type="time"
          disabled={disabled}
        />
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <button
        type="submit"
        disabled={disabled}
        className="w-full bg-[#0F6B3E] hover:bg-[#0F6B3E]/90 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-xl transition-all duration-300 mt-1"
      >
        Gửi và đặt lịch
      </button>
    </form>
  );
}
