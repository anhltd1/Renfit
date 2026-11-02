import React from 'react';
import { Eye } from 'lucide-react';
import { Button } from '../primitives/Button';
import { cn } from '../primitives/cn';

export interface CmsActionBarProps {
  onSave: () => void;
  onPreview: () => void;
  onPublish: () => void;
  isDirty: boolean;
  saving: boolean;
  publishing: boolean;
}

export function CmsActionBar({
  onSave,
  onPreview,
  onPublish,
  isDirty,
  saving,
  publishing,
}: CmsActionBarProps) {
  const handlePublish = () => {
    if (!window.confirm('Bạn có chắc muốn xuất bản nội dung này?')) return;
    onPublish();
  };

  return (
    <div className={cn(
      'flex items-center gap-2',
      'sticky top-0 z-40 py-3 px-1 bg-[#0B0B0B]',
    )}>
      {/* Save draft */}
      <div className="relative flex items-center">
        <Button
          variant="secondary"
          size="sm"
          onClick={onSave}
          loading={saving}
          disabled={saving || publishing}
        >
          <span className="leading-relaxed">Lưu nháp</span>
        </Button>
        {isDirty && (
          <span
            className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#0F6B3E] rounded-full"
            aria-label="Có thay đổi chưa lưu"
          />
        )}
      </div>

      {/* Preview */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onPreview}
        disabled={saving || publishing}
      >
        <Eye className="w-4 h-4" />
        <span className="leading-relaxed">Xem trước</span>
      </Button>

      {/* Publish */}
      <Button
        variant="primary"
        size="sm"
        onClick={handlePublish}
        loading={publishing}
        disabled={saving || publishing}
      >
        <span className="leading-relaxed">Xuất bản</span>
      </Button>
    </div>
  );
}
