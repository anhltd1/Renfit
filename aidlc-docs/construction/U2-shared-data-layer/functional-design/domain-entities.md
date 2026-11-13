# U2 Shared Data Layer — Domain Entities (hook return shapes)

All entity/payload types are re-exported from the existing `lib/api/*` modules unchanged — U2
does not introduce new data shapes, only new hook wrappers.

```ts
// Generic query hook shape
interface QueryState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: (silent?: boolean) => Promise<void>;
}

// Generic mutation hook shape
type MutationFn<Args extends unknown[], R> = (...args: Args) => Promise<R>;
```

## Hook Inventory (return types)
```ts
useBookingAvailability(customerId: string): QueryState<Availability>
useCreateBooking(): MutationFn<[customerId: string, time: string], CreateBookingResult>
useCancelBooking(): MutationFn<[customerId: string, bookingId: string], { message: string }>

useAdminBookings(): QueryState<AdminBookings>            // 5s silent poll, pauses while a modal/sheet is open
useUpdateBookingStatus(): MutationFn<[bookingId: string, status: BookingStatus], { message: string }>
useAssignBooking(): MutationFn<[customerId: string, time: string, note?: string], { message: string }>
useCustomers(): QueryState<CustomerSummary[]>
useInbodyHistory(customerId: string): QueryState<InbodyRecord[]>   // works for both customer + admin call sites
useAddInbody(): MutationFn<[customerId: string, payload: AddInbodyPayload], InbodyRecord>

useProfile(): { user: AuthUser | null; update: MutationFn<[UpdateProfilePayload], AuthUser> }
useChat(): {
  send: MutationFn<[ChatRequest], ChatResponse>;
}

useNotifications(customerId: string): QueryState<AppNotification[]> & { unreadCount: number }  // 30s poll
useTrainerNotifications(): QueryState<TrainerNotification[]> & { unreadCount: number }         // 10s poll + popup queue

useAuth(): { user: AuthUser | null; login: MutationFn<[LoginPayload], AuthUser>;
             signup: MutationFn<[SignupPayload], AuthUser>; logout: () => void }
useAdminAuth(): { token: string | null; login: MutationFn<[string, string], string>; logout: () => void }
```

No backend schema involved — these are purely client-side TypeScript function/hook signatures.
