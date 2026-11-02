/**
 * Desktop admin/trainer dashboard (U5 Trainer Desktop).
 * Master-detail shell with BOTH panes always visible (DL-1) — device
 * selection already happened at the route entry, so no isMobile branching.
 * Composes the extracted desktop components + reuses AdminBookings as-is (DL-3).
 */
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { Users } from 'lucide-react';
import {
  readParam,
  useInitialSearchParams,
  useSyncSearchParams,
} from '../../shared/hooks/useDashboardUrlState';
import { fetchCustomers, type CustomerSummary } from '../../../lib/api/admin';
import { clearAdminToken } from '../../../lib/adminAuth';
import { AdminBookings } from '../../components/AdminBookings';
import { DesktopAdminHeader } from '../components/DesktopAdminHeader';
import { CustomerSidebar } from '../components/CustomerSidebar';
import { CustomerDetail } from '../components/CustomerDetail';
import { AdminTodayScreen } from '../components/AdminTodayScreen';
import { MemberFormModal } from '../../components/MemberFormModal';
import { CmsEditor } from '../../shared/components/CmsEditor';

type AdminView = 'today' | 'clients' | 'bookings' | 'cms';
const VIEWS: readonly AdminView[] = ['today', 'clients', 'bookings', 'cms'];

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const initialParams = useInitialSearchParams();
  const [view, setView] = useState<AdminView>(() => readParam(initialParams, 'tab', VIEWS, 'today'));
  // Member to reselect after the first load (from `?member=` on refresh).
  const pendingMember = useRef<string | null>(initialParams.get('member'));
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<CustomerSummary | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [creatingMember, setCreatingMember] = useState(false);

  const load = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const data = await fetchCustomers();
      setCustomers(data);
      const restoreId = pendingMember.current;
      pendingMember.current = null;
      setSelected((prev) => {
        const wantedId = prev?.id ?? restoreId;
        return (wantedId ? data.find((c) => c.id === wantedId) : undefined) ?? data[0] ?? null;
      });
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

  // Mirror the open view (and member) into the URL so a refresh lands back on it.
  useSyncSearchParams({
    tab: view === 'today' ? null : view,
    member: view === 'clients' ? (selected?.id ?? pendingMember.current) : null,
  });

  // Hôm nay → member: switch to the clients view and select them (URL keys
  // `tab`/`member` follow via useSyncSearchParams, so it survives refresh).
  const openMember = (customerId: string) => {
    const found = customers.find((c) => c.id === customerId);
    if (found) setSelected(found);
    else pendingMember.current = customerId;
    setView('clients');
  };

  const handleLogout = () => {
    clearAdminToken();
    navigate('/admin');
  };

  return (
    <div className="ops-surface h-screen bg-[#0B0B0B] text-white flex flex-col overflow-hidden">
      <DesktopAdminHeader
        view={view}
        onViewChange={setView}
        customerCount={customers.length}
        onRefresh={() => load(true)}
        refreshing={refreshing}
        onLogout={handleLogout}
      />

      {/* `key={view}` remounts the wrapper so the entrance animation replays on
          every view switch (React would otherwise reuse the same div). */}
      {view === 'today' ? (
        <div key={view} className="flex-1 min-h-0 flex flex-col animate-panel-in">
          <AdminTodayScreen onOpenMember={openMember} />
        </div>
      ) : view === 'bookings' ? (
        <div key={view} className="flex-1 min-h-0 animate-panel-in">
          <AdminBookings />
        </div>
      ) : view === 'cms' ? (
        <div key={view} className="flex-1 min-h-0 overflow-y-auto animate-panel-in">
          <CmsEditor />
        </div>
      ) : (
        <div key={view} className="flex-1 flex min-h-0 animate-panel-in">
          <CustomerSidebar
            customers={customers}
            selectedId={selected?.id ?? null}
            search={search}
            onSearchChange={setSearch}
            onSelect={setSelected}
            loading={loading}
            error={error}
            onCreateMember={() => setCreatingMember(true)}
          />

          <main className="flex-1 min-w-0 overflow-hidden">
            {!selected ? (
              <div className="h-full flex flex-col items-center justify-center text-white/60 gap-3">
                <Users className="w-12 h-12" />
                <p className="text-sm">Chọn một hội viên để xem thông tin</p>
              </div>
            ) : (
              <CustomerDetail key={selected.id} customer={selected} onRefresh={() => load(true)} />
            )}
          </main>
        </div>
      )}

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
