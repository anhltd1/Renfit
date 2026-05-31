import React, { useState } from 'react';
import { InlineField } from './InlineField';
import type { BookingFormData } from './types';

interface BookingFormProps {
  onSubmit: (data: BookingFormData) => void;
  disabled?: boolean;
  defaultCustomerName?: string;
}

export function BookingForm({ onSubmit, disabled, defaultCustomerName = '' }: BookingFormProps) {
  const [form, setForm] = useState<BookingFormData>({
    customer_name: defaultCustomerName,
    date: '',
    time: '',
    note: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_name.trim()) {
      setError('Vui lòng nhập họ tên.');
      return;
    }
    setError('');
    onSubmit({
      customer_name: form.customer_name.trim(),
      date: form.date.trim(),
      time: form.time.trim(),
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InlineField
          label="Ngày tập:"
          value={form.date}
          onChange={(v) => setForm({ ...form, date: v })}
          type="date"
          disabled={disabled}
        />
        <InlineField
          label="Giờ tập:"
          value={form.time}
          onChange={(v) => setForm({ ...form, time: v })}
          type="time"
          disabled={disabled}
        />
      </div>
      <InlineField
        label="Ghi chú thêm:"
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
        Xác nhận đặt lịch
      </button>
    </form>
  );
}
