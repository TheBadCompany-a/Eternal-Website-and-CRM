import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import type { HrSalaryPaymentRow, HrSalaryRow, HrAttendanceRow, HrAttendanceStatusRow, HrLeaveRequestRow, HrLeaveStatusRow, HrLeaveTypeRow } from './database.types';
import { queryKeys } from './queryKeys';

export function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Attendance for the last 30 days (RLS limits non-HR staff to their own rows). */
export function useAttendance() {
  return useQuery({
    queryKey: queryKeys.hrAttendance,
    queryFn: async (): Promise<HrAttendanceRow[]> => {
      const since = new Date(Date.now() - 30 * 86_400_000).toISOString().slice(0, 10);
      const { data, error } = await supabase.from('hr_attendance').select('*').gte('work_date', since).order('work_date', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useLeaveRequests(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.hrLeave,
    enabled: options?.enabled ?? true,
    queryFn: async (): Promise<HrLeaveRequestRow[]> => {
      const { data, error } = await supabase.from('hr_leave_requests').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

/** Upserts one person's row for a day (one row per person per day). */
export function useMarkAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ profileId, status, checkIn, checkOut, workDate = todayIso() }: {
      profileId: string; status: HrAttendanceStatusRow; checkIn?: string | null; checkOut?: string | null; workDate?: string;
    }) => {
      const row: { profile_id: string; work_date: string; status: HrAttendanceStatusRow; check_in?: string | null; check_out?: string | null } =
        { profile_id: profileId, work_date: workDate, status };
      if (checkIn !== undefined) row.check_in = checkIn;
      if (checkOut !== undefined) row.check_out = checkOut;
      const { error } = await supabase.from('hr_attendance').upsert(row, { onConflict: 'profile_id,work_date' });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.hrAttendance }),
  });
}

export function useRequestLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { profileId: string; leaveType: HrLeaveTypeRow; startDate: string; endDate: string; reason: string }) => {
      const { error } = await supabase.from('hr_leave_requests').insert({
        profile_id: input.profileId, leave_type: input.leaveType, start_date: input.startDate, end_date: input.endDate, reason: input.reason,
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.hrLeave }),
  });
}

export function useDecideLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, deciderId }: { id: string; status: Exclude<HrLeaveStatusRow, 'Pending'>; deciderId: string }) => {
      const { error } = await supabase.from('hr_leave_requests')
        .update({ status, decided_by: deciderId, decided_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.hrLeave }),
  });
}

export function useSalaries() {
  return useQuery({
    queryKey: queryKeys.hrSalary,
    queryFn: async (): Promise<HrSalaryRow[]> => {
      const { data, error } = await supabase.from('hr_salary').select('*');
      if (error) throw error;
      return data;
    },
  });
}

/** Sets one person's monthly salary and/or yearly paid-leave allowance. */
export function useSaveSalary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { profileId: string; monthlySalary?: number; paidLeaveQuota?: number }) => {
      const row: { profile_id: string; monthly_salary?: number; paid_leave_quota?: number; updated_at: string } =
        { profile_id: input.profileId, updated_at: new Date().toISOString() };
      if (input.monthlySalary !== undefined) row.monthly_salary = input.monthlySalary;
      if (input.paidLeaveQuota !== undefined) row.paid_leave_quota = input.paidLeaveQuota;
      const { error } = await supabase.from('hr_salary').upsert(row, { onConflict: 'profile_id' });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.hrSalary }),
  });
}

export function useSalaryPayments() {
  return useQuery({
    queryKey: queryKeys.hrPayments,
    queryFn: async (): Promise<HrSalaryPaymentRow[]> => {
      const { data, error } = await supabase.from('hr_salary_payments').select('*').order('pay_month', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

/** Marks a month's salary Paid (or back to Pending) for one person. */
export function useSetSalaryPaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ profileId, month, amount, paid }: { profileId: string; month: string; amount: number; paid: boolean }) => {
      const { error } = await supabase.from('hr_salary_payments').upsert(
        { profile_id: profileId, pay_month: month, amount, status: paid ? 'Paid' : 'Pending', paid_on: paid ? todayIso() : null },
        { onConflict: 'profile_id,pay_month' },
      );
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.hrPayments }),
  });
}
