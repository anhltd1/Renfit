import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Activity,
  CalendarDays,
  LogOut,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  User,
  Users,
  Weight,
  X,
} from 'lucide-react';
import {
  addInbody,
  fetchCustomers,
  fetchInbody,
  type AddInbodyPayload,
  type CustomerSummary,
  type InbodyRecord,
} from '../../lib/api/admin';
import { StackedInbodyChart, fmtDate as fmtDateChart } from '../components/InbodyCharts';
import { clearAdminToken } from '../../lib/adminAuth';
import { AdminBookings } from '../components/AdminBookings';

// ── Helpers ────────────────────────────────────────────────────────────────
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

const fmtDate = fmtDateChart;

// ── Add InBody popup ───────────────────────────────────────────────────────
function AddInbodyModal({
  customerId,
  lastRecord,
  onClose,
  onAdded,
}: {
  customerId: string;
  lastRecord: InbodyRecord | null;
  onClose: () => void;
  onAdded: (r: InbodyRecord) => void;
}) {
  const [form, setForm] = useState({
    height: lastRecord ? String(lastRecord.height) : '',
    weight: '',
    SMM: '',
    BFM: '',
    date_recorded: today(),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const overlayRef = useRef<HTMLDivElement>(null);

  // close on backdrop click
  const handleOverlay = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const h = parseFloat(form.height);
    const w = parseFloat(form.weight);
    const smm = parseFloat(form.SMM);
    const bfm = parseFloat(form.BFM);
    if (!h || !w || isNaN(smm) || isNaN(bfm))
      return setError('Vui lòng nhập đầy đủ và hợp lệ.');
    setLoading(true);
    try {
      const payload: AddInbodyPayload = {
        height: h,
        weight: w,
        SMM: smm,
        BFM: bfm,
        date_recorded: form.date_recorded || today(),
      };
      const record = await addInbody(customerId, payload);
      onAdded(record);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lưu thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    'w-full bg-white/5 border border-white/10 focus:border-[#0F6B3E] rounded-xl px-3 py-2.5 text-white placeholder:text-white/25 outline-none transition-colors text-sm';

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlay}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <div>
            <h3 className="text-white font-semibold">Nhập chỉ số InBody</h3>
            <p className="text-white/35 text-xs mt-0.5">Kết quả đo từ máy InBody tại phòng gym</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/30 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Date */}
          <div>
            <label className="text-white/50 text-xs mb-1.5 block">Ngày đo</label>
            <input
              type="date"
              value={form.date_recorded}
              onChange={set('date_recorded')}
              className={inputCls + ' [color-scheme:dark]'}
            />
          </div>

          {/* Grid: 2 cols */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/50 text-xs mb-1.5 block">
                Chiều cao <span className="text-white/25">(cm)</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={form.height}
                onChange={set('height')}
                placeholder={lastRecord ? String(lastRecord.height) : '170'}
                className={inputCls}
              />
              {lastRecord && (
                <p className="text-white/20 text-[10px] mt-1">
                  Lần trước: {lastRecord.height} cm
                </p>
              )}
            </div>
            <div>
              <label className="text-white/50 text-xs mb-1.5 block">
                Cân nặng <span className="text-white/25">(kg)</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={form.weight}
                onChange={set('weight')}
                placeholder={lastRecord ? String(lastRecord.weight) : '60'}
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-white/50 text-xs mb-1.5 block">
                SMM <span className="text-white/25">(kg) — Cơ xương</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={form.SMM}
                onChange={set('SMM')}
                placeholder="0.0"
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-white/50 text-xs mb-1.5 block">
                BFM <span className="text-white/25">(kg) — Mỡ cơ thể</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={form.BFM}
                onChange={set('BFM')}
                placeholder="0.0"
                className={inputCls}
              />
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white py-2.5 rounded-xl transition-all text-sm"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#0F6B3E] hover:bg-[#0F6B3E]/90 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-all text-sm"
            >
              {loading ? 'Đang lưu...' : 'Lưu kết quả'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── InBody section ─────────────────────────────────────────────────────────
function InbodySection({ customerId }: { customerId: string }) {
  const [records, setRecords] = useState<InbodyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchInbody(customerId);
      setRecords(data);
    } catch {
      // non-critical — charts just show empty state
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdded = (r: InbodyRecord) => {
    setRecords((prev) =>
      [...prev, r].sort((a, b) => a.date_recorded.localeCompare(b.date_recorded)),
    );
  };

  const lastRecord = records.length ? records[records.length - 1] : null;

  return (
    <div className="px-6 py-6 border-t border-white/8">
      {/* Section header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-white font-semibold text-sm">InBody — Lịch sử chỉ số</h3>
          <p className="text-white/30 text-xs mt-0.5">
            {records.length} lần đo
            {lastRecord && ` · Gần nhất: ${fmtDate(lastRecord.date_recorded)}`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-[#0F6B3E]/15 hover:bg-[#0F6B3E]/25 border border-[#0F6B3E]/30 hover:border-[#0F6B3E]/50 text-[#0F6B3E] text-sm px-3 py-2 rounded-xl transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Thêm kết quả
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10 text-white/20">
          <RefreshCw className="w-5 h-5 animate-spin" />
        </div>
      ) : (
        <StackedInbodyChart records={records} emptyLabel='Chưa có dữ liệu — nhấn "Thêm kết quả" để bắt đầu theo dõi.' />
      )}

      {showModal && (
        <AddInbodyModal
          customerId={customerId}
          lastRecord={lastRecord}
          onClose={() => setShowModal(false)}
          onAdded={handleAdded}
        />
      )}
    </div>
  );
}

// ── Detail field ───────────────────────────────────────────────────────────
function DetailField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex gap-3 py-3 border-b border-white/6 last:border-0">
      <div className="w-8 h-8 rounded-xl bg-[#0F6B3E]/12 flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-[#0F6B3E]">{icon}</span>
      </div>
      <div>
        <p className="text-white/35 text-[11px] uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-white/90 text-sm">{value}</p>
      </div>
    </div>
  );
}

// ── Customer detail panel ──────────────────────────────────────────────────
function CustomerDetail({ customer }: { customer: CustomerSummary }) {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Hero */}
      <div className="flex flex-col items-center gap-3 py-8 px-6 border-b border-white/8">
        {customer.avatar ? (
          <img
            src={customer.avatar}
            alt={customer.id}
            className="w-24 h-24 rounded-full object-cover border-2 border-[#0F6B3E]/40"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-[#0F6B3E]/15 border-2 border-[#0F6B3E]/30 flex items-center justify-center">
            <User className="w-10 h-10 text-[#0F6B3E]" />
          </div>
        )}
        <div className="text-center">
          <h2 className="text-xl font-bold text-white">{customer.id}</h2>
          <p className="text-white/40 text-sm flex items-center justify-center gap-1.5 mt-1">
            <Phone className="w-3.5 h-3.5" />
            {customer.phone_number}
          </p>
          {customer.goal && (
            <span className="inline-block mt-2 bg-[#0F6B3E]/15 text-[#0F6B3E] text-xs px-3 py-1 rounded-full border border-[#0F6B3E]/25">
              {customer.goal}
            </span>
          )}
        </div>
      </div>

      {/* Basic info fields */}
      <div className="px-6 py-4 border-b border-white/8">
        {customer.age != null && (
          <DetailField icon={<User className="w-4 h-4" />} label="Tuổi" value={`${customer.age} tuổi`} />
        )}
        {customer.address && (
          <DetailField icon={<MapPin className="w-4 h-4" />} label="Địa chỉ" value={customer.address} />
        )}
        {(customer.height || customer.weight) && (
          <DetailField
            icon={<Weight className="w-4 h-4" />}
            label="Số đo đăng ký"
            value={[
              customer.height && `${customer.height} cm`,
              customer.weight && `${customer.weight} kg`,
            ]
              .filter(Boolean)
              .join('  ·  ')}
          />
        )}
        {customer.health_note && (
          <DetailField
            icon={<Activity className="w-4 h-4" />}
            label="Tình trạng sức khỏe"
            value={customer.health_note}
          />
        )}
        {!customer.age && !customer.address && !customer.height && !customer.weight && !customer.health_note && (
          <p className="text-white/20 text-sm text-center py-4">Hội viên chưa cập nhật thông tin.</p>
        )}
      </div>

      {/* InBody charts */}
      <InbodySection customerId={customer.id} />
    </div>
  );
}

// ── Sidebar customer row ───────────────────────────────────────────────────
function SidebarRow({
  customer,
  selected,
  onClick,
}: {
  customer: CustomerSummary;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all rounded-xl ${
        selected
          ? 'bg-[#0F6B3E]/20 border border-[#0F6B3E]/30'
          : 'hover:bg-white/5 border border-transparent'
      }`}
    >
      {customer.avatar ? (
        <img
          src={customer.avatar}
          alt={customer.id}
          className="w-10 h-10 rounded-full object-cover shrink-0 border border-white/10"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-[#0F6B3E]/12 border border-[#0F6B3E]/20 flex items-center justify-center shrink-0">
          <User className="w-4.5 h-4.5 text-[#0F6B3E]" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${selected ? 'text-white' : 'text-white/75'}`}>
          {customer.id}
        </p>
        <p className="text-white/35 text-xs truncate flex items-center gap-1 mt-0.5">
          <Phone className="w-2.5 h-2.5 shrink-0" />
          {customer.phone_number}
        </p>
      </div>
      {customer.goal && (
        <span
          className={`hidden lg:block text-[10px] px-2 py-0.5 rounded-full border shrink-0 max-w-[80px] truncate ${
            selected
              ? 'bg-[#0F6B3E]/30 border-[#0F6B3E]/40 text-[#0F6B3E]'
              : 'bg-white/5 border-white/10 text-white/40'
          }`}
        >
          {customer.goal}
        </span>
      )}
    </button>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<'clients' | 'bookings'>('clients');
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<CustomerSummary | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const data = await fetchCustomers();
      setCustomers(data);
      setSelected((prev) =>
        prev ? (data.find((c) => c.id === prev.id) ?? data[0] ?? null) : (data[0] ?? null),
      );
    } catch (err) {
      if (err instanceof Error && err.message.includes('401')) {
        clearAdminToken();
        navigate('/admin');
        return;
      }
      setError(err instanceof Error ? err.message : 'Tải dữ liệu thất bại.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleLogout = () => {
    clearAdminToken();
    navigate('/admin');
  };

  const filtered = customers.filter(
    (c) =>
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.phone_number.includes(search) ||
      c.goal.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="h-screen bg-[#080808] text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="shrink-0 bg-[#0A0A0A] border-b border-white/8 px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0F6B3E]/20 border border-[#0F6B3E]/30 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-[#0F6B3E]" />
          </div>
          <div>
            <span className="text-white font-bold text-sm">Renfit Admin</span>
            <span className="text-white/30 text-xs ml-2">Coach Dashboard</span>
          </div>

          {/* View tabs */}
          <div className="flex items-center gap-1 ml-4 bg-white/5 border border-white/8 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setView('clients')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                view === 'clients'
                  ? 'bg-[#0F6B3E] text-white'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Hội viên</span>
            </button>
            <button
              type="button"
              onClick={() => setView('bookings')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                view === 'bookings'
                  ? 'bg-[#0F6B3E] text-white'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lịch đặt</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {view === 'clients' && (
            <div className="hidden sm:flex items-center gap-1 bg-white/5 border border-white/8 rounded-xl px-3 py-1.5 mr-2">
              <Users className="w-3.5 h-3.5 text-[#0F6B3E]" />
              <span className="text-white/60 text-sm">
                <span className="text-white font-semibold">{customers.length}</span> hội viên
              </span>
            </div>
          )}
          {view === 'clients' && (
            <button
              type="button"
              onClick={() => load(true)}
              disabled={refreshing}
              className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all disabled:opacity-40"
              title="Làm mới"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-white/40 hover:text-red-400 transition-colors text-sm px-2 py-2 rounded-xl hover:bg-red-400/5"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:block">Đăng xuất</span>
          </button>
        </div>
      </header>

      {/* Body */}
      {view === 'bookings' ? (
        <div className="flex-1 min-h-0">
          <AdminBookings />
        </div>
      ) : (
      <div className="flex-1 flex min-h-0">
        {/* Sidebar */}
        <aside className="w-72 lg:w-80 shrink-0 flex flex-col border-r border-white/8 bg-[#0A0A0A]">
          <div className="p-3 border-b border-white/6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm hội viên..."
                className="w-full bg-white/5 border border-white/8 focus:border-[#0F6B3E] rounded-xl pl-9 pr-4 py-2 text-white placeholder:text-white/25 outline-none transition-colors text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {loading && (
              <div className="flex items-center justify-center py-16 text-white/25">
                <RefreshCw className="w-5 h-5 animate-spin" />
              </div>
            )}
            {!loading && error && (
              <p className="text-red-400 text-xs p-4 bg-red-400/10 rounded-xl m-2">{error}</p>
            )}
            {!loading && !error && filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-white/20 gap-2">
                <Users className="w-8 h-8" />
                <p className="text-sm">{search ? 'Không tìm thấy.' : 'Chưa có hội viên.'}</p>
              </div>
            )}
            {!loading &&
              !error &&
              filtered.map((c) => (
                <SidebarRow
                  key={c.id}
                  customer={c}
                  selected={selected?.id === c.id}
                  onClick={() => setSelected(c)}
                />
              ))}
          </div>

          {!loading && filtered.length > 0 && (
            <div className="px-4 py-2.5 border-t border-white/6">
              <p className="text-white/25 text-xs">
                {search ? `${filtered.length} / ${customers.length} hội viên` : `${customers.length} hội viên`}
              </p>
            </div>
          )}
        </aside>

        {/* Detail */}
        <main className="flex-1 min-w-0 overflow-hidden">
          {!selected ? (
            <div className="h-full flex flex-col items-center justify-center text-white/20 gap-3">
              <Users className="w-12 h-12" />
              <p className="text-sm">Chọn một hội viên để xem thông tin</p>
            </div>
          ) : (
            <CustomerDetail key={selected.id} customer={selected} />
          )}
        </main>
      </div>
      )}
    </div>
  );
}
