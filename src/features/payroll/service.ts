import { getAdjustmentTotals, listAdjustments } from "@/features/adjustments";
import { getMonthHours, getUserMonthDays } from "@/features/attendance";
import { getRatesForMonth } from "@/features/rates";
import { findStaffById, findStaffForPayroll } from "./queries";
import type {
  DayDetail,
  MonthlyPayroll,
  PayrollRow,
  PayrollTotals,
  StaffMonthDetail,
} from "./types";
import { calculatePay, calculateShiftPay } from "./utils";

type Staff = { id: number; username: string; fullName: string; isActive: boolean };
type Hours = {
  morningHours: number;
  afternoonHours: number;
  morningHolidayHours: number;
  afternoonHolidayHours: number;
};
type Rates = { morningRate: number; afternoonRate: number } | undefined;
type Totals = { bonus: number; penalty: number; meal: number } | undefined;

function buildRow(staff: Staff, hours: Hours | undefined, rates: Rates, totals: Totals): PayrollRow {
  const morningHours = hours?.morningHours ?? 0;
  const afternoonHours = hours?.afternoonHours ?? 0;
  const bonus = totals?.bonus ?? 0;
  const penalty = totals?.penalty ?? 0;
  const meal = totals?.meal ?? 0;

  // Chỉ coi là thiếu mức khi thật sự có giờ làm. Không có giờ thì lương ca là 0đ dù chưa có mức.
  const missingRate = (morningHours > 0 || afternoonHours > 0) && !rates;

  const base = {
    userId: staff.id,
    fullName: staff.fullName,
    username: staff.username,
    isActive: staff.isActive,
    morningHours,
    afternoonHours,
    morningRate: rates?.morningRate ?? null,
    afternoonRate: rates?.afternoonRate ?? null,
    bonus,
    penalty,
    meal,
    missingRate,
  };
  if (missingRate) return { ...base, shiftPay: null, netPay: null };

  const { shiftPay, netPay } = calculatePay({
    morningHours,
    afternoonHours,
    morningHolidayHours: hours?.morningHolidayHours ?? 0,
    afternoonHolidayHours: hours?.afternoonHolidayHours ?? 0,
    morningRate: rates?.morningRate ?? 0,
    afternoonRate: rates?.afternoonRate ?? 0,
    bonus,
    penalty,
    meal,
  });
  return { ...base, shiftPay, netPay };
}

function sumTotals(rows: PayrollRow[]): PayrollTotals {
  const totals: PayrollTotals = { morningHours: 0, afternoonHours: 0, shiftPay: 0, bonus: 0, penalty: 0, meal: 0, netPay: 0 };
  for (const r of rows) {
    totals.morningHours += r.morningHours;
    totals.afternoonHours += r.afternoonHours;
    totals.bonus += r.bonus;
    totals.penalty += r.penalty;
    totals.meal += r.meal;
    totals.shiftPay += r.shiftPay ?? 0;
    totals.netPay += r.netPay ?? 0;
  }
  return totals;
}

export async function getMonthlyPayroll(month: string): Promise<MonthlyPayroll> {
  const [hours, rates, totals] = await Promise.all([
    getMonthHours(month),
    getRatesForMonth(month),
    getAdjustmentTotals(month),
  ]);

  const activeIds = [...hours.map((h) => h.userId), ...totals.map((t) => t.userId)];
  const staff = await findStaffForPayroll(activeIds);

  const hoursById = new Map(hours.map((h) => [h.userId, h]));
  const ratesById = new Map(rates.map((r) => [r.userId, r]));
  const totalsById = new Map(totals.map((t) => [t.userId, t]));

  const rows = staff.map((s) => buildRow(s, hoursById.get(s.id), ratesById.get(s.id), totalsById.get(s.id)));
  return {
    month,
    rows,
    totals: sumTotals(rows),
    missingRateCount: rows.filter((r) => r.missingRate).length,
  };
}

// Không kiểm quyền ở đây: trang của chủ quán gọi requireOwner, feature `me` truyền userId lấy từ phiên.
export async function getStaffMonthDetail(userId: number, month: string): Promise<StaffMonthDetail | null> {
  const staff = await findStaffById(userId);
  if (!staff) return null;

  const [hours, rates, totals, records, adjustments] = await Promise.all([
    getMonthHours(month, userId),
    getRatesForMonth(month, userId),
    getAdjustmentTotals(month, userId),
    getUserMonthDays(userId, month),
    listAdjustments(month, userId),
  ]);

  const rate = rates[0];
  const summary = buildRow(staff, hours[0], rate, totals[0]);

  const byDate = new Map<string, DayDetail>();
  for (const rec of records) {
    const day = byDate.get(rec.date) ?? { date: rec.date, off: false, holiday: rec.holiday, entries: [], pay: 0 };
    if (rec.off) {
      day.off = true;
    } else if (rec.shift) {
      const shiftRate = rec.shift === "MORNING" ? rate?.morningRate : rate?.afternoonRate;
      const pay = shiftRate === undefined ? null : calculateShiftPay(rec.hours, shiftRate, rec.holiday !== null);
      day.entries.push({ shift: rec.shift, hours: rec.hours, pay, note: rec.note });
      day.pay = day.pay === null || pay === null ? null : day.pay + pay;
    }
    byDate.set(rec.date, day);
  }

  return { summary, days: [...byDate.values()], adjustments };
}
