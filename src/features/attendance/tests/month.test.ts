import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../queries", () => ({
  findActiveStaff: vi.fn(),
  findStaffByIds: vi.fn(),
  findShifts: vi.fn(),
  findEntriesByDate: vi.fn(),
  replaceDayEntries: vi.fn(),
  findHolidayByDate: vi.fn(),
  findHolidaysInMonth: vi.fn(),
  replaceHolidayDay: vi.fn(),
  sumHoursByUserAndShiftOnDates: vi.fn(),
  sumHoursByUserAndShift: vi.fn(),
  findUserEntriesInMonth: vi.fn(),
}));

import * as queries from "../queries";
import { getMonthHours, getUserMonthDays } from "../service";

const d = (v: number) => ({ toNumber: () => v, valueOf: () => v, toString: () => String(v) });

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(queries.findHolidaysInMonth).mockResolvedValue([] as never);
  vi.mocked(queries.sumHoursByUserAndShiftOnDates).mockResolvedValue([] as never);
  vi.mocked(queries.findShifts).mockResolvedValue([
    { id: 1, code: "MORNING", defaultHours: 8.5 },
    { id: 2, code: "AFTERNOON", defaultHours: 10 },
  ] as never);
});

describe("getMonthHours", () => {
  it("gom giờ sáng, chiều của từng người", async () => {
    vi.mocked(queries.sumHoursByUserAndShift).mockResolvedValue([
      { userId: 3, shiftId: 1, _sum: { hours: d(22.5) } },
      { userId: 3, shiftId: 2, _sum: { hours: d(10) } },
      { userId: 4, shiftId: 1, _sum: { hours: d(8.5) } },
    ] as never);

    const r = await getMonthHours("2026-11");

    expect(r).toEqual([
      { userId: 3, morningHours: 22.5, afternoonHours: 10, morningHolidayHours: 0, afternoonHolidayHours: 0 },
      { userId: 4, morningHours: 8.5, afternoonHours: 0, morningHolidayHours: 0, afternoonHolidayHours: 0 },
    ]);
  });

  it("bỏ qua dòng không có ca (ngày Off) và tổng giờ trống", async () => {
    vi.mocked(queries.sumHoursByUserAndShift).mockResolvedValue([
      { userId: 3, shiftId: null, _sum: { hours: d(0) } },
      { userId: 4, shiftId: 1, _sum: { hours: null } },
    ] as never);

    expect(await getMonthHours("2026-11")).toEqual([{ userId: 4, morningHours: 0, afternoonHours: 0, morningHolidayHours: 0, afternoonHolidayHours: 0 }]);
  });

  it("truyền userId xuống tầng dữ liệu", async () => {
    vi.mocked(queries.sumHoursByUserAndShift).mockResolvedValue([]);
    await getMonthHours("2026-11", 3);
    expect(queries.sumHoursByUserAndShift).toHaveBeenCalledWith("2026-11", 3);
  });
});

describe("getUserMonthDays", () => {
  it("đổi dòng chấm công về dạng ngày, ca, giờ", async () => {
    vi.mocked(queries.findUserEntriesInMonth).mockResolvedValue([
      { workDate: new Date("2026-10-31T00:00:00.000Z"), isOff: false, hours: d(10), note: null, shift: { code: "AFTERNOON" } },
      { workDate: new Date("2026-11-01T00:00:00.000Z"), isOff: true, hours: d(0), note: null, shift: null },
    ] as never);

    expect(await getUserMonthDays(3, "2026-10")).toEqual([
      { date: "2026-10-31", off: false, shift: "AFTERNOON", hours: 10, note: null , holiday: null },
      { date: "2026-11-01", off: true, shift: null, hours: 0, note: null , holiday: null },
    ]);
  });
});
