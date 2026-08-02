/**
 * Add-InBody-record modal (U5 Trainer Desktop, MODAL-1).
 * Same form fields/validation as the original hand-rolled overlay, rebuilt
 * on the shared `Modal` primitive for chrome (backdrop, close button, esc-to-close).
 */
import { useState } from 'react';
import { Modal } from '../../shared/primitives/Modal';
import { addInbody, type AddInbodyPayload, type InbodyRecord } from '../../../lib/api/admin';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export interface AddInbodyModalProps {
  open: boolean;
  customerId: string;
  lastRecord: InbodyRecord | null;
  onClose: () => void;
  onAdded: (record: InbodyRecord) => void;
}

export function AddInbodyModal({ open, customerId, lastRecord, onClose, onAdded }: AddInbodyModalProps) {
  const [form, setForm] = useState({
    height: lastRecord ? String(lastRecord.height) : '',
    weight: '',
    SMM: '',
    BFM: '',
    date_recorded: today(),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const h = parseFloat(form.height);
    const w = parseFloat(form.weight);
    const smm = parseFloat(form.SMM);
    const bfm = parseFloat(form.BFM);
    if (!h || !w || isNaN(smm) || isNaN(bfm)) return setError('Vui lòng nhập đầy đủ và hợp lệ.');
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
    <Modal open={open} onClose={onClose} title="Nhập chỉ số InBody">
      <p className="text-white/35 text-xs -mt-3 mb-4">Kết quả đo từ máy InBody tại phòng gym</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-white/50 text-xs mb-1.5 block">Ngày đo</label>
          <input
            type="date"
            value={form.date_recorded}
            onChange={set('date_recorded')}
            className={inputCls + ' [color-scheme:dark]'}
          />
        </div>

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
              <p className="text-white/50 text-[10px] mt-1">Lần trước: {lastRecord.height} cm</p>
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
            <input type="number" step="0.01" value={form.SMM} onChange={set('SMM')} placeholder="0.0" className={inputCls} />
          </div>
          <div>
            <label className="text-white/50 text-xs mb-1.5 block">
              BFM <span className="text-white/25">(kg) — Mỡ cơ thể</span>
            </label>
            <input type="number" step="0.01" value={form.BFM} onChange={set('BFM')} placeholder="0.0" className={inputCls} />
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-2.5">{error}</p>
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
    </Modal>
  );
}
