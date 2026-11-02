/**
 * useBatchBooking — state management for batch pre-booking mode (U13).
 * Manages member selection, staged slots, and submission.
 */
import { useCallback, useState } from 'react';
import { batchAssign, type BatchAssignResponse, type CustomerSummary } from '../../../lib/api/admin';

export function useBatchBooking() {
  const [active, setActive] = useState(false);
  const [member, setMember] = useState<CustomerSummary | null>(null);
  const [stagedSlots, setStagedSlots] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  /** Enter batch mode; optionally preselect a member (U23 "Đặt thêm buổi"). */
  const activate = useCallback((preset?: CustomerSummary) => {
    setActive(true);
    // Guard: also safe when used directly as an onClick handler (event arg).
    if (preset && typeof (preset as CustomerSummary).id === 'string') setMember(preset);
  }, []);
  const deactivate = useCallback(() => {
    setActive(false);
    setMember(null);
    setStagedSlots(new Set());
  }, []);

  const toggleSlot = useCallback((timeKey: string) => {
    setStagedSlots((prev) => {
      const next = new Set(prev);
      if (next.has(timeKey)) next.delete(timeKey);
      else next.add(timeKey);
      return next;
    });
  }, []);

  const submit = useCallback(async (): Promise<BatchAssignResponse | null> => {
    if (!member || stagedSlots.size === 0) return null;
    setSubmitting(true);
    try {
      const result = await batchAssign(member.id, Array.from(stagedSlots));
      return result;
    } finally {
      setSubmitting(false);
    }
  }, [member, stagedSlots]);

  const reset = useCallback(() => {
    setMember(null);
    setStagedSlots(new Set());
  }, []);

  return {
    active,
    activate,
    deactivate,
    member,
    setMember,
    stagedSlots,
    toggleSlot,
    submit,
    submitting,
    reset,
  };
}
