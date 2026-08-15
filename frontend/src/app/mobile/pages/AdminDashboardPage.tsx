/**
 * Trainer mobile dashboard (U6 Trainer Mobile, TR-2/TR-4/TR-5/TR-6).
 * REPLACES the U5 temporary bridge (verbatim desktop-in-mobile-clothes copy)
 * with a real native-like mobile experience: bottom tabs (Hội viên / Lịch
 * đặt) + a stack for the customer list → detail flow (SHELL-1/SHELL-2).
 * Booking management reuses AdminBookings.tsx as-is (BOOK-ADMIN-1).
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { fetchCustomers, type CustomerSummary } from '../../../lib/api/admin';
import { clearAdminToken } from '../../../lib/adminAuth';
import { AdminBookings } from '../../components/AdminBookings';
import { AdminBottomTabBar, type AdminMobileTabKey } from '../shell/AdminBottomTabBar';
import { useStack } from '../shell/useStack';
import { CustomerListScreen } from '../screens/CustomerListScreen';
import { CustomerDetailScreen } from '../screens/CustomerDetailScreen';
import { AdminTodayScreen } from '../../desktop/components/AdminTodayScreen';
import { MemberFormModal } from '../../components/MemberFormModal';

type ClientsStackScreen = 'root' | 'detail';

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminMobileTabKey>('today');
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<CustomerSummary | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [creatingMember, setCreatingMember] = useState(false);

  const clientsStack = useStack<ClientsStackScreen>('root');

  const load = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const data = await fetchCustomers();
      setCustomers(data);
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

  const handleSelect = (customer: CustomerSummary) => {
    setSelected(customer);
    clientsStack.push('detail');
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

  let clientsContent: React.ReactNode;
  if (clientsStack.current === 'detail' && selected) {
    clientsContent = <CustomerDetailScreen customer={selected} onBack={clientsStack.pop} />;
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
        refreshing={refreshing}
        onLogout={handleLogout}
        onNavigateFromNotification={handleNotificationNavigate}
        onCreateMember={() => setCreatingMember(true)}
      />
    );
  }

  return (
    <div className="h-[100dvh] w-full flex flex-col overflow-hidden bg-[#080808] text-white">
      {/* Keyed on tab + stack position so the entrance replays on every
          navigation (the screens already remount, the wrapper would not). */}
      <div
        key={`${activeTab}:${clientsStack.current}`}
        className="flex-1 min-h-0 flex flex-col animate-panel-in"
      >
        {activeTab === 'today' ? (
          <AdminTodayScreen />
        ) : activeTab === 'clients' ? (
          clientsContent
        ) : (
          <AdminBookings />
        )}
      </div>
      <AdminBottomTabBar
        active={activeTab}
        onChange={(tab) => {
          setActiveTab(tab);
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
