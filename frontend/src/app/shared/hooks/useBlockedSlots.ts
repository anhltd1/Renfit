/**
 * useBlockedSlots — CRUD for blocked time slots (U12).
 * Fetches on mount, re-fetches after mutations.
 */
import { useCallback, useEffect, useState } from 'react';
import {
  cancelBlockedSlotBookings,
  createBlockedSlot,
  deleteBlockedSlot,
  fetchBlockedSlots,
  type BlockedSlot,
} from '../../../lib/api/admin';

export function useBlockedSlots() {
  const [blocks, setBlocks] = useState<BlockedSlot[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setBlocks(await fetchBlockedSlots());
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const createBlock = useCallback(async (date: string, hours: number[] | 'all', reason: string) => {
    await createBlockedSlot(date, hours, reason);
    await load();
  }, [load]);

  const removeBlock = useCallback(async (id: string) => {
    await deleteBlockedSlot(id);
    await load();
  }, [load]);

  const cancelAffectedBookings = useCallback(async (id: string) => {
    const result = await cancelBlockedSlotBookings(id);
    await load();
    return result;
  }, [load]);

  /** Check if a specific date+hour is blocked. */
  const isBlocked = useCallback((date: string, hour: number): boolean => {
    return blocks.some((b) => {
      if (b.date !== date) return false;
      if (b.hours === 'all') return true;
      return (b.hours as number[]).includes(hour);
    });
  }, [blocks]);

  return { blocks, loading, createBlock, removeBlock, cancelAffectedBookings, isBlocked, refetch: load };
}
