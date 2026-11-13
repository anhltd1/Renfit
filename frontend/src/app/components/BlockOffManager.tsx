/**
 * BlockOffManager — modal/sheet for creating blocked time slots (U12).
 * PT selects individual hours or "full day", enters a reason, and confirms.
 * Warns about existing bookings and offers assisted cancellation.
 */
import { useEffect, useState } from 'react';
import { AlertTriangle, Check, Clock, Loader2, Lock, X } from 'lucide-react';
import { fetchBookings, type AdminBookingSlot } from '../../lib/api/admin';
import { useBlockedSlots } from '../shared/hooks/useBlockedSlots';
import { haptic } from '../shared/primitives/haptics';

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 08–20

interface BlockOffManagerProps {
  date: string;
  preSelectedHour?: number;
  onClose: () => void;
  onDone: () => void;
}

const VIET_DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function getBookingWindowDays(): string[] {
  // Generate the 2-week booking window (Mon this week → Sat next week, no Sundays)
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek === 0 ? 7 : dayOfWeek) - 1));

  const days: string[] = [];
  for (let i = 0; i < 13; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    if (d.getDay() === 0) continue; // skip Sunday
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export function BlockOffManager({ date: initialDate, preSelectedHour, onClose, onDone }: BlockOffManagerProps) {
  const { createBlock } = useBlockedSlots();
  const [date, setDate] = useState(initialDate);
  const [fullDay, setFullDay] = useState(false);
  const [selectedHours, setSelectedHours] = useState<Set<number>>(
    preSelectedHour != null ? new Set([preSelectedHour]) : new Set(),
  );
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [affectedCount, setAffectedCount] = useState(0);
  const [loadingAffected, setLoadingAffected] = useState(false);

  // Check how many bookings would be affected
  useEffect(() => {
    const checkAffected = async () => {
      setLoadingAffected(true);
      try {
        const data = await fetchBookings();
        const day = data.days.find((d) => d.date === date);
        if (!day) { setAffectedCount(0); return; }
        const hoursToCheck = fullDay ? new Set(HOURS) : selectedHours;
        let count = 0;
        day.slots.forEach((slot: AdminBookingSlot) => {
          if (hoursToCheck.has(slot.hour)) {
            count += slot.bookings.filter((b) => b.status === 'approved' || b.status === 'pending').length;
          }
        });
        setAffectedCount(count);
      } catch {
        setAffectedCount(0);
      } finally {
        setLoadingAffected(false);
      }
    };
    if (fullDay || selectedHours.size > 0) {
      checkAffected();
    } else {
      setAffectedCount(0);
    }
  }, [date, fullDay, selectedHours]);

  const toggleHour = (h: number) => {
    setSelectedHours((prev) => {
      const next = new Set(prev);
      if (next.has(h)) next.delete(h);
      else next.add(h);
      return next;
    });
  };

  const handleSubmit = async () => {
    const hours = fullDay ? 'all' as const : Array.from(selectedHours).sort();
    if (!fullDay && hours.length === 0) return;
    setSubmitting(true);
    haptic();
    try {
      await createBlock(date, hours, reason);
      onDone();
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  };

  const fmtDate = (iso: string) => {
    const [, m, d] = iso.split('-');
    return `${d}/${m}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-overlay border border-white/12 rounded-panel w-full max-w-sm shadow-2xl p-5 flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary-text" />
            <h3 className="text-white font-bold text-base">Chặn giờ</h3>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng" className="text-white/64 hover:text-white transition-colors tap-target inline-flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Date selector */}
        <div>
          <p className="text-white/64 text-xs mb-2">Chọn ngày:</p>
          <div className="grid grid-cols-4 gap-1.5 max-h-[120px] overflow-y-auto">
            {getBookingWindowDays().map((d) => {
              const [, m, dd] = d.split('-');
              const dow = VIET_DAYS[new Date(d).getDay()];
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDate(d)}
                  className={`py-2 px-1 tap-target rounded-lg text-xs font-medium transition-all text-center ${
                    date === d
                      ? 'bg-primary text-white'
                      : 'bg-white/5 text-white/64 border border-line hover:border-white/20'
                  }`}
                >
                  <span className="block">{dow}</span>
                  <span className="block text-xs mt-0.5">{dd}/{m}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Full day toggle */}
        <label className="flex items-center gap-3 cursor-pointer tap-target py-2">
          <input
            type="checkbox"
            checked={fullDay}
            onChange={(e) => setFullDay(e.target.checked)}
            className="w-4 h-4 rounded border-white/20 bg-white/5 accent-[#0F6B3E] focus:ring-primary-text"
          />
          <span className="text-white/80 text-sm">Chặn cả ngày</span>
        </label>

        {/* Hour selector */}
        {!fullDay && (
          <div>
            <p className="text-white/64 text-xs mb-2">Chọn giờ cần chặn:</p>
            <div className="grid grid-cols-4 gap-1.5">
              {HOURS.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => toggleHour(h)}
                  className={`py-2 tap-target rounded-lg text-xs font-medium tabular-nums transition-all ${
                    selectedHours.has(h)
                      ? 'bg-primary text-white'
                      : 'bg-white/5 text-white/64 border border-line hover:border-white/20'
                  }`}
                >
                  {String(h).padStart(2, '0')}:00
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Reason */}
        <div>
          <p className="text-white/64 text-xs mb-1.5">Lý do (tùy chọn):</p>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="VD: Bảo trì thiết bị, nghỉ lễ..."
            className="w-full bg-white/5 border border-line rounded-control px-3 py-2.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-[#3DBE7A] transition-colors"
          />
        </div>

        {/* Affected bookings warning */}
        {affectedCount > 0 && !loadingAffected && (
          <div className="bg-amber-500/10 border border-amber-400/25 rounded-control px-4 py-3 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-warning-text shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-200 text-sm font-medium">
                {affectedCount} lịch đặt sẽ bị ảnh hưởng
              </p>
              <p className="text-amber-200/60 text-xs mt-0.5">
                Sau khi chặn, bạn có thể hủy các lịch này từ giao diện quản lý.
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 bg-surface-2 hover:bg-surface-3 border border-line-strong text-white py-2.5 rounded-control text-sm transition-all">
            Huỷ
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || (!fullDay && selectedHours.size === 0)}
            className="flex-1 py-2.5 rounded-control text-sm font-semibold text-white bg-primary hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Chặn giờ'}
          </button>
        </div>
      </div>
    </div>
  );
}
