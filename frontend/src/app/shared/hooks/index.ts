// Renfit shared data hooks (U2 Shared Data Layer).
// Wrap frontend/src/lib/api/* so both the desktop and mobile trees (U3-U6)
// consume identical data-fetching logic. See:
// .kiro/aidlc-docs/construction/U2-shared-data-layer/functional-design/
export { useBookingAvailability, useCreateBooking, useCancelBooking } from './useBookingAvailability';
export { useAdminBookings, useUpdateBookingStatus, useAssignBooking, useCustomers } from './useAdminBookings';
export { useInbodyHistory, useAddInbody } from './useInbody';
export { useProfile } from './useProfile';
export { useChat } from './useChat';
export { useNotifications } from './useNotifications';
export { useTrainerNotifications } from './useTrainerNotifications';
export { useAuth } from './useAuth';
export { useAdminAuth } from './useAdminAuth';
export type { QueryState } from './useQuery';
