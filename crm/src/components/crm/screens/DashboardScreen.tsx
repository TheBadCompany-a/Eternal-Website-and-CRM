import { useAppState } from '../../../state/useAppState';
import { useArrangements } from '../../../data/useArrangements';
import { useCallbacks } from '../../../data/useCallbacks';
import { useFleet } from '../../../data/useFleet';
import { useProfiles } from '../../../data/useProfiles';
import { useCommunications } from '../../../data/useCommunications';
import { KpiRow } from '../dashboard/KpiRow';
import { StatusOverviewCard } from '../dashboard/StatusOverviewCard';
import { TodaysScheduleTable } from '../dashboard/TodaysScheduleTable';
import { RecentArrangementsTable } from '../dashboard/RecentArrangementsTable';
import { CallbacksList } from '../dashboard/CallbacksList';
import { FleetStatsCard } from '../dashboard/FleetStatsCard';
import { TeamStatsCard } from '../dashboard/TeamStatsCard';
import { CommsFeedCard } from '../dashboard/CommsFeedCard';

export function DashboardScreen() {
  const state = useAppState();
  const filter = (state.searchFilter || '').toLowerCase();

  const arrangements = useArrangements();
  const callbacks = useCallbacks();
  const fleet = useFleet();
  const team = useProfiles();
  const communications = useCommunications();

  const loadError = [arrangements, callbacks, fleet, team, communications].find((q) => q.isError)?.error as
    | { message?: string }
    | undefined;

  return (
    <div className="crm-screen active">
      {loadError && (
        <p role="alert" style={{ background: '#fdecea', color: '#8a1c13', padding: '10px 14px', borderRadius: 8, marginBottom: 12 }}>
          Could not load CRM data from the database: {loadError.message ?? 'unknown error'}. Try signing out and in again.
        </p>
      )}
      <KpiRow arrangements={arrangements.data ?? []} />

      <div className="dashboard-grid-layout">
        <div>
          <StatusOverviewCard arrangements={arrangements.data ?? []} />
          <TodaysScheduleTable arrangements={arrangements.data ?? []} filter={filter} />
          <RecentArrangementsTable arrangements={arrangements.data ?? []} />
        </div>

        <div>
          <CallbacksList callbacks={callbacks.data ?? []} />
          <FleetStatsCard fleet={fleet.data ?? []} />
          <TeamStatsCard team={team.data ?? []} />
          <CommsFeedCard communications={communications.data ?? []} />
        </div>
      </div>
    </div>
  );
}
