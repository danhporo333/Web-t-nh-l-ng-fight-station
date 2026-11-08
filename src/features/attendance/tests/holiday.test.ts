import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../queries", () => ({
  findActiveStaff: vi.fn(),
  findStaffByIds: vi.fn(),
  findShifts: vi.fn(),
  findEntriesByDate: vi.fn(),
  findHolidayByDate: vi.fn(),
  findHolidaysInMonth: vi.fn(),
  findUserEntriesInMonth: vi.fn(),
  replaceDayEntries: vi.fn(),
  replaceHolidayDay: vi.fn(),
  sumHoursByUserAndShift: vi.fn(),
  sumHoursByUserAndShiftOnDates: vi.fn(),
}));

import * as queries from "../queries";
import { getMonthHours, getUserMonthDays, saveDayEntriesFor } from "../service";

const d = (v: number) => ({ toNumber: () => v, valueOf: () => v, toString: () => String(v) });

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(queries.findShifts).mockResolvedValue([
    { id: 1, code: "MORNING", defaultHours: 8.5 },
    { id: 2, code: "AFTERNOON", defaultHours: 10 },
  ] as never);
  vi.mocked(queries.findStaffByIds).mockImplementation(((ids: number[]) =>
    Promise.resolve(ids.map((id) => ({ id, role: "STAFF", isActive: true })))) as never);
  vi.mocked(queries.replaceDayEntries).mockResolvedValue([] as never);
  vi.mocked(queries.replaceHolidayDay).mockResolvedValue({} as never);
  vi.mocked(queries.findHolidaysInMonth).mockResolvedValue([]);
  vi.mocked(queries.sumHoursByUserAndShiftOnDates).mockResolvedValue([] as never);
});

describe("getMonthHours tách giờ ngày lễ", () => {
  it("giờ rơi vào ngày lễ được ghi riêng vào holiday...Hours, tổng giờ vẫn tính đủ", async () => {
    vi.mocked(queries.sumHoursByUserAndShift).mockResolvedValue([
      { userId: 3, shiftId: 1, _sum: { hours: d(17) } },
    ] as never);
    vi.mocked(queries.findHolidaysInMonth).mockResolvedValue([
      { workDate: new Date("2026-11-02T00:00:00.000Z"), note: "Giỗ" },
    ] as never);
    vi.mocked(queries.sumHoursByUserAndShiftOnDates).mockResolvedValue([
      { userId: 3, shiftId: 1, _sum: { hours: d(8.5) } },
    ] as never);

    const r = await getMonthHours("2026-11");

    expect(r).toEqual([
      { userId: 3, morningHours: 17, afternoonHours: 0, morningHolidayHours: 8.5, afternoonHolidayHours: 0 },
    ]);
    expect(queries.sumHoursByUserAndShiftOnDates).toHaveBeenCalledWith([new Date("2026-11-02T00:00:00.000Z")], undefined);
  });

  it("tháng không có ngày lễ thì phần lễ bằng 0", async () => {
    vi.mocked(queries.sumHoursByUserAndShift).mockResolvedValue([
      { userId: 4, shiftId: 2, _sum: { hours: d(10) } },
    ] as never);
    expect(await getMonthHours("2026-11")).toEqual([
      { userId: 4, morningHours: 0, afternoonHours: 10, morningHolidayHours: 0, afternoonHolidayHours: 0 },
    ]);
  });
});

describe("getUserMonthDays gắn tên ngày lễ", () => {
  it("ngày trùng ngày lễ có tên, ngày khác thì null", async () => {
    vi.mocked(queries.findUserEntriesInMonth).mockResolvedValue([
      { workDate: new Date("2026-11-01T00:00:00.000Z"), isOff: false, hours: d(8.5), note: null, shift: { code: "MORNING" } },
      { workDate: new Date("2026-11-02T00:00:00.000Z"), isOff: false, hours: d(8.5), note: null, shift: { code: "MORNING" } },
    ] as never);
    vi.mocked(queries.findHolidaysInMonth).mockResolvedValue([
      { workDate: new Date("2026-11-02T00:00:00.000Z"), note: "Giỗ" },
    ] as never);

    const r = await getUserMonthDays(3, "2026-11");

    expect(r.map((x) => x.holiday)).toEqual([null, "Giỗ"]);
  });
});

describe("saveDayEntriesFor và ngày lễ", () => {
  const entries = [{ userId: 3, off: false, morning: { hours: 8.5 } }];

  it("tích lễ thì ghi tên lễ của ngày đó", async () => {
    await saveDayEntriesFor("2026-11-02", entries, { note: "Giỗ" });
    expect(queries.replaceHolidayDay).toHaveBeenCalledWith("2026-11-02", { note: "Giỗ" });
  });

  it("bỏ tích thì xóa ngày lễ của ngày đó", async () => {
    await saveDayEntriesFor("2026-11-02", entries, null);
    expect(queries.replaceHolidayDay).toHaveBeenCalledWith("2026-11-02", null);
  });

  it("không truyền gì thì giữ nguyên ngày lễ cũ", async () => {
    await saveDayEntriesFor("2026-11-02", entries);
    expect(queries.replaceHolidayDay).not.toHaveBeenCalled();
  });
});
