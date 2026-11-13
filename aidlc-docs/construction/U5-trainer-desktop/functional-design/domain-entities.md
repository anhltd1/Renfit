# U5 Trainer Desktop — Domain Entities

No new backend-facing types — reuses existing `lib/api/admin.ts` types (`CustomerSummary`,
`InbodyRecord`, `AddInbodyPayload`) and U2's `useAdminAuth()`. New client-side types are
composition/prop shapes only.

## Route composition
```ts
// app/pages/AdminDashboardRoute.tsx, AdminLoginRoute.tsx — same pattern as U3's *Route.tsx
```

## Desktop component props
```ts
interface DesktopSidebarListProps {
  customers: CustomerSummary[];
  selectedId: string | null;
  search: string;
  onSearchChange: (v: string) => void;
  onSelect: (customer: CustomerSummary) => void;
  loading: boolean;
  error: string;
}

interface SidebarRowProps {
  customer: CustomerSummary;
  selected: boolean;
  onClick: () => void;
}

interface CustomerDetailProps {
  customer: CustomerSummary;
  // no onBack prop on desktop — that was mobile-only in the combined component
}

interface DetailFieldProps {
  icon: ReactNode;
  label: string;
  value: string | number;
}

interface InbodySectionProps {
  customerId: string;
}

interface AddInbodyModalProps {
  open: boolean;
  customerId: string;
  lastRecord: InbodyRecord | null;
  onClose: () => void;
  onAdded: (record: InbodyRecord) => void;
}

interface DesktopAdminHeaderProps {
  view: 'clients' | 'bookings';
  onViewChange: (view: 'clients' | 'bookings') => void;
  customerCount: number;
  onRefresh: () => void;
  refreshing: boolean;
  onLogout: () => void;
}
```
