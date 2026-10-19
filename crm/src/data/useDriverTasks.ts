import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import type { DriverExpenseRow, DriverStatusRow, DriverTaskRow, DriverTaskUpdateRow } from './database.types';

export const DRIVER_STEPS: DriverStatusRow[] = ['Assigned', 'Accepted', 'En route to pickup', 'Arrived', 'Picked up', 'Completed'];

/** Labels shown to people; 'Accepted' is the driver checking in for the job. */
export const DRIVER_STATUS_LABEL: Record<DriverStatusRow, string> = {
  Assigned: 'Assigned',
  Accepted: 'Checked in',
  'En route to pickup': 'En route to pickup',
  Arrived: 'Arrived',
  'Picked up': 'Picked up',
  Completed: 'Completed',
};

const DRIVER_KEY = ['driver', 'board'] as const;
/** Realtime invalidates instantly when enabled; polling is the safety net. */
const FALLBACK_REFRESH_MS = 5000;

export type DriverTaskView = {
  task: DriverTaskRow;
  expenses: DriverExpenseRow[];
  expenseTotal: number;
  latestNote: DriverTaskUpdateRow | null;
  lastFix: { latitude: number; longitude: number; at: string } | null;
};

/** Everything the driver app and the office tracking board need, keyed by arrangement id. */
export function useDriverBoard() {
  return useQuery({
    queryKey: DRIVER_KEY,
    refetchInterval: FALLBACK_REFRESH_MS,
    staleTime: 0,
    queryFn: async () => {
      const [tasks, expenses, updates] = await Promise.all([
        supabase.from('driver_tasks').select('*').order('updated_at', { ascending: false }),
        supabase.from('driver_expenses').select('*').order('submitted_at', { ascending: false }),
        supabase.from('driver_task_updates').select('*').order('created_at', { ascending: false }).limit(300),
      ]);
      if (tasks.error) throw tasks.error;
      if (expenses.error) throw expenses.error;
      if (updates.error) throw updates.error;

      const board = new Map<string, DriverTaskView>();
      tasks.data.forEach((task) => {
        const mine = expenses.data.filter((expense) => expense.task_id === task.id).map((expense) => ({ ...expense, amount: Number(expense.amount) }));
        const history = updates.data.filter((update) => update.task_id === task.id);
        const fix = history.find((update) => update.latitude !== null && update.longitude !== null);
        board.set(task.arrangement_id, {
          task,
          expenses: mine,
          expenseTotal: mine.reduce((sum, expense) => sum + expense.amount, 0),
          latestNote: history.find((update) => update.note) ?? null,
          lastFix: fix ? { latitude: Number(fix.latitude), longitude: Number(fix.longitude), at: fix.created_at } : null,
        });
      });
      return board;
    },
  });
}

type DriverAction = {
  arrangementId: string;
  driverId: string;
  /** Move the task to this status. */
  status?: DriverStatusRow;
  note?: string;
  confirmAttendance?: boolean;
  location?: { latitude: number; longitude: number } | 'unavailable';
};

/** Creates the task row on first touch, applies the change, and logs it for the office. */
export function useDriverAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ arrangementId, driverId, status, note, confirmAttendance, location }: DriverAction) => {
      const now = new Date().toISOString();
      const patch: Partial<Omit<DriverTaskRow, 'id' | 'created_at' | 'updated_at'>> &{ arrangement_id: string } = { arrangement_id: arrangementId, driver_id: driverId };
      if (status) {
        patch.status = status;
        if (status === 'Arrived') patch.arrival_at = now;
        if (status === 'Picked up') patch.pickup_confirmed_at = now;
        if (status === 'Completed') patch.completed_at = now;
      }
      if (confirmAttendance) patch.attendance_confirmed_at = now;
      if (location) patch.last_location_at = now;

      const { data: task, error } = await supabase.from('driver_tasks').upsert(patch, { onConflict: 'arrangement_id' }).select('*').single();
      if (error) throw error;

      const gps = location && location !== 'unavailable' ? location : null;
      const label = status ?? (confirmAttendance ? 'Attendance confirmed' : location ? 'Location update' : task.status);
      if (status || note || confirmAttendance || location) {
        const { error: logError } = await supabase.from('driver_task_updates').insert({
          task_id: task.id,
          status: label,
          note: note || (location === 'unavailable' ? 'Location unavailable on this device' : null),
          latitude: gps?.latitude ?? null,
          longitude: gps?.longitude ?? null,
        });
        if (logError) throw logError;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['driver'] }),
  });
}

export function useAddDriverExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ arrangementId, driverId, category, amount }: { arrangementId: string; driverId: string; category: string; amount: number }) => {
      const { data: task, error } = await supabase
        .from('driver_tasks')
        .upsert({ arrangement_id: arrangementId, driver_id: driverId }, { onConflict: 'arrangement_id' })
        .select('id')
        .single();
      if (error) throw error;
      const { error: expenseError } = await supabase.from('driver_expenses').insert({ task_id: task.id, category, amount });
      if (expenseError) throw expenseError;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['driver'] }),
  });
}
