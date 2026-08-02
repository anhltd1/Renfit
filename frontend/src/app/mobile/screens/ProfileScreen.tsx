/**
 * Mobile profile form screen (U4 Trainee Mobile, TS-7, AUTH-1/PARITY-1).
 * Same fields/validation as the desktop OverviewTab's profile form, using
 * useProfile() (U2) — full-bleed layout instead of a centered max-w-4xl card.
 */
import React, { useState } from 'react';
import { Activity, Check, Eye, EyeOff, MapPin, Minus, Phone, Plus, Target, Weight } from 'lucide-react';
import { AvatarUpload } from '../../components/AvatarUpload';
import { useProfile } from '../../shared/hooks/useProfile';
import { StackHeader } from '../shell/StackHeader';

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

export interface ProfileScreenProps {
  onBack: () => void;
}

export function ProfileScreen({ onBack }: ProfileScreenProps) {
  const { user, update } = useProfile();
  const isCustomGoal = !!user?.goal && !PRESET_GOALS.includes(user.goal);

  const [avatar, setAvatar]         = useState(user?.avatar ?? '');
  const [goal, setGoal]             = useState(isCustomGoal ? 'Khác' : user?.goal ?? '');
  const [customGoal, setCustomGoal] = useState(isCustomGoal ? user?.goal ?? '' : '');
  const [healthNote, setHealthNote] = useState(user?.health_note ?? '');
  const [address, setAddress]       = useState(user?.address ?? '');
  const [age, setAge]               = useState(String(user?.age ?? '20'));
  const [height, setHeight]         = useState(user?.height ?? '170');
  const [weight, setWeight]         = useState(user?.weight ?? '60');
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
        height: height.trim(), weight: weight.trim(),
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
    <div className="flex flex-col min-h-0 flex-1">
      <StackHeader title="Hồ sơ cá nhân" onBack={onBack} />
      <div className="flex-1 overflow-y-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-5" data-testid="mobile-profile-form">
          <div className="flex flex-col items-center gap-3 pb-5 border-b border-white/8">
            <AvatarUpload value={avatar} onChange={setAvatar} size={88} disabled={loading} />
            <div className="text-center">
              <h3 className="text-white font-bold text-lg">{user.id}</h3>
              <p className="text-white/40 text-sm flex items-center justify-center gap-1.5 mt-1">
                <Phone className="w-3.5 h-3.5" />{user.phone_number}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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

          <div>
            <label className="text-white/60 text-xs uppercase tracking-widest mb-2 flex items-center gap-1">
              <Target className="w-3 h-3 text-[#0F6B3E]" /> Mục tiêu tập luyện
            </label>
            <div className="flex flex-wrap gap-2">
              {[...PRESET_GOALS, 'Khác'].map((g) => (
                <button key={g} type="button" onClick={() => setGoal(g)}
                  className={`px-3 py-1.5 rounded-xl text-sm border transition-all duration-200 ${
                    goal === g ? 'bg-[#0F6B3E] border-[#0F6B3E] text-white' : 'bg-white/5 border-white/10 text-white/60'
                  }`}>{g}</button>
              ))}
            </div>
            {goal === 'Khác' && (
              <input type="text" value={customGoal} onChange={(e) => setCustomGoal(e.target.value)}
                placeholder="Mô tả mục tiêu..." className={`${inputCls} mt-2`} autoFocus />
            )}
          </div>

          <div>
            <label className="text-white/60 text-xs uppercase tracking-widest mb-2 flex items-center gap-1">
              <Activity className="w-3 h-3 text-[#0F6B3E]" /> Tình trạng sức khỏe
            </label>
            <textarea value={healthNote} onChange={(e) => setHealthNote(e.target.value)}
              placeholder="Bệnh lý, chấn thương hoặc lưu ý (nếu có)..."
              rows={2} className={`${inputCls} resize-none`} />
          </div>

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

          <details className="group">
            <summary className="text-white/40 text-xs uppercase tracking-widest cursor-pointer select-none">
              Đổi mật khẩu <span className="normal-case text-white/20">(bỏ trống nếu không đổi)</span>
            </summary>
            <div className="mt-4 space-y-3">
              <div className="relative">
                <input type={showCurPw ? 'text' : 'password'} value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)} placeholder="Mật khẩu hiện tại"
                  autoComplete="current-password" className={`${inputCls} pr-12`} />
                <button type="button" onClick={() => setShowCurPw(!showCurPw)}
                  aria-label={showCurPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30">
                  {showCurPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <input type={showNewPw ? 'text' : 'password'} value={newPw}
                    onChange={(e) => setNewPw(e.target.value)} placeholder="Mật khẩu mới"
                    autoComplete="new-password" className={`${inputCls} pr-10`} />
                  <button type="button" onClick={() => setShowNewPw(!showNewPw)}
                    aria-label={showNewPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30">
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
                  placeholder="Xác nhận mới" autoComplete="new-password" className={inputCls} />
              </div>
            </div>
          </details>

          {error && <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-2.5" data-testid="mobile-profile-error">{error}</p>}
          {success && (
            <p className="text-green-400 text-sm bg-green-400/10 border border-green-400/20 rounded-xl px-4 py-2.5 flex items-center gap-2" data-testid="mobile-profile-success">
              <Check className="w-4 h-4 shrink-0" />{success}
            </p>
          )}

          <button type="submit" disabled={loading} data-testid="mobile-profile-save-button"
            className="w-full bg-[#0F6B3E] hover:bg-[#0F6B3E]/90 disabled:opacity-60 text-white font-semibold py-3.5 rounded-2xl transition-all duration-300">
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </form>
      </div>
    </div>
  );
}
