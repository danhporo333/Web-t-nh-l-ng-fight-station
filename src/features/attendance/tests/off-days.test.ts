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
  findOffEntriesInMonth: vi.fn(),
}));

import * as queries from "../queries";
import { getMonthOffDays } from "../service";

const at = (userId: number, date: string) => ({ userId, workDate: new Date(`${date}T00:00:00.000Z`) });

beforeEach(() => vi.clearAllMocks());

describe("getMonthOffDays", () => {
  it("gom ngày Off của từng người theo thứ tự ngày", async () => {
    vi.mocked(queries.findOffEntriesInMonth).mockResolvedValue([
      at(3, "2026-11-04"),
      at(4, "2026-11-05"),
      at(3, "2026-11-12"),
    ] as never);
    expect(await getMonthOffDays("2026-11")).toEqual([
      { userId: 3, dates: ["2026-11-04", "2026-11-12"] },
      { userId: 4, dates: ["2026-11-05"] },
    ]);
  });

  it("một ngày chỉ tính một lần dù có dòng Off trùng", async () => {
    vi.mocked(queries.findOffEntriesInMonth).mockResolvedValue([at(3, "2026-11-04"), at(3, "2026-11-04")] as never);
    expect(await getMonthOffDays("2026-11")).toEqual([{ userId: 3, dates: ["2026-11-04"] }]);
  });

  it("không có ngày Off thì trả danh sách rỗng", async () => {
    vi.mocked(queries.findOffEntriesInMonth).mockResolvedValue([]);
    expect(await getMonthOffDays("2026-11")).toEqual([]);
  });
});
