import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import {
  Bot,
  Eye,
  EyeOff,
  Lock,
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
import { signup } from '../../lib/api/auth';
import { setAuthUser } from '../../lib/auth';

const PRESET_GOALS = ['Giảm cân', 'Tăng cơ', 'Cải thiện sức khỏe', 'Tăng sức bền', 'Linh hoạt & phục hồi'];

interface FormState {
  name: string;
  phone_number: string;
  password: string;
  confirm_password: string;
  age: string;
  goal: string;
  customGoal: string;
  health_note: string;
  address: string;
  height: string;
  weight: string;
  avatar: string;
}

const INITIAL: FormState = {
  name: '',
  phone_number: '',
  password: '',
  confirm_password: '',
  age: '20',
  goal: '',
  customGoal: '',
  health_note: '',
  address: '',
  height: '170',
  weight: '60',
  avatar: '',
};

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
          onChange={(e) => {
            const v = e.target.value.replace(/[^\d.]/g, '');
            onChange(v);
          }}
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

export function SignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/ai-coach';

  const [form, setForm] = useState<FormState>(INITIAL);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) return setError('Vui lòng nhập họ và tên.');
    if (!form.phone_number.trim()) return setError('Vui lòng nhập số điện thoại.');
    if (form.password.length < 6) return setError('Mật khẩu phải có ít nhất 6 ký tự.');
    if (form.password !== form.confirm_password) return setError('Mật khẩu nhập lại không khớp.');
    const ageNum = Number(form.age);
    if (!form.age || isNaN(ageNum) || ageNum < 10) return setError('Tuổi phải là số và ít nhất 10.');

    setLoading(true);
    const resolvedGoal = form.goal === 'Khác' ? form.customGoal.trim() : form.goal.trim();
    try {
      const user = await signup({
        name: form.name.trim(),
        phone_number: form.phone_number.trim(),
        password: form.password,
        age: ageNum,
        goal: resolvedGoal,
        health_note: form.health_note.trim(),
        address: form.address.trim(),
        height: form.height.trim(),
        weight: form.weight.trim(),
        avatar: form.avatar,
      });
      setAuthUser(user);
      navigate(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    'w-full bg-white/5 border border-white/10 focus:border-[#0F6B3E] rounded-2xl px-4 py-3 text-white placeholder:text-white/30 outline-none transition-colors text-sm';

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
          <div className="flex items-center gap-2 bg-[#0F6B3E]/20 px-4 py-2 rounded-full border border-[#0F6B3E]/30">
            <Bot className="w-4 h-4 text-[#0F6B3E]" />
            <span className="text-[#0F6B3E] text-sm font-medium">AI Fitness Coach</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-[0_0_50px_rgba(15,107,62,0.15)]">
          <h1 className="text-2xl font-bold text-white mb-1">Tạo tài khoản</h1>
          <p className="text-white/50 text-sm mb-8">
            Điền thông tin để cá nhân hóa trải nghiệm của bạn
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* ── Avatar ───────────────────────────────────── */}
            <div className="flex flex-col items-center gap-2 pb-5 border-b border-white/8">
              <AvatarUpload
                value={form.avatar}
                onChange={(b64) => setForm((f) => ({ ...f, avatar: b64 }))}
                size={132}
                disabled={loading}
              />
              <p className="text-white/30 text-xs">Nhấn để chọn ảnh đại diện</p>
            </div>

            {/* ── Account info ─────────────────────────────── */}
            <div className="space-y-4 pb-5 border-b border-white/8">
              <p className="text-white/40 text-xs uppercase tracking-widest">Tài khoản</p>

              <Field label="Họ và tên" icon={<User className="w-3.5 h-3.5" />}>
                <input
                  type="text"
                  value={form.name}
                  onChange={set('name')}
                  placeholder="Nguyễn Văn An"
                  autoComplete="name"
                  className={inputCls}
                />
              </Field>

              <Field label="Số điện thoại" icon={<Phone className="w-3.5 h-3.5" />}>
                <input
                  type="tel"
                  value={form.phone_number}
                  onChange={set('phone_number')}
                  placeholder="0901234567"
                  autoComplete="tel"
                  className={inputCls}
                />
              </Field>

              <Field label="Mật khẩu" icon={<Lock className="w-3.5 h-3.5" />} hint="Ít nhất 6 ký tự">
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={set('password')}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className={`${inputCls} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </Field>

              <Field label="Nhập lại mật khẩu" icon={<Lock className="w-3.5 h-3.5" />}>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={form.confirm_password}
                    onChange={set('confirm_password')}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className={`${inputCls} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </Field>
            </div>

            {/* ── Personal info ─────────────────────────────── */}
            <div className="space-y-4 pb-5 border-b border-white/8">
              <p className="text-white/40 text-xs uppercase tracking-widest">Thông tin cá nhân</p>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Tuổi">
                  <NumberStepper
                    value={form.age}
                    onChange={(v) => setForm((f) => ({ ...f, age: v }))}
                    min={10}
                    max={100}
                    placeholder="25"
                    unit="tuổi"
                  />
                </Field>

                <Field label="Địa chỉ" icon={<MapPin className="w-3.5 h-3.5" />}>
                  <input
                    type="text"
                    value={form.address}
                    onChange={set('address')}
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
                      onClick={() => setForm((f) => ({ ...f, goal: g, customGoal: g === 'Khác' ? f.customGoal : '' }))}
                      className={`px-3 py-1.5 rounded-xl text-sm border transition-all duration-200 ${
                        form.goal === g
                          ? 'bg-[#0F6B3E] border-[#0F6B3E] text-white'
                          : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30 hover:text-white'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
                {form.goal === 'Khác' && (
                  <input
                    type="text"
                    value={form.customGoal}
                    onChange={(e) => setForm((f) => ({ ...f, customGoal: e.target.value }))}
                    placeholder="Mô tả mục tiêu của bạn..."
                    className={`${inputCls} mt-2`}
                    autoFocus
                  />
                )}
              </Field>

              <Field
                label="Tình trạng sức khỏe"
                hint="Các bệnh lý, chấn thương hoặc lưu ý cần biết (nếu có)"
              >
                <textarea
                  value={form.health_note}
                  onChange={set('health_note')}
                  placeholder="Ví dụ: đau lưng nhẹ, cao huyết áp..."
                  rows={2}
                  className={`${inputCls} resize-none`}
                />
              </Field>
            </div>

            {/* ── Body metrics ─────────────────────────────── */}
            <div className="space-y-4">
              <p className="text-white/40 text-xs uppercase tracking-widest">Số đo cơ thể</p>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Chiều cao" icon={<Weight className="w-3.5 h-3.5" />}>
                  <NumberStepper
                    value={form.height}
                    onChange={(v) => setForm((f) => ({ ...f, height: v }))}
                    min={100}
                    max={250}
                    placeholder="170"
                    unit="cm"
                  />
                </Field>
                <Field label="Cân nặng" icon={<Weight className="w-3.5 h-3.5" />}>
                  <NumberStepper
                    value={form.weight}
                    onChange={(v) => setForm((f) => ({ ...f, weight: v }))}
                    min={30}
                    max={300}
                    step={0.5}
                    placeholder="65"
                    unit="kg"
                  />
                </Field>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0F6B3E] hover:bg-[#0F6B3E]/90 disabled:opacity-60 text-white font-semibold py-3.5 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(15,107,62,0.4)]"
            >
              {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
            </button>
          </form>

          <p className="text-center text-white/40 text-sm mt-6">
            Đã có tài khoản?{' '}
            <Link
              to={`/login${redirect !== '/ai-coach' ? `?redirect=${redirect}` : ''}`}
              className="text-[#0F6B3E] hover:text-[#0F6B3E]/80 font-medium transition-colors"
            >
              Đăng nhập
            </Link>
          </p>
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
