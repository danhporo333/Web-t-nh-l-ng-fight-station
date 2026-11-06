import { fail, ok, type ActionResult } from "@/lib/result";
import {
  findActiveStaff,
  findEntriesByDate,
  findShifts,
  findStaffByIds,
  replaceDayEntries,
  type NewEntry,
} from "./queries";
import type { DayEntryInput, DayEntryRow, DayView, ShiftEntry } from "./types";

export async function getDayEntries(date: string): Promise<DayView> {
  const [staff, entries, shifts] = await Promise.all([
    findActiveStaff(),
    findEntriesByDate(date),
    findShifts(),
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
    rows,
  };
}

export async function saveDayEntriesFor(
  date: string,
  entries: DayEntryInput[],
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
  return ok({ saved: entries.length });
}
