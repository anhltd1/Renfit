/**
 * Mobile signup page (U4 Trainee Mobile, TS-10, AUTH-1).
 * REPLACES the U3 temporary bridge with a full-bleed native-feeling layout,
 * using useAuth() (U2). Same fields/validation as desktop.
 */
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import {
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
import { Link } from '../../components/Link';
import { AvatarUpload } from '../../components/AvatarUpload';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import logoImage from '../../../imports/image.png';
import { markNewAccount } from '../../../lib/auth';
import { useAuth } from '../../shared/hooks/useAuth';

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
  name: '', phone_number: '', password: '', confirm_password: '',
  age: '20', goal: '', customGoal: '', health_note: '', address: '',
  height: '170', weight: '60', avatar: '',
};

function Field({ label, icon, hint, children }: { label: string; icon?: React.ReactNode; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-white/70 text-sm mb-2">
        {icon && <span className="text-primary-text">{icon}</span>}
        {label}
      </label>
      {children}
      {hint && <p className="text-white/64 text-xs mt-1">{hint}</p>}
    </div>
  );
}

function NumberStepper({
  value, onChange, min, max, step = 1, placeholder, unit,
}: {
  value: string; onChange: (v: string) => void; min: number; max: number;
  step?: number; placeholder?: string; unit?: string;
}) {
  const num = parseFloat(value) || 0;
  return (
    <div className="flex items-center bg-surface-2 border border-line-strong rounded-control overflow-hidden focus-within:border-[#0F6B3E] transition-colors">
      <button type="button" onClick={() => onChange(String(Math.max(min, parseFloat((num - step).toFixed(2)))))}
        disabled={num <= min && value !== ''} className="px-4 py-3 text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-20 transition-all shrink-0">
        <Minus className="w-3.5 h-3.5" />
      </button>
      <div className="flex-1 flex items-center justify-center gap-1 min-w-0">
        <input type="text" inputMode="decimal" value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^\d.]/g, ''))}
          onBlur={() => { if (!value) return; onChange(String(Math.min(max, Math.max(min, parseFloat(value) || min)))); }}
          placeholder={placeholder}
          className="w-16 bg-transparent text-center text-white placeholder:text-white/40 outline-none text-sm font-medium" />
        {unit && <span className="text-white/64 text-xs shrink-0">{unit}</span>}
      </div>
      <button type="button" onClick={() => onChange(String(Math.min(max, parseFloat((num + step).toFixed(2)))))}
        disabled={num >= max && value !== ''} className="px-4 py-3 text-white/40 hover:text-primary-text hover:bg-white/5 disabled:opacity-20 transition-all shrink-0">
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function SignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/dashboard';
  const { signup } = useAuth();

  const [form, setForm] = useState<FormState>(INITIAL);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
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
      await signup({
        name: form.name.trim(), phone_number: form.phone_number.trim(), password: form.password,
        age: ageNum, goal: resolvedGoal, health_note: form.health_note.trim(),
        address: form.address.trim(), height: form.height.trim(), weight: form.weight.trim(),
        avatar: form.avatar,
      });
      markNewAccount();
      navigate(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full bg-surface-2 border border-line-strong focus:border-primary-text focus:ring-2 focus:ring-primary-text/30 rounded-control px-4 py-3 text-white placeholder:text-white/40 outline-none transition-colors text-sm';

  return (
    <div
      className="min-h-[100dvh] w-full bg-[#0B0B0B] px-5 py-8"
      style={{ paddingTop: 'max(2rem, env(safe-area-inset-top))', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex flex-col items-center mb-8 mt-4">
        <Link to="/">
          <ImageWithFallback src={logoImage} alt="Renfit" className="h-12 w-auto mb-4" />
        </Link>
      </div>

      <h1 className="text-2xl font-semibold text-white mb-6">Tạo tài khoản</h1>

      <form onSubmit={handleSubmit} className="space-y-5" data-testid="signup-form">
        <div className="flex flex-col items-center gap-2 pb-5 border-b border-line">
          <AvatarUpload value={form.avatar} onChange={(b64) => setForm((f) => ({ ...f, avatar: b64 }))} size={110} disabled={loading} />
        </div>

        <div className="space-y-4 pb-5 border-b border-line">
          <p className="text-white/40 text-xs ">Tài khoản</p>
          <Field label="Họ và tên" icon={<User className="w-3.5 h-3.5" />}>
            <input type="text" value={form.name} onChange={set('name')} placeholder="Nguyễn Văn An" autoComplete="name" data-testid="input-name" className={inputCls} />
          </Field>
          <Field label="Số điện thoại" icon={<Phone className="w-3.5 h-3.5" />}>
            <input type="tel" value={form.phone_number} onChange={set('phone_number')} placeholder="0901234567" autoComplete="tel" data-testid="input-phone" className={inputCls} />
          </Field>
          <Field label="Mật khẩu" icon={<Lock className="w-3.5 h-3.5" />} hint="Ít nhất 6 ký tự">
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="••••••••" autoComplete="new-password" data-testid="input-password" className={`${inputCls} pr-12`} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/64">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </Field>
          <Field label="Nhập lại mật khẩu" icon={<Lock className="w-3.5 h-3.5" />}>
            <div className="relative">
              <input type={showConfirm ? 'text' : 'password'} value={form.confirm_password} onChange={set('confirm_password')} placeholder="••••••••" autoComplete="new-password" data-testid="input-confirm-password" className={`${inputCls} pr-12`} />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} aria-label={showConfirm ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/64">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </Field>
        </div>

        <div className="space-y-4 pb-5 border-b border-line">
          <p className="text-white/40 text-xs ">Thông tin cá nhân</p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Tuổi">
              <NumberStepper value={form.age} onChange={(v) => setForm((f) => ({ ...f, age: v }))} min={10} max={100} placeholder="25" unit="tuổi" />
            </Field>
            <Field label="Địa chỉ" icon={<MapPin className="w-3.5 h-3.5" />}>
              <input type="text" value={form.address} onChange={set('address')} placeholder="TP. Hồ Chí Minh" className={inputCls} />
            </Field>
          </div>
          <Field label="Mục tiêu tập luyện" icon={<Target className="w-3.5 h-3.5" />}>
            <div className="flex flex-wrap gap-2">
              {[...PRESET_GOALS, 'Khác'].map((g) => (
                <button key={g} type="button" onClick={() => setForm((f) => ({ ...f, goal: g, customGoal: g === 'Khác' ? f.customGoal : '' }))}
                  className={`px-3 py-1.5 rounded-control text-sm border transition-all duration-200 ${form.goal === g ? 'bg-primary border-[#0F6B3E] text-white' : 'bg-white/5 border-line text-white/64'}`}>
                  {g}
                </button>
              ))}
            </div>
            {form.goal === 'Khác' && (
              <input type="text" value={form.customGoal} onChange={(e) => setForm((f) => ({ ...f, customGoal: e.target.value }))} placeholder="Mô tả mục tiêu của bạn..." className={`${inputCls} mt-2`} autoFocus />
            )}
          </Field>
          <Field label="Tình trạng sức khỏe" hint="Các bệnh lý, chấn thương hoặc lưu ý cần biết (nếu có)">
            <textarea value={form.health_note} onChange={set('health_note')} placeholder="Ví dụ: đau lưng nhẹ, cao huyết áp..." rows={2} className={`${inputCls} resize-none`} />
          </Field>
        </div>

        <div className="space-y-4">
          <p className="text-white/40 text-xs ">Số đo cơ thể</p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Chiều cao" icon={<Weight className="w-3.5 h-3.5" />}>
              <NumberStepper value={form.height} onChange={(v) => setForm((f) => ({ ...f, height: v }))} min={100} max={250} placeholder="170" unit="cm" />
            </Field>
            <Field label="Cân nặng" icon={<Weight className="w-3.5 h-3.5" />}>
              <NumberStepper value={form.weight} onChange={(v) => setForm((f) => ({ ...f, weight: v }))} min={30} max={300} step={0.5} placeholder="65" unit="kg" />
            </Field>
          </div>
        </div>

        {error && (
          <p className="text-error-text text-sm bg-[#f87171]/[0.06] border border-error-text/30 rounded-control px-4 py-2.5" data-testid="signup-error">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} data-testid="signup-submit-button"
          className="w-full bg-primary hover:bg-primary-hover disabled:opacity-60 text-white font-semibold py-3.5 rounded-full transition-colors">
          {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
        </button>
      </form>

      <p className="text-center text-white/64 text-sm mt-6">
        Đã có tài khoản?{' '}
        <Link to={`/login${redirect !== '/dashboard' ? `?redirect=${redirect}` : ''}`} className="text-primary-text hover:text-white font-medium transition-colors">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
