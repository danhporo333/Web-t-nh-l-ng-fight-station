import { fail, ok, type ActionResult } from "@/lib/result";
import {
  findActiveStaff,
  findEntriesByDate,
  findHolidayByDate,
  findHolidaysInMonth,
  findOffEntriesInMonth,
  findShifts,
  findStaffByIds,
  findUserEntriesInMonth,
  replaceDayEntries,
  replaceHolidayDay,
  sumHoursByUserAndShift,
  sumHoursByUserAndShiftOnDates,
  type HolidayInput,
  type NewEntry,
} from "./queries";
import type { DayEntryInput, DayEntryRow, DayRecord, DayView, MonthHours, OffDays, ShiftEntry } from "./types";

export async function getDayEntries(date: string): Promise<DayView> {
  const [staff, entries, shifts, holiday] = await Promise.all([
    findActiveStaff(),
    findEntriesByDate(date),
    findShifts(),
    findHolidayByDate(date),
  ]);
  const hoursOf = (code: "MORNING" | "AFTERNOON") =>
    Number(shifts.find((s) => s.code === code)?.defaultHours ?? 0);

  const rows: DayEntryRow[] = staff.map((s) => {
    const mine = entries.filter((e) => e.userId === s.id);
    const pick = (code: "MORNING" | "AFTERNOON"): ShiftEntry | null => {
      const e = mine.find((x) => !x.isOff && x.shift?.code === code);
      return e ? { hours: Number(e.hours), note: e.note } : null;
    };
    return {
      userId: s.id,
      fullName: s.fullName,
      username: s.username,
      off: mine.some((e) => e.isOff),
      morning: pick("MORNING"),
      afternoon: pick("AFTERNOON"),
    };
  });

  return {
    date,
    defaultHours: { morning: hoursOf("MORNING"), afternoon: hoursOf("AFTERNOON") },
    holiday: holiday?.note ?? null,
    rows,
  };
}

// holiday: { note } nếu ngày này là ngày lễ (lương ca nhân đôi), null nếu không, undefined thì giữ nguyên ngày lễ cũ.
export async function saveDayEntriesFor(
  date: string,
  entries: DayEntryInput[],
  holiday?: HolidayInput,
): Promise<ActionResult<{ saved: number }>> {
  const ids = entries.map((e) => e.userId);
  if (new Set(ids).size !== ids.length) {
    return fail("COMMON_001", "Một nhân viên xuất hiện nhiều lần");
  }
  if (entries.some((e) => e.off && (e.morning || e.afternoon))) {
    return fail("ATT_002", "Ngày đã Off nhưng có ca, hoặc có ca nhưng đánh dấu Off");
  }

  const [users, shifts] = await Promise.all([findStaffByIds(ids), findShifts()]);
  const byId = new Map(users.map((u) => [u.id, u]));
  for (const id of ids) {
    const user = byId.get(id);
    if (!user || user.role !== "STAFF") return fail("STAFF_002", "Không tìm thấy nhân viên");
    if (!user.isActive) return fail("ATT_003", "Nhân viên đã nghỉ việc, không chấm công được");
  }

  const morningId = shifts.find((s) => s.code === "MORNING")?.id;
  const afternoonId = shifts.find((s) => s.code === "AFTERNOON")?.id;
  if (morningId === undefined || afternoonId === undefined) {
    return fail("COMMON_003", "Thiếu cấu hình ca, hãy chạy seed");
  }

  const rows = entries.flatMap((e): NewEntry[] => {
    if (e.off) return [{ userId: e.userId, shiftId: null, hours: 0, isOff: true, note: null }];
    const list: NewEntry[] = [];
    if (e.morning) {
      list.push({ userId: e.userId, shiftId: morningId, hours: e.morning.hours, isOff: false, note: e.morning.note ?? null });
    }
    if (e.afternoon) {
      list.push({ userId: e.userId, shiftId: afternoonId, hours: e.afternoon.hours, isOff: false, note: e.afternoon.note ?? null });
    }
    return list;
  });

  await replaceDayEntries(date, ids, rows);
  if (holiday !== undefined) await replaceHolidayDay(date, holiday);
  return ok({ saved: entries.length });
}

// Tổng giờ sáng, chiều của từng nhân viên trong tháng. Ca chiều tính theo ngày bắt đầu ca.
// Giờ rơi vào ngày lễ được tách riêng (holiday...Hours) để payroll tính thêm một lần, thành ×2.
export async function getMonthHours(month: string, userId?: number): Promise<MonthHours[]> {
  const [sums, holidays, shifts] = await Promise.all([
    sumHoursByUserAndShift(month, userId),
    findHolidaysInMonth(month),
    findShifts(),
  ]);
  const holidaySums = await sumHoursByUserAndShiftOnDates(
    holidays.map((h) => h.workDate),
    userId,
  );
  const codeById = new Map(shifts.map((s) => [s.id, s.code]));
  const byUser = new Map<number, MonthHours>();
  const entryFor = (id: number): MonthHours => {
    const existing = byUser.get(id);
    if (existing) return existing;
    const created: MonthHours = {
      userId: id,
      morningHours: 0,
      afternoonHours: 0,
      morningHolidayHours: 0,
      afternoonHolidayHours: 0,
    };
    byUser.set(id, created);
    return created;
  };

  for (const sum of sums) {
    const code = sum.shiftId === null ? undefined : codeById.get(sum.shiftId);
    if (!code) continue;
    const entry = entryFor(sum.userId);
    const hours = Number(sum._sum.hours ?? 0);
    if (code === "MORNING") entry.morningHours += hours;
    else entry.afternoonHours += hours;
  }
  for (const sum of holidaySums) {
    const code = sum.shiftId === null ? undefined : codeById.get(sum.shiftId);
    if (!code) continue;
    const entry = entryFor(sum.userId);
    const hours = Number(sum._sum.hours ?? 0);
    if (code === "MORNING") entry.morningHolidayHours += hours;
    else entry.afternoonHolidayHours += hours;
  }
  return [...byUser.values()];
}

export async function getUserMonthDays(userId: number, month: string): Promise<DayRecord[]> {
  const [rows, holidays] = await Promise.all([
    findUserEntriesInMonth(userId, month),
    findHolidaysInMonth(month),
  ]);
  const holidayNote = new Map(holidays.map((h) => [h.workDate.toISOString().slice(0, 10), h.note]));
  return rows.map((r) => {
    const date = r.workDate.toISOString().slice(0, 10);
    return {
      date,
      off: r.isOff,
      shift: r.shift?.code ?? null,
      hours: Number(r.hours),
      note: r.note,
      holiday: holidayNote.get(date) ?? null,
    };
  });
}

// Các ngày Off của từng nhân viên trong tháng (chỉ người có ngày Off). Mỗi ngày tối đa một dòng Off.
export async function getMonthOffDays(month: string): Promise<OffDays[]> {
  const rows = await findOffEntriesInMonth(month);
  const byUser = new Map<number, string[]>();
  for (const r of rows) {
    const date = r.workDate.toISOString().slice(0, 10);
    const dates = byUser.get(r.userId) ?? [];
    if (!dates.includes(date)) dates.push(date);
    byUser.set(r.userId, dates);
  }
  return [...byUser.entries()].map(([userId, dates]) => ({ userId, dates }));
}
