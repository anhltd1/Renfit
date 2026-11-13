# U6 Trainer Mobile — Domain Entities

No new backend-facing types — reuses `lib/api/admin.ts` types (`CustomerSummary`, `InbodyRecord`,
`AddInbodyPayload`) and U2's `useAdminAuth()`/`useCustomers()`/`useInbodyHistory()`/`useAddInbody()`.
`useStack<T>` (U4) is reused as-is — no changes to its generic shape.

## Trainer mobile tab key
```ts
// app/mobile/shell/AdminBottomTabBar.tsx
export type AdminMobileTabKey = 'clients' | 'bookings';
```

## Trainer mobile stack screen (per the "clients" tab)
```ts
type ClientsStackScreen = 'root' | 'detail';
```

## Component props

```ts
interface AdminBottomTabBarProps {
  active: AdminMobileTabKey;
  onChange: (tab: AdminMobileTabKey) => void;
}

interface CustomerListScreenProps {
  customers: CustomerSummary[];
  loading: boolean;
  error: string;
  search: string;
  onSearchChange: (v: string) => void;
  onSelect: (customer: CustomerSummary) => void;
  onRefresh: () => void;
  refreshing: boolean;
  onLogout: () => void;
}

interface CustomerDetailScreenProps {
  customer: CustomerSummary;
  onBack: () => void;
}

interface InbodySectionMobileProps {
  customerId: string;
}

interface AddInbodySheetProps {
  open: boolean;
  customerId: string;
  lastRecord: InbodyRecord | null;
  onClose: () => void;
  onAdded: (record: InbodyRecord) => void;
}
```

## Route composition
```ts
// app/pages/AdminDashboardRoute.tsx, AdminLoginRoute.tsx — unchanged from U5, already device-split;
// only their `../mobile/pages/*` import targets get real implementations in this unit.
```
