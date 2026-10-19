import { useMemo } from 'react';
import { useArrangements } from './useArrangements';
import { useDriverBoard } from './useDriverTasks';
import { useDriverDirectory, useFleet } from './useFleet';
import { useLeaveRequests } from './useHr';
import { useProfiles } from './useProfiles';
import { buildAlerts, type OpsContext } from '../lib/opsLogic';

/** Everything the operations screens need in one place: cases, fleet, drivers, leave, live driver tasks and alerts. */
export function useOps(options?: { enabled?: boolean }) {
  const arrangements = useArrangements(options);
  const fleet = useFleet();
  const profiles = useProfiles();
  const directory = useDriverDirectory();
  const leave = useLeaveRequests();
  const board = useDriverBoard();

  const driverProfiles = useMemo(
    () => (profiles.data ?? []).filter((p) => p.appRole === 'driver').map((p) => ({ id: p.id, name: p.name })),
    [profiles.data],
  );
  const driverNames = useMemo(
    () => [...new Set([...driverProfiles.map((d) => d.name), ...(directory.data ?? [])])].sort(),
    [driverProfiles, directory.data],
  );
  const ctx: OpsContext = useMemo(
    () => ({ cases: arrangements.data ?? [], fleet: fleet.data ?? [], drivers: driverProfiles, leave: leave.data ?? [] }),
    [arrangements.data, fleet.data, driverProfiles, leave.data],
  );
  const alerts = useMemo(() => buildAlerts(ctx, board.data), [ctx, board.data]);

  return {
    ctx,
    board: board.data,
    driverNames,
    profiles: profiles.data ?? [],
    alerts,
    loading: arrangements.isLoading,
    error: arrangements.isError,
  };
}
