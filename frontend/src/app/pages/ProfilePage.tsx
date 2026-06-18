import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Check,
  Eye,
  EyeOff,
  Lock,
  LogOut,
  MapPin,
  Minus,
  Phone,
  Plus,
  Target,
  User,
  Weight,
} from 'lucide-react';
import { Link } from '../components/Link';
import { AvatarUpload } from '../components/AvatarUpload';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import logoImage from '../../imports/image.png';
import { updateProfile } from '../../lib/api/profile';
import { getAuthUser, setAuthUser, clearAuthUser } from '../../lib/auth';
import { AuthGuard } from '../components/AuthGuard';

// ── Preset goals (same as signup) ──────────────────────────────────────────
const PRESET_GOALS = [
  'Giảm cân',
  'Tăng cơ',
  'Cải thiện sức khỏe',
  'Tăng sức bền',
  'Linh hoạt & phục hồi',
];

// ── Reusable field wrapper ─────────────────────────────────────────────────
function Field({
  label,
  icon,
  hint,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-white/70 text-sm mb-2">
        {icon && <span className="text-[#0F6B3E]">{icon}</span>}
        {label}
      </label>
      {children}
      {hint && <p className="text-white/30 text-xs mt-1">{hint}</p>}
    </div>
  );
}

// ── Number stepper (same as signup) ───────────────────────────────────────
function NumberStepper({
  value,
  onChange,
  min,
  max,
  step = 1,
  placeholder,
  unit,
}: {
  value: string;
  onChange: (v: string) => void;
  min: number;
  max: number;
  step?: number;
  placeholder?: string;
  unit?: string;
}) {
  const num = parseFloat(value) || 0;

  const decrement = () => {
    const next = Math.max(min, parseFloat((num - step).toFixed(2)));
    onChange(String(next));
  };

  const increment = () => {
    const next = Math.min(max, parseFloat((num + step).toFixed(2)));
    onChange(String(next));
  };

  return (
    <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl overflow-hidden focus-within:border-[#0F6B3E] transition-colors">
      <button
        type="button"
        onClick={decrement}
        disabled={num <= min && value !== ''}
        className="px-4 py-3 text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-20 transition-all shrink-0"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <div className="flex-1 flex items-center justify-center gap-1 min-w-0">
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^\d.]/g, ''))}
          onBlur={() => {
            if (!value) return;
            const clamped = Math.min(max, Math.max(min, parseFloat(value) || min));
            onChange(String(clamped));
          }}
          placeholder={placeholder}
          className="w-16 bg-transparent text-center text-white placeholder:text-white/25 outline-none text-sm font-medium"
        />
        {unit && <span className="text-white/30 text-xs shrink-0">{unit}</span>}
      </div>
      <button
        type="button"
        onClick={increment}
        disabled={num >= max && value !== ''}
        className="px-4 py-3 text-white/40 hover:text-[#0F6B3E] hover:bg-white/5 disabled:opacity-20 transition-all shrink-0"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ── Section divider ────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4 pb-6 border-b border-white/8">
      <p className="text-white/40 text-xs uppercase tracking-widest">{title}</p>
      {children}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
function ProfileContent() {
  const navigate = useNavigate();
  const user = getAuthUser()!;

  const isCustomGoal = user.goal && !PRESET_GOALS.includes(user.goal);

  const [avatar, setAvatar] = useState(user.avatar ?? '');
  const [goal, setGoal] = useState(isCustomGoal ? 'Khác' : user.goal);
  const [customGoal, setCustomGoal] = useState(isCustomGoal ? user.goal : '');
  const [healthNote, setHealthNote] = useState(user.health_note ?? '');
  const [address, setAddress] = useState(user.address ?? '');
  const [age, setAge] = useState(String(user.age ?? '20'));
  const [height, setHeight] = useState(user.height ?? '170');
  const [weight, setWeight] = useState(user.weight ?? '60');

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const inputCls =
    'w-full bg-white/5 border border-white/10 focus:border-[#0F6B3E] rounded-2xl px-4 py-3 text-white placeholder:text-white/30 outline-none transition-colors text-sm';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const ageNum = Number(age);
    if (!age || isNaN(ageNum) || ageNum < 10) {
      return setError('Tuổi phải là số và ít nhất 10.');
    }

    if (newPw) {
      if (!currentPw) return setError('Vui lòng nhập mật khẩu hiện tại.');
      if (newPw.length < 6) return setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      if (newPw !== confirmPw) return setError('Mật khẩu xác nhận không khớp.');
    }

    setLoading(true);
    const resolvedGoal = goal === 'Khác' ? customGoal.trim() : goal;
    try {
      const updated = await updateProfile({
        customer_id: user.id,
        avatar,
        goal: resolvedGoal,
        health_note: healthNote.trim(),
        address: address.trim(),
        age: ageNum,
        height: height.trim(),
        weight: weight.trim(),
        ...(newPw ? { current_password: currentPw, new_password: newPw } : {}),
      });
      setAuthUser(updated);
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
      setSuccess('Thông tin đã được cập nhật!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cập nhật thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuthUser();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] flex items-start justify-center px-4 py-12">
      {/* Background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#0F6B3E]/8 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/">
            <ImageWithFallback src={logoImage} alt="Renfit" className="h-14 w-auto mb-4" />
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-[0_0_50px_rgba(15,107,62,0.15)]">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* ── Avatar + name ─────────────────────────────── */}
            <div className="flex flex-col items-center gap-3 pb-6 border-b border-white/8">
              <AvatarUpload
                value={avatar}
                onChange={setAvatar}
                size={144}
                disabled={loading}
              />
              <div className="text-center">
                <h1 className="text-xl font-bold text-white">{user.id}</h1>
                <p className="text-white/40 text-sm flex items-center justify-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5" />
                  {user.phone_number}
                </p>
              </div>
            </div>

            {/* ── Personal info ─────────────────────────────── */}
            <Section title="Thông tin cá nhân">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Tuổi">
                  <NumberStepper
                    value={age}
                    onChange={setAge}
                    min={10}
                    max={100}
                    placeholder="20"
                    unit="tuổi"
                  />
                </Field>

                <Field label="Địa chỉ" icon={<MapPin className="w-3.5 h-3.5" />}>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="TP. Hồ Chí Minh"
                    className={inputCls}
                  />
                </Field>
              </div>

              <Field label="Mục tiêu tập luyện" icon={<Target className="w-3.5 h-3.5" />}>
                <div className="flex flex-wrap gap-2">
                  {[...PRESET_GOALS, 'Khác'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGoal(g)}
                      className={`px-3 py-1.5 rounded-xl text-sm border transition-all duration-200 ${
                        goal === g
                          ? 'bg-[#0F6B3E] border-[#0F6B3E] text-white'
                          : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30 hover:text-white'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
                {goal === 'Khác' && (
                  <input
                    type="text"
                    value={customGoal}
                    onChange={(e) => setCustomGoal(e.target.value)}
                    placeholder="Mô tả mục tiêu của bạn..."
                    className={`${inputCls} mt-2`}
                    autoFocus
                  />
                )}
              </Field>

              <Field
                label="Tình trạng sức khỏe"
                hint="Bệnh lý, chấn thương hoặc lưu ý (nếu có)"
              >
                <textarea
                  value={healthNote}
                  onChange={(e) => setHealthNote(e.target.value)}
                  placeholder="Ví dụ: đau lưng nhẹ, cao huyết áp..."
                  rows={2}
                  className={`${inputCls} resize-none`}
                />
              </Field>
            </Section>

            {/* ── Body metrics ─────────────────────────────── */}
            <Section title="Số đo cơ thể">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Chiều cao" icon={<Weight className="w-3.5 h-3.5" />}>
                  <NumberStepper
                    value={height}
                    onChange={setHeight}
                    min={100}
                    max={250}
                    placeholder="170"
                    unit="cm"
                  />
                </Field>
                <Field label="Cân nặng" icon={<Weight className="w-3.5 h-3.5" />}>
                  <NumberStepper
                    value={weight}
                    onChange={setWeight}
                    min={30}
                    max={300}
                    step={0.5}
                    placeholder="60"
                    unit="kg"
                  />
                </Field>
              </div>
            </Section>

            {/* ── Change password ───────────────────────────── */}
            <div className="space-y-4">
              <p className="text-white/40 text-xs uppercase tracking-widest">
                Đổi mật khẩu{' '}
                <span className="normal-case text-white/20">(bỏ trống nếu không đổi)</span>
              </p>

              <Field label="Mật khẩu hiện tại" icon={<Lock className="w-3.5 h-3.5" />}>
                <div className="relative">
                  <input
                    type={showCurrentPw ? 'text' : 'password'}
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className={`${inputCls} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Mật khẩu mới">
                  <div className="relative">
                    <input
                      type={showNewPw ? 'text' : 'password'}
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className={`${inputCls} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    >
                      {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </Field>
                <Field label="Xác nhận mới">
                  <input
                    type="password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className={inputCls}
                  />
                </Field>
              </div>
            </div>

            {/* ── Feedback ──────────────────────────────────── */}
            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-2.5">
                {error}
              </p>
            )}
            {success && (
              <p className="text-green-400 text-sm bg-green-400/10 border border-green-400/20 rounded-xl px-4 py-2.5 flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                {success}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0F6B3E] hover:bg-[#0F6B3E]/90 disabled:opacity-60 text-white font-semibold py-3.5 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(15,107,62,0.4)]"
            >
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </form>

          {/* ── Bottom links ─────────────────────────────────── */}
          <div className="flex items-center justify-between mt-6 pt-5 border-t border-white/8">
            <Link
              to="/ai-coach"
              className="text-white/40 hover:text-[#0F6B3E] text-sm transition-colors"
            >
              ← Về AI Coach
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-white/40 hover:text-red-400 text-sm transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Đăng xuất
            </button>
          </div>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          <Link to="/" className="hover:text-white/40 transition-colors">
            ← Về trang chủ
          </Link>
        </p>
      </div>
    </div>
  );
}

export function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}
