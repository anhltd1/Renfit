/**
 * Unified customer dashboard — Overview, AI Coach, Bookings in one place.
 * Sidebar navigation keeps the experience connected.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Activity,
  Bot,
  Calendar,
  CalendarDays,
  Check,
  Eye,
  EyeOff,
  Lock,
  LogOut,
  MapPin,
  MessageSquare,
  Minus,
  Phone,
  Plus,
  RefreshCw,
  Sparkles,
  Target,
  User,
  Weight,
} from 'lucide-react';
import { Link } from '../components/Link';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import logoImage from '../../imports/image.png';
import { AvatarUpload } from '../components/AvatarUpload';
import { ChatPanel } from '../components/chat/ChatPanel';
import { StackedInbodyChart } from '../components/InbodyCharts';
import { BookingCalendar } from '../components/BookingCalendar';
import { getAuthUser, setAuthUser, clearAuthUser } from '../../lib/auth';
import { updateProfile } from '../../lib/api/profile';
import { fetchAvailability, createBooking, cancelBooking, type Availability } from '../../lib/api/bookings';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

async function fetchMyInbody(customerId: string) {
  const url = `${API_BASE}/api/v1/profile/inbody?customer_id=${encodeURIComponent(customerId)}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  return res.json();
}

type Tab = 'overview' | 'chat' | 'bookings';

const PRESET_GOALS = ['Giảm cân', 'Tăng cơ', 'Cải thiện sức khỏe', 'Tăng sức bền', 'Linh hoạt & phục hồi'];

// ── Number stepper ─────────────────────────────────────────────────────────
function NumberStepper({
  value, onChange, min, max, step = 1, placeholder, unit,
}: {
  value: string; onChange: (v: string) => void; min: number; max: number;
  step?: number; placeholder?: string; unit?: string;
}) {
  const num = parseFloat(value) || 0;
  return (
    <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl overflow-hidden focus-within:border-[#0F6B3E] transition-colors">
      <button type="button" onClick={() => onChange(String(Math.max(min, parseFloat((num - step).toFixed(2)))))}
        disabled={num <= min} className="px-4 py-3 text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-20 transition-all shrink-0">
        <Minus className="w-3.5 h-3.5" />
      </button>
      <div className="flex-1 flex items-center justify-center gap-1 min-w-0">
        <input type="text" inputMode="decimal" value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^\d.]/g, ''))}
          onBlur={() => { if (!value) return; onChange(String(Math.min(max, Math.max(min, parseFloat(value) || min)))); }}
          placeholder={placeholder}
          className="w-16 bg-transparent text-center text-white placeholder:text-white/25 outline-none text-sm font-medium" />
        {unit && <span className="text-white/30 text-xs shrink-0">{unit}</span>}
      </div>
      <button type="button" onClick={() => onChange(String(Math.min(max, parseFloat((num + step).toFixed(2)))))}
        disabled={num >= max} className="px-4 py-3 text-white/40 hover:text-[#0F6B3E] hover:bg-white/5 disabled:opacity-20 transition-all shrink-0">
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ── Profile / Overview tab ─────────────────────────────────────────────────
function OverviewTab() {
  const user = getAuthUser()!;
  const isCustomGoal = user.goal && !PRESET_GOALS.includes(user.goal);

  const [avatar, setAvatar]           = useState(user.avatar ?? '');
  const [goal, setGoal]               = useState(isCustomGoal ? 'Khác' : user.goal);
  const [customGoal, setCustomGoal]   = useState(isCustomGoal ? user.goal : '');
  const [healthNote, setHealthNote]   = useState(user.health_note ?? '');
  const [address, setAddress]         = useState(user.address ?? '');
  const [age, setAge]                 = useState(String(user.age ?? '20'));
  const [height, setHeight]           = useState(user.height ?? '170');
  const [weight, setWeight]           = useState(user.weight ?? '60');
  const [currentPw, setCurrentPw]     = useState('');
  const [newPw, setNewPw]             = useState('');
  const [confirmPw, setConfirmPw]     = useState('');
  const [showCurPw, setShowCurPw]     = useState(false);
  const [showNewPw, setShowNewPw]     = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState('');

  // InBody
  const [inbodyRecords, setInbodyRecords] = useState<Record<string, unknown>[]>([]);
  const [inbodyLoading, setInbodyLoading] = useState(true);

  useEffect(() => {
    fetchMyInbody(user.id)
      .then((r) => setInbodyRecords(r as Record<string, unknown>[]))
      .finally(() => setInbodyLoading(false));
  }, [user.id]);

  const inputCls = 'w-full bg-white/5 border border-white/10 focus:border-[#0F6B3E] rounded-2xl px-4 py-3 text-white placeholder:text-white/30 outline-none transition-colors text-sm';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    const ageNum = Number(age);
    if (!age || isNaN(ageNum) || ageNum < 10) return setError('Tuổi phải là số và ít nhất 10.');
    if (newPw) {
      if (!currentPw) return setError('Vui lòng nhập mật khẩu hiện tại.');
      if (newPw.length < 6) return setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      if (newPw !== confirmPw) return setError('Mật khẩu xác nhận không khớp.');
    }
    setLoading(true);
    try {
      const updated = await updateProfile({
        customer_id: user.id, avatar, goal: goal === 'Khác' ? customGoal.trim() : goal,
        health_note: healthNote.trim(), address: address.trim(), age: ageNum,
        height: height.trim(), weight: weight.trim(),
        ...(newPw ? { current_password: currentPw, new_password: newPw } : {}),
      });
      setAuthUser(updated);
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      setSuccess('Thông tin đã được cập nhật!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cập nhật thất bại.');
    } finally { setLoading(false); }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      {/* Profile form */}
      <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6">
        <h2 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-[#0F6B3E]" /> Hồ sơ cá nhân
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Avatar + name */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-5 border-b border-white/8">
            <AvatarUpload value={avatar} onChange={setAvatar} size={100} disabled={loading} />
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <h3 className="text-white font-bold text-xl">{user.id}</h3>
              <p className="text-white/40 text-sm flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                <Phone className="w-3.5 h-3.5" />{user.phone_number}
              </p>
            </div>
          </div>

          {/* Grid: age + address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-white/60 text-xs uppercase tracking-widest mb-2 block">Tuổi</label>
              <NumberStepper value={age} onChange={setAge} min={10} max={100} placeholder="20" unit="tuổi" />
            </div>
            <div>
              <label className="text-white/60 text-xs uppercase tracking-widest mb-2 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#0F6B3E]" /> Địa chỉ
              </label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                placeholder="TP. Hồ Chí Minh" className={inputCls} />
            </div>
          </div>

          {/* Goal */}
          <div>
            <label className="text-white/60 text-xs uppercase tracking-widest mb-2 flex items-center gap-1">
              <Target className="w-3 h-3 text-[#0F6B3E]" /> Mục tiêu tập luyện
            </label>
            <div className="flex flex-wrap gap-2">
              {[...PRESET_GOALS, 'Khác'].map((g) => (
                <button key={g} type="button" onClick={() => setGoal(g)}
                  className={`px-3 py-1.5 rounded-xl text-sm border transition-all duration-200 ${
                    goal === g ? 'bg-[#0F6B3E] border-[#0F6B3E] text-white' : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30 hover:text-white'
                  }`}>{g}</button>
              ))}
            </div>
            {goal === 'Khác' && (
              <input type="text" value={customGoal} onChange={(e) => setCustomGoal(e.target.value)}
                placeholder="Mô tả mục tiêu..." className={`${inputCls} mt-2`} autoFocus />
            )}
          </div>

          {/* Health note */}
          <div>
            <label className="text-white/60 text-xs uppercase tracking-widest mb-2 flex items-center gap-1">
              <Activity className="w-3 h-3 text-[#0F6B3E]" /> Tình trạng sức khỏe
            </label>
            <textarea value={healthNote} onChange={(e) => setHealthNote(e.target.value)}
              placeholder="Bệnh lý, chấn thương hoặc lưu ý (nếu có)..."
              rows={2} className={`${inputCls} resize-none`} />
          </div>

          {/* Body metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white/60 text-xs uppercase tracking-widest mb-2 flex items-center gap-1">
                <Weight className="w-3 h-3 text-[#0F6B3E]" /> Chiều cao
              </label>
              <NumberStepper value={height} onChange={setHeight} min={100} max={250} placeholder="170" unit="cm" />
            </div>
            <div>
              <label className="text-white/60 text-xs uppercase tracking-widest mb-2 flex items-center gap-1">
                <Weight className="w-3 h-3 text-[#0F6B3E]" /> Cân nặng
              </label>
              <NumberStepper value={weight} onChange={setWeight} min={30} max={300} step={0.5} placeholder="60" unit="kg" />
            </div>
          </div>

          {/* Password change */}
          <details className="group">
            <summary className="text-white/40 text-xs uppercase tracking-widest cursor-pointer hover:text-white/70 transition-colors select-none">
              Đổi mật khẩu <span className="normal-case text-white/20">(bỏ trống nếu không đổi)</span>
            </summary>
            <div className="mt-4 space-y-3">
              <div className="relative">
                <input type={showCurPw ? 'text' : 'password'} value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)} placeholder="Mật khẩu hiện tại"
                  autoComplete="current-password" className={`${inputCls} pr-12`} />
                <button type="button" onClick={() => setShowCurPw(!showCurPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {showCurPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <input type={showNewPw ? 'text' : 'password'} value={newPw}
                    onChange={(e) => setNewPw(e.target.value)} placeholder="Mật khẩu mới"
                    autoComplete="new-password" className={`${inputCls} pr-10`} />
                  <button type="button" onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
                  placeholder="Xác nhận mới" autoComplete="new-password" className={inputCls} />
              </div>
            </div>
          </details>

          {error && <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-2.5">{error}</p>}
          {success && (
            <p className="text-green-400 text-sm bg-green-400/10 border border-green-400/20 rounded-xl px-4 py-2.5 flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />{success}
            </p>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-[#0F6B3E] hover:bg-[#0F6B3E]/90 disabled:opacity-60 text-white font-semibold py-3.5 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(15,107,62,0.4)]">
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </form>
      </div>

      {/* InBody section — read only */}
      <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-white font-bold text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#0F6B3E]" /> Chỉ số InBody
            </h2>
            <p className="text-white/35 text-xs mt-0.5">
              {inbodyRecords.length} lần đo · Chỉ HLV có thể thêm chỉ số mới
            </p>
          </div>
        </div>
        {inbodyLoading ? (
          <div className="flex justify-center py-8 text-white/25">
            <RefreshCw className="w-5 h-5 animate-spin" />
          </div>
        ) : (
          <StackedInbodyChart
            records={inbodyRecords as Parameters<typeof StackedInbodyChart>[0]['records']}
            emptyLabel="Chưa có dữ liệu InBody. Huấn luyện viên sẽ cập nhật sau mỗi lần đo tại phòng gym."
          />
        )}
      </div>
    </div>
  );
}

// ── Booking tab ────────────────────────────────────────────────────────────
function BookingTab() {
  const user = getAuthUser()!;
  const [data, setData] = useState<Availability | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try { setData(await fetchAvailability(user.id)); }
    catch (err) { setError(err instanceof Error ? err.message : 'Không tải được lịch.'); }
    finally { setLoading(false); }
  }, [user.id]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="p-6 lg:p-8 flex flex-col gap-4 h-full">
      <div>
        <h2 className="text-white font-bold text-lg flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-[#0F6B3E]" /> Đặt Lịch Tập
        </h2>
        <p className="text-white/50 text-sm mt-1">
          Chọn khung giờ trống để đặt lịch. Phòng gym mở 08:00–20:00, nghỉ Chủ Nhật, tối đa {data?.capacity ?? 4} người/giờ.
        </p>
      </div>
      <BookingCalendar
        customerId={user.id}
        data={data}
        loading={loading}
        error={error}
        onBook={async (slot) => {
          await createBooking(user.id, slot.time);
          await load(true);
        }}
        onCancel={async (slot) => {
          await cancelBooking(user.id, slot.my_booking_id ?? '');
          await load(true);
        }}
        onRefresh={() => load()}
      />
    </div>
  );
}

// ── Main dashboard page ────────────────────────────────────────────────────
export function UserDashboardPage() {
  const navigate = useNavigate();
  const user = getAuthUser();
  const [tab, setTab] = useState<Tab>('overview');
  const [chatKey, setChatKey] = useState(0);

  const handleLogout = () => {
    clearAuthUser();
    navigate('/');
  };

  if (!user) { navigate('/login'); return null; }

  return (
    <div className="h-[100dvh] w-full flex overflow-hidden bg-[#0B0B0B] text-white">
      {/* ── Sidebar ── */}
      <aside className="w-64 lg:w-72 shrink-0 flex flex-col bg-black border-r border-white/10">
        {/* Logo */}
        <div className="p-5 border-b border-white/10">
          <Link to="/" className="flex items-center gap-3">
            <ImageWithFallback src={logoImage} alt="Renfit" className="h-9 w-auto" />
          </Link>
        </div>

        {/* User identity */}
        <div className="p-4 border-b border-white/8">
          <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
            {user.avatar ? (
              <img src={user.avatar} alt={user.id}
                className="w-10 h-10 rounded-full object-cover border border-white/20 shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#0F6B3E]/20 border border-[#0F6B3E]/30 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-[#0F6B3E]" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{user.id}</p>
              <p className="text-white/35 text-xs truncate">{user.phone_number}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          <NavItem icon={<User className="w-4 h-4" />} label="Hồ sơ & InBody"
            active={tab === 'overview'} onClick={() => setTab('overview')} />
          <NavItem icon={<Bot className="w-4 h-4" />} label="AI Coach"
            active={tab === 'chat'} onClick={() => setTab('chat')} />
          <NavItem icon={<Calendar className="w-4 h-4" />} label="Đặt lịch tập"
            active={tab === 'bookings'} onClick={() => setTab('bookings')} />
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/8 space-y-1.5">
          {tab === 'chat' && (
            <button type="button" onClick={() => setChatKey((k) => k + 1)}
              className="w-full bg-[#0F6B3E]/15 hover:bg-[#0F6B3E]/25 border border-[#0F6B3E]/30 text-[#0F6B3E] py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all text-sm">
              <Plus className="w-4 h-4" /> Cuộc trò chuyện mới
            </button>
          )}
          <button type="button" onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-white/40 hover:text-red-400 py-2 text-sm transition-colors rounded-xl hover:bg-red-400/5">
            <LogOut className="w-4 h-4" /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 min-w-0 flex flex-col min-h-0">
        {/* Header */}
        <header className="shrink-0 bg-black/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {tab === 'overview' && (
              <>
                <User className="w-5 h-5 text-[#0F6B3E]" />
                <h1 className="text-white font-bold">Hồ sơ & Thể trạng</h1>
              </>
            )}
            {tab === 'chat' && (
              <>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0F6B3E] to-[#0F6B3E]/60 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-white font-bold">Renfit AI Coach</h1>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-white/50 text-xs">Đang hoạt động</span>
                  </div>
                </div>
                <div className="ml-auto hidden sm:flex items-center gap-2 bg-[#0F6B3E]/20 px-3 py-1.5 rounded-full border border-[#0F6B3E]/30">
                  <Sparkles className="w-3.5 h-3.5 text-[#0F6B3E]" />
                  <span className="text-[#0F6B3E] text-xs">AI-Powered</span>
                </div>
              </>
            )}
            {tab === 'bookings' && (
              <>
                <CalendarDays className="w-5 h-5 text-[#0F6B3E]" />
                <h1 className="text-white font-bold">Đặt Lịch Tập</h1>
              </>
            )}
          </div>

          {/* Breadcrumb-style tab pills on desktop */}
          {tab !== 'chat' && (
            <div className="hidden md:flex items-center gap-1 bg-white/5 border border-white/8 rounded-xl p-1">
              <TabPill label="Hồ sơ" icon={<User className="w-3.5 h-3.5" />} active={tab === 'overview'} onClick={() => setTab('overview')} />
              <TabPill label="AI Coach" icon={<MessageSquare className="w-3.5 h-3.5" />} active={tab === 'chat'} onClick={() => setTab('chat')} />
              <TabPill label="Đặt lịch" icon={<Calendar className="w-3.5 h-3.5" />} active={tab === 'bookings'} onClick={() => setTab('bookings')} />
            </div>
          )}
        </header>

        {/* Tab content — chat stays mounted (hidden) to preserve state */}
        <div className="flex-1 min-h-0 overflow-y-auto" style={{ display: tab === 'overview' ? 'block' : 'none' }}>
          <OverviewTab />
        </div>
        <div className="flex-1 min-h-0 flex flex-col" style={{ display: tab === 'chat' ? 'flex' : 'none' }}>
          <ChatPanel key={chatKey} variant="full" showHeader={false} />
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto" style={{ display: tab === 'bookings' ? 'block' : 'none' }}>
          <BookingTab />
        </div>
      </main>
    </div>
  );
}

function NavItem({
  icon, label, active, onClick,
}: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
        active ? 'bg-[#0F6B3E]/20 border border-[#0F6B3E]/30 text-[#0F6B3E]' : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
      }`}>
      {icon}{label}
    </button>
  );
}

function TabPill({
  icon, label, active, onClick,
}: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
        active ? 'bg-[#0F6B3E] text-white' : 'text-white/50 hover:text-white'
      }`}>
      {icon}{label}
    </button>
  );
}
