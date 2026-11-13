import React from 'react';
import { ChevronUp, ChevronDown, Trash2, Plus } from 'lucide-react';
import { Button } from '../primitives/Button';
import { cn } from '../primitives/cn';

export interface ListFieldEditorProps<T> {
  items: T[];
  onChange: (items: T[]) => void;
  renderItem: (item: T, index: number, onChange: (updated: T) => void) => React.ReactNode;
  createItem: () => T;
  label?: string;
  addLabel?: string;
  disabled?: boolean;
}

export function ListFieldEditor<T>({
  items,
  onChange,
  renderItem,
  createItem,
  label,
  addLabel = 'Thêm',
  disabled,
}: ListFieldEditorProps<T>) {
  const handleItemChange = (index: number, updated: T) => {
    const next = [...items];
    next[index] = updated;
    onChange(next);
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const next = [...items];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onChange(next);
  };

  const handleMoveDown = (index: number) => {
    if (index >= items.length - 1) return;
    const next = [...items];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    onChange(next);
  };

  const handleRemove = (index: number) => {
    if (!window.confirm('Bạn có chắc muốn xoá?')) return;
    const next = items.filter((_, i) => i !== index);
    onChange(next);
  };

  const handleAdd = () => {
    onChange([...items, createItem()]);
  };

  return (
    <div className="w-full space-y-3">
      {label && (
        <label className="block text-white/64 text-sm leading-relaxed">{label}</label>
      )}

      {items.length === 0 ? (
        <p className="text-white/40 text-sm leading-relaxed">Chưa có mục nào</p>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className={cn(
                'rounded-control border border-line bg-white/[0.02] p-4',
                'space-y-3',
              )}
            >
              {/* Item content */}
              {renderItem(item, index, (updated) => handleItemChange(index, updated))}

              {/* Action buttons */}
              <div className="flex items-center gap-1 pt-2 border-t border-white/5">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={disabled || index === 0}
                  onClick={() => handleMoveUp(index)}
                  aria-label="Di chuyển lên"
                >
                  <ChevronUp className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={disabled || index === items.length - 1}
                  onClick={() => handleMoveDown(index)}
                  aria-label="Di chuyển xuống"
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
                <div className="flex-1" />
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={disabled}
                  onClick={() => handleRemove(index)}
                  aria-label="Xoá"
                >
                  <Trash2 className="w-4 h-4 text-error-text" />
                  <span className="text-error-text leading-relaxed">Xoá</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Button
        variant="ghost"
        size="sm"
        disabled={disabled}
        onClick={handleAdd}
      >
        <Plus className="w-4 h-4" />
        <span className="leading-relaxed">{addLabel}</span>
      </Button>
    </div>
  );
}
