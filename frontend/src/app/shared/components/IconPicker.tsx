import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../primitives/cn';
import { ICON_ALLOWLIST, resolveIcon } from '../../../lib/icons/iconAllowlist';

export interface IconPickerProps {
  value: string;
  onChange: (val: string) => void;
  label?: string;
  disabled?: boolean;
}

export function IconPicker({ value, onChange, label, disabled }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const SelectedIcon = resolveIcon(value);
  const selectedEntry = ICON_ALLOWLIST.find((e) => e.name === value);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className="w-full space-y-1" ref={containerRef}>
      {label && (
        <label className="block text-white/60 text-sm leading-relaxed">{label}</label>
      )}

      {/* Trigger button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-2 rounded-2xl bg-white/5 border border-white/10',
          'px-4 py-3 text-white transition-colors duration-300',
          'hover:border-[#0F6B3E] focus:outline-none focus:border-[#0F6B3E]',
          'disabled:opacity-60 disabled:cursor-not-allowed',
        )}
      >
        {SelectedIcon ? (
          <>
            <SelectedIcon className="w-5 h-5 text-[#0F6B3E]" />
            <span className="text-sm leading-relaxed">{selectedEntry?.label}</span>
          </>
        ) : (
          <span className="text-sm text-white/40 leading-relaxed">Không có icon</span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className={cn(
            'absolute z-50 mt-1 w-72 max-h-64 overflow-y-auto',
            'bg-[#1a1a1a] border border-white/10 rounded-2xl p-2',
            'shadow-xl',
          )}
        >
          {/* No icon option */}
          <button
            type="button"
            onClick={() => { onChange(''); setOpen(false); }}
            className={cn(
              'flex items-center gap-2 w-full px-3 py-2 rounded-xl text-left',
              'hover:bg-white/5 transition-colors',
              !value && 'bg-white/10',
            )}
          >
            <X className="w-5 h-5 text-white/40" />
            <span className="text-sm text-white/60 leading-relaxed">Không có icon</span>
          </button>

          {/* Icon grid */}
          <div className="grid grid-cols-4 gap-1 mt-1">
            {ICON_ALLOWLIST.map((entry) => {
              const Icon = entry.icon;
              const isSelected = value === entry.name;
              return (
                <button
                  key={entry.name}
                  type="button"
                  onClick={() => { onChange(entry.name); setOpen(false); }}
                  title={entry.label}
                  className={cn(
                    'flex flex-col items-center gap-1 p-2 rounded-xl transition-colors',
                    'hover:bg-white/10',
                    isSelected && 'bg-[#0F6B3E]/20 border border-[#0F6B3E]/30',
                  )}
                >
                  <Icon className="w-5 h-5 text-white/80" />
                  <span className="text-[10px] text-white/50 leading-relaxed truncate w-full text-center">
                    {entry.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
