import React from 'react';

const inputClass =
  'flex-1 min-w-0 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:border-[#0F6B3E] transition-colors text-sm leading-relaxed';

interface InlineFieldProps {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'tel' | 'date' | 'time';
  disabled?: boolean;
}

export function InlineField({
  label,
  required,
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled,
}: InlineFieldProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
      <label className="text-white/90 text-sm shrink-0 sm:min-w-[10rem]">
        {label}
        {required && <span className="text-[#0F6B3E] ml-0.5">*</span>}
      </label>
      <input
        type={type}
        className={inputClass}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  );
}
