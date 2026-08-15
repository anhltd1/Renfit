/**
 * MemberFormModal — Create or edit a member (PT-side, U14).
 * Used on both desktop (as a modal) and mobile (as a sheet-like overlay).
 * Create mode shows a generated temp password on success.
 */
import { useState } from 'react';
import { Check, Copy, Loader2, X } from 'lucide-react';
import {
  createMember,
  editMember,
  type CreateMemberPayload,
  type CustomerSummary,
  type EditMemberPayload,
} from '../../lib/api/admin';
import { haptic } from '../shared/primitives/haptics';

const PRESET_GOALS = ['Giảm cân', 'Tăng cơ', 'Cải thiện sức khỏe', 'Tăng sức bền', 'Linh hoạt & phục hồi'];

interface MemberFormModalProps {
  mode: 'create' | 'edit';
  customer?: CustomerSummary;
  onClose: () => void;
  onSaved: () => void;
}

export function MemberFormModal({ mode, customer, onClose, onSaved }: MemberFormModalProps) {
  const [name, setName] = useState(customer?.id ?? '');
  const [phone, setPhone] = useState(customer?.phone_number ?? '');
  const [age, setAge] = useState(String(customer?.age ?? '20'));
  const [goal, setGoal] = useState(customer?.goal ?? '');
  const [healthNote, setHealthNote] = useState(customer?.health_note ?? '');
  const [address, setAddress] = useState(customer?.address ?? '');
  const [height, setHeight] = useState(customer?.height ?? '');
  const [weight, setWeight] = useState(customer?.weight ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/30 outline-none focus:border-[#0F6B3E] transition-colors';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const ageNum = Number(age);

    if (mode === 'create') {
      if (!name.trim()) return setError('Vui lòng nhập họ và tên.');
      if (!phone.trim()) return setError('Vui lòng nhập số điện thoại.');
      if (!age || isNaN(ageNum) || ageNum < 10) return setError('Tuổi phải là số và ít nhất 10.');
    }

    setSubmitting(true);
    haptic();
    try {
      if (mode === 'create') {
        const payload: CreateMemberPayload = {
          name: name.trim(),
          phone_number: phone.trim(),
          age: ageNum,
          goal: goal.trim(),
          health_note: healthNote.trim(),
          address: address.trim(),
          height: height.trim(),
          weight: weight.trim(),
        };
        const result = await createMember(payload);
        setTempPassword(result.temporary_password);
      } else {
        const payload: EditMemberPayload = {};
        if (age && !isNaN(ageNum)) payload.age = ageNum;
        if (goal) payload.goal = goal.trim();
        if (healthNote !== undefined) payload.health_note = healthNote.trim();
        if (address !== undefined) payload.address = address.trim();
        if (height) payload.height = height.trim();
        if (weight) payload.weight = weight.trim();
        await editMember(customer!.id, payload);
        onSaved();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Thao tác thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = () => {
    if (tempPassword) {
      navigator.clipboard.writeText(tempPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Success screen for create mode
  if (tempPassword) {
    return (
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="bg-[#111] border border-white/12 rounded-2xl w-full max-w-sm shadow-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-[#0F6B3E]" />
            <h3 className="text-white font-bold text-base">Tạo hội viên thành công</h3>
          </div>
          <p className="text-white/60 text-sm">Mật khẩu tạm thời (gửi cho hội viên để đăng nhập lần đầu):</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-white font-mono text-lg tracking-wider text-center">
              {tempPassword}
            </code>
            <button type="button" onClick={handleCopy}
              className="p-3 rounded-xl bg-[#0F6B3E]/20 border border-[#0F6B3E]/30 text-[#0F6B3E] hover:bg-[#0F6B3E]/30 transition-all"
              title="Sao chép">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <button type="button" onClick={() => { onSaved(); onClose(); }}
            className="w-full py-3 rounded-xl bg-[#0F6B3E] text-white font-semibold text-sm hover:bg-[#0F6B3E]/80 transition-all">
            Đóng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <form onSubmit={handleSubmit}
        className="bg-[#111] border border-white/12 rounded-2xl w-full max-w-md shadow-2xl p-5 flex flex-col gap-3 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-1">
          <h3 className="text-white font-bold text-base">
            {mode === 'create' ? 'Tạo hội viên mới' : `Chỉnh sửa — ${customer?.id}`}
          </h3>
          <button type="button" onClick={onClose} aria-label="Đóng" className="text-white/40 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Name + Phone (create only) */}
        {mode === 'create' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/50 text-xs mb-1 block">Họ và tên *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Nguyễn Văn A" />
            </div>
            <div>
              <label className="text-white/50 text-xs mb-1 block">Số điện thoại *</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} placeholder="0912345678" />
            </div>
          </div>
        )}

        {/* Age */}
        <div>
          <label className="text-white/50 text-xs mb-1 block">Tuổi</label>
          <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className={inputCls} min={10} max={100} />
        </div>

        {/* Goal */}
        <div>
          <label className="text-white/50 text-xs mb-1 block">Mục tiêu</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {PRESET_GOALS.map((g) => (
              <button key={g} type="button" onClick={() => setGoal(g)}
                className={`px-2.5 py-1 rounded-full text-xs border transition-all ${
                  goal === g ? 'bg-[#0F6B3E] border-[#0F6B3E] text-white' : 'border-white/15 text-white/50 hover:border-white/30'
                }`}>{g}</button>
            ))}
          </div>
          <input type="text" value={goal} onChange={(e) => setGoal(e.target.value)} className={inputCls} placeholder="Hoặc nhập mục tiêu khác..." />
        </div>

        {/* Health note */}
        <div>
          <label className="text-white/50 text-xs mb-1 block">Tình trạng sức khỏe</label>
          <textarea value={healthNote} onChange={(e) => setHealthNote(e.target.value)} rows={2} className={`${inputCls} resize-none`} placeholder="Bệnh lý, chấn thương..." />
        </div>

        {/* Address */}
        <div>
          <label className="text-white/50 text-xs mb-1 block">Địa chỉ</label>
          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={inputCls} placeholder="TP. Hồ Chí Minh" />
        </div>

        {/* Height + Weight */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-white/50 text-xs mb-1 block">Chiều cao (cm)</label>
            <input type="text" value={height} onChange={(e) => setHeight(e.target.value)} className={inputCls} placeholder="170" />
          </div>
          <div>
            <label className="text-white/50 text-xs mb-1 block">Cân nặng (kg)</label>
            <input type="text" value={weight} onChange={(e) => setWeight(e.target.value)} className={inputCls} placeholder="60" />
          </div>
        </div>

        {/* Error */}
        {error && <p className="text-red-400 text-xs bg-red-400/10 rounded-lg px-3 py-2">{error}</p>}

        {/* Actions */}
        <div className="flex gap-3 mt-1">
          <button type="button" onClick={onClose}
            className="flex-1 bg-white/5 hover:bg-white/10 border border-white/12 text-white/70 py-2.5 rounded-xl text-sm transition-all">
            Huỷ
          </button>
          <button type="submit" disabled={submitting}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#0F6B3E] hover:bg-[#0F6B3E]/80 disabled:opacity-40 transition-all">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : mode === 'create' ? 'Tạo hội viên' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </div>
  );
}
