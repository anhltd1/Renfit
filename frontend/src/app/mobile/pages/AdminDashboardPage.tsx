/**
 * Trainer mobile dashboard (U6 Trainer Mobile, TR-2/TR-4/TR-5/TR-6).
 * Native-like mobile experience: bottom tabs (Hôm nay / Hội viên / Lịch đặt /
 * Trang chủ) + a stack for the customer list → detail flow (SHELL-1/SHELL-2).
 *
 * U24 (FR-4/FR-5/FR-13, A6):
 *  - One shared header-actions cluster (bell + overflow menu: Làm mới /
 *    Chế độ máy tính bảng / Tự động / Đăng xuất) on every PT tab.
 *  - Hôm nay → tap a session/pending row opens that member's detail on the
 *    Hội viên tab; Back from that detail returns to Hôm nay.
 *  - Lịch đặt defaults to the single-day agenda (`?day=`, default today
 *    omitted); "Lưới 2 tuần" swaps in the existing AdminBookings grid (batch
 *    booking lives there). The agenda/grid choice is component state only.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { CalendarRange } from 'lucide-react';
import { fetchCustomers, type CustomerSummary } from '../../../lib/api/admin';
import {
  readDateParam,
  readParam,
  useInitialSearchParams,
  useSyncSearchParams,
} from '../../shared/hooks/useDashboardUrlState';
import { clearAdminToken } from '../../../lib/adminAuth';
import { AdminBookings } from '../../components/AdminBookings';
import { AdminBottomTabBar, type AdminMobileTabKey } from '../shell/AdminBottomTabBar';
import { AdminHeaderActions } from '../shell/AdminHeaderActions';
import { useStack } from '../shell/useStack';
import { CustomerListScreen } from '../screens/CustomerListScreen';
import { CustomerDetailScreen } from '../screens/CustomerDetailScreen';
import { AdminDayAgenda } from '../screens/AdminDayAgenda';
import { AdminTodayScreen } from '../../desktop/components/AdminTodayScreen';
import { MemberFormModal } from '../../components/MemberFormModal';
import { CmsEditor } from '../../shared/components/CmsEditor';
import { useAppShell } from '../../shared/hooks/useAppShell';
import { ictDateString } from '../../shared/clients/clientFilters';
import { StackHeader } from '../shell/StackHeader';

type ClientsStackScreen = 'root' | 'detail';

const ADMIN_TABS: readonly AdminMobileTabKey[] = ['today', 'clients', 'bookings', 'cms'];

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const initialParams = useInitialSearchParams();
  const [activeTab, setActiveTab] = useState<AdminMobileTabKey>(() =>
    readParam(initialParams, 'tab', ADMIN_TABS, 'today'),
  );
  // Member whose detail screen to open once customers are loaded (`?member=`,
  // or a tap on a Hôm nay row before the list arrived).
  const pendingMember = useRef<string | null>(
    initialParams.get('tab') === 'clients' ? initialParams.get('member') : null,
  );
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<CustomerSummary | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [creatingMember, setCreatingMember] = useState(false);
  // Detail opened from Hôm nay → Back returns there.
  const [detailOrigin, setDetailOrigin] = useState<'clients' | 'today'>('clients');

  // Lịch đặt: agenda (default) vs 2-week grid; selected agenda day.
  const today = ictDateString();
  const [bookingsView, setBookingsView] = useState<'agenda' | 'grid'>('agenda');
  const [agendaDay, setAgendaDay] = useState<string>(() => readDateParam(initialParams, 'day', today));

  const clientsStack = useStack<ClientsStackScreen>('root');

  useAppShell();

  // Mirror the open tab, member detail and agenda day into the URL so a
  // refresh lands back on it. Defaults are omitted.
  useSyncSearchParams({
    tab: activeTab === 'today' ? null : activeTab,
    member:
      activeTab === 'clients'
        ? clientsStack.current === 'detail'
          ? (selected?.id ?? null)
          : pendingMember.current
        : null,
    day: activeTab === 'bookings' && bookingsView === 'agenda' && agendaDay !== today ? agendaDay : null,
  });

  const openDetail = (customer: CustomerSummary) => {
    setSelected(customer);
    if (clientsStack.current !== 'detail') clientsStack.push('detail');
  };

  const load = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const data = await fetchCustomers();
      setCustomers(data);
      const restoreId = pendingMember.current;
      pendingMember.current = null;
      const restored = restoreId ? data.find((c) => c.id === restoreId) : undefined;
      if (restored) {
        openDetail(restored);
      } else if (selected) {
        // Keep the open detail in sync after an edit / archive / restore.
        const fresh = data.find((c) => c.id === selected.id);
        if (fresh) setSelected(fresh);
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes('401')) {
        clearAdminToken();
        navigate('/admin?expired=1');
        return;
      }
      setError(err instanceof Error ? err.message : 'Tải dữ liệu thất bại.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    clearAdminToken();
    navigate('/admin');
  };

  const handleSelect = (customer: CustomerSummary) => {
    setDetailOrigin('clients');
    openDetail(customer);
  };

  // Hôm nay row → member detail on the Hội viên tab (FR-2).
  const handleOpenMemberFromToday = (customerId: string) => {
    setDetailOrigin('today');
    setActiveTab('clients');
    const found = customers.find((c) => c.id === customerId);
    if (found) {
      clientsStack.reset('root');
      openDetail(found);
    } else {
      // Not in the list yet (still loading / new member) — open after a reload.
      clientsStack.reset('root');
      pendingMember.current = customerId;
      void load(true);
    }
  };

  const handleDetailBack = () => {
    if (detailOrigin === 'today') {
      setDetailOrigin('clients');
      clientsStack.reset('root');
      setActiveTab('today');
    } else {
      clientsStack.pop();
    }
  };

  const handleNotificationNavigate = (view: string) => {
    if (view === 'clients') {
      setActiveTab('clients');
      clientsStack.reset('root');
    } else if (view === 'bookings') {
      setActiveTab('bookings');
    } else if (view === 'today') {
      setActiveTab('today');
    }
  };

  const showAgenda = useCallback(() => setBookingsView('agenda'), []);
  const showGrid = useCallback(() => setBookingsView('grid'), []);

  const headerActions = (
    <AdminHeaderActions
      onNavigate={handleNotificationNavigate}
      onLogout={handleLogout}
      onRefresh={activeTab === 'clients' ? () => load(true) : undefined}
      refreshing={refreshing}
    />
  );

  let clientsContent: React.ReactNode;
  if (clientsStack.current === 'detail' && selected) {
    clientsContent = (
      <CustomerDetailScreen customer={selected} onBack={handleDetailBack} onChanged={() => load(true)} />
    );
  } else {
    clientsContent = (
      <CustomerListScreen
        customers={customers}
        loading={loading}
        error={error}
        search={search}
        onSearchChange={setSearch}
        onSelect={handleSelect}
        onRefresh={() => load(true)}
        headerActions={headerActions}
        onCreateMember={() => setCreatingMember(true)}
      />
    );
  }

  let bookingsContent: React.ReactNode;
  if (bookingsView === 'agenda') {
    bookingsContent = (
      <AdminDayAgenda
        day={agendaDay}
        today={today}
        onDayChange={setAgendaDay}
        onShowGrid={showGrid}
        headerActions={headerActions}
      />
    );
  } else {
    bookingsContent = (
      <AdminBookings
        headerActions={
          <div className="flex items-center gap-1">
            <button
              type="button"
              data-testid="bookings-show-agenda"
              onClick={showAgenda}
              aria-label="Xem theo ngày"
              className="tap-target inline-flex items-center gap-1.5 px-3 rounded-full border border-white/10 text-sm text-white/80 bg-white/5 active:bg-white/10 transition-colors"
            >
              <CalendarRange className="w-4 h-4" aria-hidden="true" /> Theo ngày
            </button>
            {headerActions}
          </div>
        }
      />
    );
  }

  return (
    <div className="ops-surface app-shell-root flex flex-col overflow-hidden bg-[#080808] text-white">
      {/* Keyed on tab + stack position so the entrance replays on every
          navigation (the screens already remount, the wrapper would not). */}
      <div
        key={`${activeTab}:${clientsStack.current}:${bookingsView}`}
        className="flex-1 min-h-0 flex flex-col animate-panel-in"
      >
        {activeTab === 'today' ? (
          <AdminTodayScreen onOpenMember={handleOpenMemberFromToday} headerActions={headerActions} />
        ) : activeTab === 'clients' ? (
          clientsContent
        ) : activeTab === 'cms' ? (
          <>
            <StackHeader title="Nội dung trang chủ" right={headerActions} />
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain px-3">
              <CmsEditor />
            </div>
          </>
        ) : (
          bookingsContent
        )}
      </div>
      <AdminBottomTabBar
        active={activeTab}
        onChange={(tab) => {
          setActiveTab(tab);
          setDetailOrigin('clients');
          if (tab !== 'clients') clientsStack.reset('root');
        }}
      />

      {/* Create member modal */}
      {creatingMember && (
        <MemberFormModal
          mode="create"
          onClose={() => setCreatingMember(false)}
          onSaved={() => { setCreatingMember(false); load(true); }}
        />
      )}
    </div>
  );
}
