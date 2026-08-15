/**
 * Desktop admin/trainer dashboard (U5 Trainer Desktop).
 * Master-detail shell with BOTH panes always visible (DL-1) — device
 * selection already happened at the route entry, so no isMobile branching.
 * Composes the extracted desktop components + reuses AdminBookings as-is (DL-3).
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Users } from 'lucide-react';
import { fetchCustomers, type CustomerSummary } from '../../../lib/api/admin';
import { clearAdminToken } from '../../../lib/adminAuth';
import { AdminBookings } from '../../components/AdminBookings';
import { DesktopAdminHeader } from '../components/DesktopAdminHeader';
import { CustomerSidebar } from '../components/CustomerSidebar';
import { CustomerDetail } from '../components/CustomerDetail';
import { AdminTodayScreen } from '../components/AdminTodayScreen';
import { MemberFormModal } from '../../components/MemberFormModal';

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<'today' | 'clients' | 'bookings'>('today');
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
      setSelected((prev) =>
        prev ? (data.find((c) => c.id === prev.id) ?? data[0] ?? null) : (data[0] ?? null),
      );
    } catch (err) {
      if (err instanceof Error && err.message.includes('401')) {
        clearAdminToken();
        navigate('/admin');
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

  return (
    <div className="h-screen bg-[#080808] text-white flex flex-col overflow-hidden">
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
        <div key={view} className="flex-1 min-h-0 animate-panel-in">
          <AdminTodayScreen />
        </div>
      ) : view === 'bookings' ? (
        <div key={view} className="flex-1 min-h-0 animate-panel-in">
          <AdminBookings />
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
              <div className="h-full flex flex-col items-center justify-center text-white/20 gap-3">
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
