import { useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import { canOpen, homePath } from '../../auth/access';
import { useAppSettings } from '../../data/useSettings';
import { useLeadAlerts } from '../../data/useLeadAlerts';
import type { CrmSidebarItem } from '../../types';
import { useAppDispatch } from '../../state/useAppState';
import { useRealtimeInvalidate } from '../../data/useRealtimeInvalidate';
import { CrmSidebar } from './CrmSidebar';
import { CrmTopbar } from './CrmTopbar';
import { DashboardScreen } from './screens/DashboardScreen';
import { ArrangementsScreen } from './screens/ArrangementsScreen';
import { QuotationsScreen } from './screens/QuotationsScreen';
import { OperationsScreen } from './screens/OperationsScreen';
import { VehiclesScreen } from './screens/VehiclesScreen';
import { TeamScreen } from './screens/TeamScreen';
import { PaymentsScreen } from './screens/PaymentsScreen';
import { CommunicationsScreen } from './screens/CommunicationsScreen';
import { FeedbackScreen } from './screens/FeedbackScreen';
import { LeadsScreen } from './screens/LeadsScreen';
import { StarsScreen } from './screens/StarsScreen';
import { TributesScreen } from './screens/TributesScreen';
import { DriverAppScreen } from './screens/DriverAppScreen';
import { ConfiguratorScreen } from './screens/ConfiguratorScreen';
import { ReportsScreen } from './screens/ReportsScreen';
import { BookingsScreen } from './screens/BookingsScreen';
import { RecordsScreen } from './screens/RecordsScreen';
import { HrScreen } from './screens/HrScreen';
import { CustomersScreen } from './screens/CustomersScreen';
import { ServicePlansScreen } from './screens/ServicePlansScreen';
import { DocumentsScreen } from './screens/DocumentsScreen';
import { SettingsScreen } from './screens/SettingsScreen';

const VALID_ITEMS: CrmSidebarItem[] = [
  'dashboard',
  'arrangements',
  'leads',
  'stars',
  'tributes',
  'customers',
  'service-plans',
  'quotations',
  'bookings',
  'operations',
  'driver-app',
  'configurator',
  'vehicles',
  'team',
  'hr',
  'documents',
  'records',
  'payments',
  'communications',
  'feedback',
  'reports',
  'settings',
];

export function CrmPortal() {
  const { sidebarItem } = useParams();
  const dispatch = useAppDispatch();
  const { profile } = useAuth();
  const { settings } = useAppSettings();
  useRealtimeInvalidate();
  useLeadAlerts();

  const item: CrmSidebarItem = VALID_ITEMS.includes(sidebarItem as CrmSidebarItem)
    ? (sidebarItem as CrmSidebarItem)
    : 'dashboard';

  useEffect(() => {
    dispatch({ type: 'SET_CRM_SIDEBAR_ITEM', item });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

  const activeItem = item;
  if (profile && !canOpen(profile.app_role, item, settings.role_access)) return <Navigate to={homePath(profile.app_role, settings.role_access)} replace />;

  return (
    <main className="portal-view active" id="side-crm">
      <div className="crm-shell">
        <CrmSidebar activeItem={activeItem} />

        <section className="crm-content-area">
          <CrmTopbar />

          {activeItem === 'dashboard' && <DashboardScreen />}
          {activeItem === 'arrangements' && <ArrangementsScreen />}
          {activeItem === 'quotations' && <QuotationsScreen />}
          {activeItem === 'operations' && <OperationsScreen />}
          {activeItem === 'vehicles' && <VehiclesScreen />}
          {activeItem === 'team' && <TeamScreen />}
          {activeItem === 'hr' && <HrScreen />}
          {activeItem === 'payments' && <PaymentsScreen />}
          {activeItem === 'communications' && <CommunicationsScreen />}
          {activeItem === 'feedback' && <FeedbackScreen />}
          {activeItem === 'leads' && <LeadsScreen />}
          {activeItem === 'stars' && <StarsScreen />}
          {activeItem === 'tributes' && <TributesScreen />}
          {activeItem === 'driver-app' && <DriverAppScreen />}
          {activeItem === 'configurator' && <ConfiguratorScreen />}
          {activeItem === 'reports' && <ReportsScreen />}
          {activeItem === 'bookings' && <BookingsScreen />}
          {activeItem === 'customers' && <CustomersScreen />}
          {activeItem === 'service-plans' && <ServicePlansScreen />}
          {activeItem === 'documents' && <DocumentsScreen />}
          {activeItem === 'records' && <RecordsScreen />}
          {activeItem === 'settings' && <SettingsScreen />}
        </section>
      </div>
    </main>
  );
}
