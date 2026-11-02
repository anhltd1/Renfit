/**
 * Desktop admin customer detail panel (U5 Trainer Desktop, DL-1/EXT-1).
 * No `onBack` prop — that was mobile-only in the combined component; on
 * desktop both panes (sidebar + detail) are always visible.
 *
 * Calm layout: ONE column. A compact header (identity, quick facts, goal,
 * attendance, actions, and a health callout only when there is something to
 * flag) stays pinned; below it two tabs — "Chỉ số InBody" and "Ghi chú" —
 * show one section at a time instead of stacking notes + four charts.
 */
import { useRef, useState } from 'react';
import { Activity, Archive, Loader2, Pencil, Phone, User } from 'lucide-react';
import type { CustomerSummary } from '../../../lib/api/admin';
import { archiveMember, restoreMember } from '../../../lib/api/admin';
import { useToast } from '../../shared/hooks/useToast';
import { ConfirmDialog } from '../../shared/components/ConfirmDialog';
import { InbodySection } from './InbodySection';
import { TrainerNotes } from '../../components/TrainerNotes';
import { MemberFormModal } from '../../components/MemberFormModal';
import { AttendanceSummary } from '../../shared/clients/AttendanceSummary';
import {
  DETAIL_SECTIONS,
  DETAIL_SECTION_LABELS,
  useDetailSection,
  type DetailSection,
} from '../../shared/clients/detailSection';
import { normalizeVi } from '../../shared/text/normalizeVi';

export interface CustomerDetailProps {
  customer: CustomerSummary;
  onRefresh?: () => void;
}

/** "Không có" / "-" / "none" are not something a PT needs a callout for. */
const NO_CONCERN = new Set(['', 'khong', 'khong co', 'khong can', 'none', 'n/a', 'na', '-']);
function hasHealthConcern(note: string | undefined): note is string {
  return !!note && !NO_CONCERN.has(normalizeVi(note));
}

function Dot() {
  return (
    <span className="text-white/40" aria-hidden="true">
      ·
    </span>
  );
}

export function CustomerDetail({ customer, onRefresh }: CustomerDetailProps) {
  const [editing, setEditing] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [statusBusy, setStatusBusy] = useState(false);
  const [section, setSection] = useDetailSection();
  const tabRefs = useRef<Partial<Record<DetailSection, HTMLButtonElement | null>>>({});
  const { show, node: toastNode } = useToast();
  const archived = customer.active === false;

  // U21 (FR-3): archive asks first (ConfirmDialog), restore is direct. Both
  // report success/failure via toast — never an unhandled rejection.
  const setActive = async (active: boolean) => {
    const name = customer.id;
    setStatusBusy(true);
    try {
      if (active) await restoreMember(name);
      else await archiveMember(name);
      show({ kind: 'ok', text: active ? `Đã khôi phục ${name}.` : `Đã chuyển ${name} sang Đã nghỉ.` });
      setConfirmArchive(false);
      onRefresh?.();
    } catch (e) {
      show({
        kind: 'err',
        text:
          e instanceof Error && e.message
            ? e.message
            : active
              ? 'Không thể khôi phục hội viên. Vui lòng thử lại.'
              : 'Không thể chuyển hội viên sang Đã nghỉ. Vui lòng thử lại.',
      });
      setConfirmArchive(false);
    } finally {
      setStatusBusy(false);
    }
  };

  // Arrow keys move between tabs (WAI-ARIA tabs pattern).
  const onTabKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const step = e.key === 'ArrowRight' ? 1 : -1;
    const next = DETAIL_SECTIONS[(index + step + DETAIL_SECTIONS.length) % DETAIL_SECTIONS.length];
    setSection(next);
    tabRefs.current[next]?.focus();
  };

  const measures = [customer.height && `${customer.height} cm`, customer.weight && `${customer.weight} kg`]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header — pinned */}
      <header className="shrink-0 border-b border-white/8">
        <div className="mx-auto w-full max-w-3xl px-6 pt-5">
          <div className="flex items-start gap-4">
            {customer.avatar ? (
              <img
                src={customer.avatar}
                alt=""
                className="w-14 h-14 rounded-full object-cover border-2 border-[#0F6B3E]/40 shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-[#0F6B3E]/15 border-2 border-[#0F6B3E]/30 flex items-center justify-center shrink-0">
                <User className="w-6 h-6 text-primary-text" aria-hidden="true" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-white truncate">{customer.id}</h2>
                {archived && (
                  <span className="text-xs text-error-text border border-error-text/30 rounded-full px-2 py-0.5">
                    Đã nghỉ
                  </span>
                )}
              </div>

              {/* Quick facts — one wrapping line instead of a column of fields */}
              <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/70 leading-relaxed">
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-white/60" aria-hidden="true" />
                  <span>{customer.phone_number}</span>
                </span>
                {customer.age != null && (
                  <>
                    <Dot />
                    <span>{`${customer.age} tuổi`}</span>
                  </>
                )}
                {measures && (
                  <>
                    <Dot />
                    <span>{measures}</span>
                  </>
                )}
                {customer.address && (
                  <>
                    <Dot />
                    <span>{customer.address}</span>
                  </>
                )}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                {customer.goal && (
                  <span className="bg-[#0F6B3E]/15 text-primary-text text-xs px-3 py-1 rounded-full border border-[#0F6B3E]/25">
                    {customer.goal}
                  </span>
                )}
                <AttendanceSummary customerId={customer.id} />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setEditing(true)}
                data-testid="customer-detail-edit"
                className="tap-target flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                aria-label={`Chỉnh sửa ${customer.id}`}
              >
                <Pencil className="w-3.5 h-3.5" aria-hidden="true" /> Sửa
              </button>
              <button
                type="button"
                data-testid={archived ? 'customer-detail-restore' : 'customer-detail-archive'}
                disabled={statusBusy}
                onClick={() => (archived ? void setActive(true) : setConfirmArchive(true))}
                className={`tap-target flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm border transition-colors disabled:opacity-60 ${
                  archived
                    ? 'text-primary-text bg-[#0F6B3E]/10 border-[#0F6B3E]/30 hover:bg-[#0F6B3E]/20'
                    : 'text-white/70 hover:text-error-text bg-transparent hover:bg-[#f87171]/10 border-white/10 hover:border-error-text/30'
                }`}
                aria-label={archived ? `Khôi phục ${customer.id}` : `Đánh dấu ${customer.id} đã nghỉ`}
              >
                {statusBusy && archived ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                ) : (
                  <Archive className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                {archived ? 'Khôi phục' : 'Đã nghỉ'}
              </button>
            </div>
          </div>

          {/* Health — only when there is something worth flagging */}
          {hasHealthConcern(customer.health_note) && (
            <div
              data-testid="customer-health-note"
              className="mt-3 flex items-start gap-2 rounded-xl border border-[#f59e0b]/25 bg-[#f59e0b]/[0.06] px-3 py-2 text-sm leading-relaxed"
            >
              <Activity className="w-4 h-4 mt-0.5 shrink-0 text-[#f59e0b]" aria-hidden="true" />
              <p className="text-white/80">
                <span className="font-medium text-[#f59e0b]">Sức khỏe: </span>
                {customer.health_note}
              </p>
            </div>
          )}

          {/* Section tabs */}
          <div role="tablist" aria-label="Thông tin hội viên" className="mt-4 flex gap-6">
            {DETAIL_SECTIONS.map((key, index) => {
              const active = section === key;
              return (
                <button
                  key={key}
                  ref={(el) => {
                    tabRefs.current[key] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`detail-tab-${key}`}
                  aria-selected={active}
                  aria-controls="detail-panel"
                  tabIndex={active ? 0 : -1}
                  data-testid={`detail-tab-${key}`}
                  onClick={() => setSection(key)}
                  onKeyDown={(e) => onTabKeyDown(e, index)}
                  className={`tap-target -mb-px border-b-2 pb-3 pt-1 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3DBE7A] rounded-t ${
                    active
                      ? 'border-primary-text text-white'
                      : 'border-transparent text-white/60 hover:text-white'
                  }`}
                >
                  {DETAIL_SECTION_LABELS[key]}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Active section — the only scrolling area */}
      <div
        role="tabpanel"
        id="detail-panel"
        aria-labelledby={`detail-tab-${section}`}
        className="flex-1 min-h-0 overflow-y-auto"
      >
        <div className="mx-auto w-full max-w-3xl px-6 py-5">
          {section === 'inbody' ? (
            <InbodySection customerId={customer.id} />
          ) : (
            <TrainerNotes customerId={customer.id} embedded />
          )}
        </div>
      </div>

      {/* Edit modal */}
      {editing && (
        <MemberFormModal
          mode="edit"
          customer={customer}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            onRefresh?.();
          }}
          showToast={show}
        />
      )}

      <ConfirmDialog
        open={confirmArchive}
        title={`Đánh dấu ${customer.id} đã nghỉ?`}
        body="Hội viên sẽ được ẩn khỏi danh sách mặc định. Lịch sử vẫn được giữ lại."
        confirmLabel="Đánh dấu đã nghỉ"
        tone="danger"
        busy={statusBusy}
        onConfirm={() => void setActive(false)}
        onCancel={() => setConfirmArchive(false)}
      />
      {toastNode}
    </div>
  );
}
