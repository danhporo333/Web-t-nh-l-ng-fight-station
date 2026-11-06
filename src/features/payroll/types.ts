import type { AdjustmentItem } from "@/features/adjustments";

export type PayrollRow = {
  userId: number;
  fullName: string;
  username: string;
  isActive: boolean;
  morningHours: number;
  afternoonHours: number;
  morningRate: number | null;
  afternoonRate: number | null;
  bonus: number;
  penalty: number;
  // null khi có giờ làm nhưng chưa có mức lương của tháng (RATE_002)
  shiftPay: number | null;
  netPay: number | null;
  missingRate: boolean;
};

export type PayrollTotals = {
  morningHours: number;
  afternoonHours: number;
  shiftPay: number;
  bonus: number;
  penalty: number;
  netPay: number;
};

export type MonthlyPayroll = {
  month: string;
  rows: PayrollRow[];
  totals: PayrollTotals;
  missingRateCount: number;
};

export type DayShiftDetail = {
  shift: "MORNING" | "AFTERNOON";
  hours: number;
  pay: number | null;
  note: string | null;
};

export type DayDetail = {
  date: string;
  off: boolean;
  entries: DayShiftDetail[];
  pay: number | null;
};

export type StaffMonthDetail = {
  summary: PayrollRow;
  days: DayDetail[];
  adjustments: AdjustmentItem[];
};
