import { useCallback } from 'react';
import { fetchMyInbody, type InbodyRecordOut } from '../../../lib/api/profile';
import { addInbody, fetchInbody, type AddInbodyPayload, type InbodyRecord } from '../../../lib/api/admin';
import { useQueryState, type QueryState } from './useQuery';

/**
 * InBody history for a customer (U2 Shared Data Layer).
 *
 * `viewer` picks the underlying endpoint: 'customer' hits the trainee's own
 * read-only `/api/v1/profile/inbody` (lib/api/profile.ts); 'admin' hits the
 * trainer-only `/api/v1/admin/customers/{id}/inbody` (lib/api/admin.ts).
 * Same customer, different auth context — see backend-architecture.md.
 */
export function useInbodyHistory(
  customerId: string,
  viewer: 'customer' | 'admin' = 'customer',
): QueryState<InbodyRecordOut[] | InbodyRecord[]> {
  return useQueryState(
    () => (viewer === 'admin' ? fetchInbody(customerId) : fetchMyInbody(customerId)),
    [customerId, viewer],
  );
}

/** Trainer-only — records a new InBody measurement for a customer. */
export function useAddInbody() {
  return useCallback(
    (customerId: string, payload: AddInbodyPayload): Promise<InbodyRecord> =>
      addInbody(customerId, payload),
    [],
  );
}
