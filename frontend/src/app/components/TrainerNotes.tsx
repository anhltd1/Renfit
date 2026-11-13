/**
 * TrainerNotes — PT's notes section for a customer.
 * Shows timestamped notes with ability to add new ones and delete existing.
 * Used in both desktop CustomerDetail and mobile CustomerDetailScreen.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { ClipboardList, Loader2, Send, Trash2 } from 'lucide-react';
import { addNote, deleteNote, fetchNotes, type TrainerNote } from '../../lib/api/admin';
import { useToast } from '../shared/hooks/useToast';
import { useUndoableAction } from '../shared/hooks/useUndoableAction';

interface TrainerNotesProps {
  customerId: string;
  /**
   * Rendered inside a tab/panel that already provides the title, padding and
   * borders (desktop member detail). Hides the section header and the own
   * padding/border, and lets the list grow with the panel's scroll.
   */
  embedded?: boolean;
}

function fmtDate(iso: string): string {
  try {
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(2);
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yy} · ${hh}:${min}`;
  } catch {
    return iso;
  }
}

export function TrainerNotes({ customerId, embedded = false }: TrainerNotesProps) {
  const [notes, setNotes] = useState<TrainerNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  // Note that has been deleted server-side and is animating out.
  const [leaving, setLeaving] = useState<string | null>(null);
  const { show, node: toastNode } = useToast();
  const { run } = useUndoableAction(show);
  const currentCustomer = useRef(customerId);
  currentCustomer.current = customerId;

  const load = useCallback(async () => {
    try {
      const data = await fetchNotes(customerId);
      setNotes(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    setLoading(true);
    setNotes([]);
    setContent('');
    load();
  }, [load]);

  const handleAdd = async () => {
    if (!content.trim() || submitting) return;
    setSubmitting(true);
    try {
      const note = await addNote(customerId, content.trim());
      setNotes((prev) => [note, ...prev]);
      setContent('');
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  };

  // U21 (FR-3): delete is one tap + 5 s undo toast. Undo re-creates the note
  // with the same text (new id/timestamp — the API has no "restore").
  const handleDelete = async (note: TrainerNote) => {
    const ownerId = customerId;
    setDeleting(note.id);
    try {
      await run({
        action: async () => {
          await deleteNote(ownerId, note.id);
          // Animate out only after the server confirms — a failed delete must
          // leave the note visibly intact.
          setLeaving(note.id);
          await new Promise((resolve) => setTimeout(resolve, 150));
          setNotes((prev) => prev.filter((n) => n.id !== note.id));
        },
        undo: async () => {
          const restored = await addNote(ownerId, note.content);
          // The user may have switched member while the toast was up.
          if (currentCustomer.current !== ownerId) return;
          setNotes((prev) =>
            [restored, ...prev].sort((a, b) => b.created_at.localeCompare(a.created_at)),
          );
        },
        successText: 'Đã xoá ghi chú.',
        undoneText: 'Đã khôi phục ghi chú.',
        errorText: 'Không thể xoá ghi chú. Vui lòng thử lại.',
      });
    } finally {
      setLeaving(null);
      setDeleting(null);
    }
  };

  return (
    <div className={embedded ? '' : 'px-4 py-4 border-b border-line'} data-testid="trainer-notes">
      {/* Header (the tab provides the title when embedded) */}
      {!embedded && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-primary-text" />
            <h3 className="text-white font-bold text-sm">Ghi chú HLV</h3>
            {notes.length > 0 && (
              <span className="text-white/64 text-xs">{notes.length} ghi chú</span>
            )}
          </div>
        </div>
      )}

      {/* Add note input */}
      <div className="flex gap-2 mb-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Ghi chú về hội viên (tiến bộ, cần cải thiện...)"
          rows={2}
          className="flex-1 bg-white/5 border border-line rounded-control px-4 py-3 text-white text-sm placeholder:text-white/40 resize-none outline-none focus:border-[#3DBE7A] transition-colors leading-relaxed"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              handleAdd();
            }
          }}
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!content.trim() || submitting}
          className="self-end px-4 py-3 bg-primary hover:bg-primary-hover active:scale-[0.96] disabled:opacity-40 disabled:active:scale-100 disabled:cursor-not-allowed text-white rounded-control transition-all duration-[var(--motion-fast)] shrink-0"
          title="Thêm ghi chú (Ctrl+Enter)"
          aria-label="Thêm ghi chú"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>

      {/* Notes list */}
      {loading ? (
        <div className="flex items-center justify-center py-6 text-white/64">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center py-6 text-white/64 gap-1.5">
          <ClipboardList className="w-6 h-6" />
          <p className="text-sm">Chưa có ghi chú nào.</p>
          <p className="text-xs text-white/64">Ghi lại tiến bộ hoặc lưu ý cho hội viên này.</p>
        </div>
      ) : (
        <div className={embedded ? 'space-y-2' : 'space-y-2 max-h-[300px] overflow-y-auto pr-1'}>
          {notes.map((note, i) => (
            <div
              key={note.id}
              className={`bg-white/[0.03] border border-line rounded-control px-4 py-3 group relative ${
 leaving === note.id ? 'animate-row-leave' : 'animate-fade-up'
 }`}
              // Stagger capped at 8 items — beyond that the tail of a long list
              // would visibly lag behind the rest.
              style={{ '--stagger': Math.min(i, 7) } as React.CSSProperties}
            >
              <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">
                {note.content}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-white/64 text-xs">{fmtDate(note.created_at)}</span>
                <button
                  type="button"
                  onClick={() => handleDelete(note)}
                  disabled={deleting === note.id}
                  className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 text-white/64 hover:text-error-text transition-all tap-target inline-flex items-center justify-center rounded"
                  title="Xóa ghi chú"
                  aria-label="Xóa ghi chú"
                >
                  {deleting === note.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {toastNode}
    </div>
  );
}
