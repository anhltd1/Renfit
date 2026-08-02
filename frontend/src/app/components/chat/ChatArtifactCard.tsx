import React, { useState } from 'react';
import { CalendarCheck, CalendarX, ChevronDown, Loader2, Sparkles, User, X } from 'lucide-react';
import type { ChatArtifact } from '../../../lib/api/chat';
import { cancelBooking, createBooking } from '../../../lib/api/bookings';

/**
 * Renders a panel from the latest tool result. Profile/InBody artifacts are
 * read-only (editing happens on the Profile page). The booking availability
 * artifact is interactive — clicking an open slot books it directly via the
 * REST booking API, no extra round trip through the AI needed.
 */
interface ChatArtifactCardProps {
  artifact: ChatArtifact;
  customerId?: string | null;
  /**
   * Called after a booking action (book/cancel) triggered directly from the
   * artifact succeeds. The chat panel appends this as a new assistant
   * message so the conversation always ends with a clear confirmation,
   * instead of the slot silently disappearing from the card.
   */
  onBookingAction?: (message: string, artifact: ChatArtifact) => void;
}

/** '2026-07-11T13:00' -> '13:00 ngày 11/07' */
function formatSlotLabel(time: string): string {
  const [datePart, hourPart] = time.split('T');
  if (!datePart || !hourPart) return time;
  const parts = datePart.split('-');
  if (parts.length !== 3) return time;
  const [, month, day] = parts;
  return `${hourPart} ngày ${day}/${month}`;
}

const cardClass =
  'mt-3 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden';
const headerClass =
  'flex items-center gap-2 px-4 py-2.5 border-b border-white/10 bg-white/[0.03]';
const labelClass = 'text-white/50 text-xs';
const valueClass = 'text-white text-sm font-medium';

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className={labelClass}>{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}

function ChangeBadge({ value, unit }: { value: number | undefined; unit: string }) {
  if (value === undefined || value === null) return null;
  const positive = value > 0;
  const zero = value === 0;
  const color = zero ? 'text-white/50' : positive ? 'text-red-400' : 'text-emerald-400';
  const arrow = zero ? '' : positive ? '▲' : '▼';
  return (
    <span className={`text-xs font-semibold tabular-nums ${color}`}>
      {arrow} {Math.abs(value).toFixed(1)} {unit}
    </span>
  );
}

function ProfileArtifact({ data }: { data: Record<string, any> }) {
  const customer = data.customer ?? {};
  if (!data.found) {
    return (
      <p className="px-4 py-3 text-white/60 text-sm">
        Chưa tìm thấy hồ sơ của bạn trong hệ thống.
      </p>
    );
  }
  return (
    <div className="px-4 py-3">
      <Row label="Họ tên" value={customer.customer_name} />
      <Row label="Số điện thoại" value={customer.phone} />
      <Row label="Mục tiêu" value={customer.goal} />
      <Row label="Chiều cao" value={customer.height ? `${customer.height} cm` : ''} />
      <Row label="Cân nặng" value={customer.weight ? `${customer.weight} kg` : ''} />
      <Row label="Tuổi" value={customer.age} />
      <Row label="Ghi chú sức khỏe" value={customer.health_note} />
      <p className="text-white/30 text-[11px] mt-2 leading-relaxed">
        Muốn cập nhật thông tin? Vào trang{' '}
        <span className="text-[#0F6B3E]">Hồ sơ</span> để chỉnh sửa nhé.
      </p>
    </div>
  );
}

function InbodyProgressArtifact({ data }: { data: Record<string, any> }) {
  const latest = data.latest;
  const progress = data.progress_since_first_record ?? {};
  const recordCount = data.record_count ?? 0;

  if (!recordCount || !latest) {
    return (
      <p className="px-4 py-3 text-white/60 text-sm">
        Bạn chưa có số liệu InBody nào — hãy đặt lịch để HLV đo cho bạn nhé!
      </p>
    );
  }

  return (
    <div className="px-4 py-3">
      <p className="text-white/40 text-xs mb-2">
        Lần đo gần nhất: {latest.date_recorded} · {recordCount} lần đo
      </p>
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <p className="text-white text-lg font-bold">{latest.weight}</p>
          <p className="text-white/40 text-[11px] mb-1">kg — Cân nặng</p>
          <ChangeBadge value={progress.weight_change} unit="kg" />
        </div>
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <p className="text-white text-lg font-bold">{latest.SMM}</p>
          <p className="text-white/40 text-[11px] mb-1">kg — Khối cơ (SMM)</p>
          <ChangeBadge value={progress.SMM_change} unit="kg" />
        </div>
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <p className="text-white text-lg font-bold">{latest.BFM}</p>
          <p className="text-white/40 text-[11px] mb-1">kg — Khối mỡ (BFM)</p>
          <ChangeBadge value={progress.BFM_change} unit="kg" />
        </div>
      </div>
    </div>
  );
}

type OpenDay = { date: string; weekday: string; open_hours: string[] };
type MyBooking = { booking_id: string; time: string; status: string };

const STATUS_LABEL: Record<string, string> = {
  pending: 'Chờ xác nhận',
  approved: 'Đã xác nhận',
};

/** Interactive — clicking an open hour books it immediately via REST. */
function BookingAvailabilityArtifact({
  data,
  customerId,
  onBookingAction,
}: {
  data: Record<string, any>;
  customerId?: string | null;
  onBookingAction?: (message: string, artifact: ChatArtifact) => void;
}) {
  const [days, setDays] = useState<OpenDay[]>(data.days_with_open_slots ?? []);
  const [myBookings, setMyBookings] = useState<MyBooking[]>(data.my_upcoming_bookings ?? []);
  const [showMyBookings, setShowMyBookings] = useState(false);
  const [pendingSlot, setPendingSlot] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const dateInRange = data.date_in_range !== false;
  const windowStart = data.window_start as string | undefined;
  const windowEnd = data.window_end as string | undefined;

  const handleBook = async (date: string, hour: string) => {
    if (!customerId || pendingSlot || done) return;
    const time = `${date}T${hour}`;
    setPendingSlot(time);
    setActionError(null);
    try {
      const result = await createBooking(customerId, time);
      setMyBookings((prev) => [
        ...prev,
        { booking_id: result.booking_id, time, status: 'pending' },
      ]);
      setDays((prev) =>
        prev
          .map((d) =>
            d.date === date ? { ...d, open_hours: d.open_hours.filter((h) => h !== hour) } : d,
          )
          .filter((d) => d.open_hours.length > 0),
      );
      setDone(true);
      onBookingAction?.(
        `Đã đặt lịch tập lúc ${formatSlotLabel(time)} thành công, đang chờ HLV xác nhận!`,
        { kind: 'booking_confirmation', title: 'Đã đặt lịch tập', data: { time } },
      );
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Đặt lịch thất bại.');
    } finally {
      setPendingSlot(null);
    }
  };

  const handleCancel = async (bookingId: string) => {
    if (!customerId || !bookingId || pendingSlot || done) return;
    setPendingSlot(bookingId);
    setActionError(null);
    try {
      const cancelled = myBookings.find((b) => b.booking_id === bookingId);
      await cancelBooking(customerId, bookingId);
      setMyBookings((prev) => prev.filter((b) => b.booking_id !== bookingId));
      setDone(true);
      onBookingAction?.(
        cancelled
          ? `Đã hủy lịch tập lúc ${formatSlotLabel(cancelled.time)}.`
          : 'Đã hủy lịch tập.',
        { kind: 'booking_cancelled', title: 'Đã hủy lịch tập', data: {} },
      );
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Hủy lịch thất bại.');
    } finally {
      setPendingSlot(null);
    }
  };

  return (
    <div className="px-4 py-3 space-y-3">
      {myBookings.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowMyBookings((v) => !v)}
            className="flex items-center gap-1.5 text-white/50 text-xs hover:text-white/80 transition-colors"
          >
            Bạn có {myBookings.length} lịch tập sắp tới
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${showMyBookings ? 'rotate-180' : ''}`}
            />
          </button>
          {showMyBookings && (
            <div className="space-y-1.5 mt-1.5">
              {myBookings.map((b) => (
                <div
                  key={b.booking_id || b.time}
                  className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-1.5"
                >
                  <span className="text-white text-sm">{b.time.replace('T', ' ')}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-medium ${
                        b.status === 'approved' ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {STATUS_LABEL[b.status] ?? b.status}
                    </span>
                    {b.booking_id && (
                      <button
                        type="button"
                        onClick={() => handleCancel(b.booking_id)}
                        disabled={pendingSlot === b.booking_id}
                        className="text-white/30 hover:text-red-400 transition-colors disabled:opacity-40"
                        title="Hủy lịch"
                        aria-label="Hủy lịch"
                      >
                        {pendingSlot === b.booking_id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <X className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className={done ? 'opacity-40 pointer-events-none' : ''}>
        {!dateInRange ? (
          <p className="text-white/40 text-sm">
            Ngày này nằm ngoài thời gian có thể đặt lịch
            {windowStart && windowEnd ? ` (chỉ mở từ ${windowStart} đến ${windowEnd})` : ''}.
          </p>
        ) : days.length === 0 ? (
          <p className="text-white/40 text-sm">Không còn khung giờ trống.</p>
        ) : (
          <div className="space-y-2.5">
            {days.map((d) => (
              <div key={d.date}>
                <p className="text-white/50 text-xs mb-1.5">
                  {d.weekday} {d.date.slice(5)}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {d.open_hours.map((h) => {
                    const time = `${d.date}T${h}`;
                    const isPending = pendingSlot === time;
                    return (
                      <button
                        key={h}
                        type="button"
                        onClick={() => handleBook(d.date, h)}
                        disabled={!customerId || pendingSlot !== null || done}
                        className="text-[#0F6B3E] bg-[#0F6B3E]/10 border border-[#0F6B3E]/30 rounded-lg px-2.5 py-1 text-xs font-medium hover:bg-[#0F6B3E]/25 hover:border-[#0F6B3E] transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1"
                      >
                        {isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                        {h}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {actionError && <p className="text-red-400 text-xs">{actionError}</p>}
      {done ? (
        <p className="text-white/30 text-[11px]">Xem xác nhận ở tin nhắn mới nhất bên dưới ↓</p>
      ) : (
        <p className="text-white/30 text-[11px]">Nhấn vào giờ trống để đặt lịch ngay.</p>
      )}
    </div>
  );
}

function BookingConfirmationArtifact({ data }: { data: Record<string, any> }) {
  const time = String(data.time ?? '').replace('T', ' ');
  return (
    <div className="px-4 py-3">
      <Row label="Thời gian" value={time} />
      <Row label="Trạng thái" value="Chờ HLV xác nhận" />
    </div>
  );
}

function BookingCancelledArtifact({ data }: { data: Record<string, any> }) {
  return (
    <div className="px-4 py-3">
      <p className="text-white/70 text-sm">{data.message ?? 'Lịch tập đã được hủy.'}</p>
    </div>
  );
}

const ARTIFACT_ICON: Record<ChatArtifact['kind'], React.ComponentType<{ className?: string }>> = {
  profile: User,
  inbody_progress: Sparkles,
  booking_availability: CalendarCheck,
  booking_confirmation: CalendarCheck,
  booking_cancelled: CalendarX,
};

export function ChatArtifactCard({ artifact, customerId, onBookingAction }: ChatArtifactCardProps) {
  const Icon = ARTIFACT_ICON[artifact.kind] ?? Sparkles;

  return (
    <div className={cardClass}>
      <div className={headerClass}>
        <Icon className="w-4 h-4 text-[#0F6B3E]" />
        <span className="text-white text-sm font-semibold">{artifact.title}</span>
      </div>
      {artifact.kind === 'profile' && <ProfileArtifact data={artifact.data} />}
      {artifact.kind === 'inbody_progress' && <InbodyProgressArtifact data={artifact.data} />}
      {artifact.kind === 'booking_availability' && (
        <BookingAvailabilityArtifact
          data={artifact.data}
          customerId={customerId}
          onBookingAction={onBookingAction}
        />
      )}
      {artifact.kind === 'booking_confirmation' && (
        <BookingConfirmationArtifact data={artifact.data} />
      )}
      {artifact.kind === 'booking_cancelled' && <BookingCancelledArtifact data={artifact.data} />}
    </div>
  );
}
