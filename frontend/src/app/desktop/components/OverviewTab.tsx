/**
 * Desktop dashboard "Hồ sơ & InBody" tab (U3 Trainee Desktop, TS-2/TS-8).
 * Rebuilt from the OverviewTab previously inlined in UserDashboardPage.tsx —
 * same fields/validation, now wired through useProfile()/useInbodyHistory()
 * (U2) instead of a direct updateProfile()/inline fetchMyInbody() call.
 */
import React, { useState } from 'react';
import {
  Activity,
  Check,
  Eye,
  EyeOff,
  Lock,
  MapPin,
  Minus,
  Phone,
  Plus,
  RefreshCw,
  Target,
  User,
} from 'lucide-react';
import { AvatarUpload } from '../../components/AvatarUpload';
import { StackedInbodyChart } from '../../components/InbodyCharts';
import { useProfile } from '../../shared/hooks/useProfile';
import { useInbodyHistory } from '../../shared/hooks/useInbody';
import type { InbodyRecordOut } from '../../../lib/api/profile';

const PRESET_GOALS = ['Giảm cân', 'Tăng cơ', 'Cải thiện sức khỏe', 'Tăng sức bền', 'Linh hoạt & phục hồi'];

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
        disabled={num <= min} data-testid="stepper-decrement"
        className="px-4 py-3 text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-20 transition-all shrink-0">
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
        disabled={num >= max} data-testid="stepper-increment"
        className="px-4 py-3 text-white/40 hover:text-[#0F6B3E] hover:bg-white/5 disabled:opacity-20 transition-all shrink-0">
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function OverviewTab() {
  const { user, update } = useProfile();
  const { data: inbodyData, loading: inbodyLoading } = useInbodyHistory(user?.id ?? '', 'customer');
  const inbodyRecords = (inbodyData ?? []) as InbodyRecordOut[];

  const isCustomGoal = !!user?.goal && !PRESET_GOALS.includes(user.goal);

  const [avatar, setAvatar]         = useState(user?.avatar ?? '');
  const [goal, setGoal]             = useState(isCustomGoal ? 'Khác' : user?.goal ?? '');
  const [customGoal, setCustomGoal] = useState(isCustomGoal ? user?.goal ?? '' : '');
  const [healthNote, setHealthNote] = useState(user?.health_note ?? '');
  const [address, setAddress]       = useState(user?.address ?? '');
  const [age, setAge]               = useState(String(user?.age ?? '20'));
  const [currentPw, setCurrentPw]   = useState('');
  const [newPw, setNewPw]           = useState('');
  const [confirmPw, setConfirmPw]   = useState('');
  const [showCurPw, setShowCurPw]   = useState(false);
  const [showNewPw, setShowNewPw]   = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');

  if (!user) return null;

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
      await update({
        customer_id: user.id, avatar, goal: goal === 'Khác' ? customGoal.trim() : goal,
        health_note: healthNote.trim(), address: address.trim(), age: ageNum,
        ...(newPw ? { current_password: currentPw, new_password: newPw } : {}),
      });
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      setSuccess('Thông tin đã được cập nhật!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cập nhật thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      {/* Profile form */}
      <div data-tour="profile-form" className="bg-white/[0.03] border border-white/8 rounded-2xl p-6">
        <h2 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-[#0F6B3E]" /> Hồ sơ cá nhân
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5" data-testid="overview-profile-form">
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
                placeholder="TP. Hồ Chí Minh" className={inputCls} data-testid="input-address" />
            </div>
          </div>

          {/* Goal */}
          <div>
            <label className="text-white/60 text-xs uppercase tracking-widest mb-2 flex items-center gap-1">
              <Target className="w-3 h-3 text-[#0F6B3E]" /> Mục tiêu tập luyện
            </label>
            <div className="flex flex-wrap gap-2">
              {[...PRESET_GOALS, 'Khác'].map((g) => (
                <button key={g} type="button" onClick={() => setGoal(g)} data-testid={`goal-option-${g}`}
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

          {/* Body metrics removed — height/weight are managed by PT via admin dashboard */}

          {/* Password change */}
          <details className="group">
            <summary className="text-white/40 text-xs uppercase tracking-widest cursor-pointer hover:text-white/70 transition-colors select-none">
              Đổi mật khẩu <span className="normal-case text-white/20">(bỏ trống nếu không đổi)</span>
            </summary>
            <div className="mt-4 space-y-3">
              <div className="relative">
                <input type={showCurPw ? 'text' : 'password'} value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)} placeholder="Mật khẩu hiện tại"
                  autoComplete="current-password" className={`${inputCls} pr-12`} data-testid="input-current-password" />
                <button type="button" onClick={() => setShowCurPw(!showCurPw)}
                  aria-label={showCurPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {showCurPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <input type={showNewPw ? 'text' : 'password'} value={newPw}
                    onChange={(e) => setNewPw(e.target.value)} placeholder="Mật khẩu mới"
                    autoComplete="new-password" className={`${inputCls} pr-10`} data-testid="input-new-password" />
                  <button type="button" onClick={() => setShowNewPw(!showNewPw)}
                    aria-label={showNewPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
                  placeholder="Xác nhận mới" autoComplete="new-password" className={inputCls} data-testid="input-confirm-password" />
              </div>
            </div>
          </details>

          {error && <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-2.5" data-testid="overview-error">{error}</p>}
          {success && (
            <p className="text-green-400 text-sm bg-green-400/10 border border-green-400/20 rounded-xl px-4 py-2.5 flex items-center gap-2" data-testid="overview-success">
              <Check className="w-4 h-4 shrink-0" />{success}
            </p>
          )}

          <button type="submit" disabled={loading} data-testid="overview-save-button"
            className="w-full bg-[#0F6B3E] hover:bg-[#0F6B3E]/90 disabled:opacity-60 text-white font-semibold py-3.5 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(15,107,62,0.4)]">
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </form>
      </div>

      {/* InBody section — read only */}
      <div data-tour="inbody-section" className="bg-white/[0.03] border border-white/8 rounded-2xl p-6">
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
