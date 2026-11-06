import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../queries", () => ({
  findActiveStaff: vi.fn(),
  findStaffByIds: vi.fn(),
  findShifts: vi.fn(),
  findEntriesByDate: vi.fn(),
  replaceDayEntries: vi.fn(),
}));

import * as queries from "../queries";
import { getDayEntries, saveDayEntriesFor } from "../service";

const shifts = [
  { id: 1, code: "MORNING", defaultHours: 8.5 },
  { id: 2, code: "AFTERNOON", defaultHours: 10 },
];

function errorCode(r: { success: boolean; error?: { code: string } }) {
  return r.success ? null : r.error?.code;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(queries.findShifts).mockResolvedValue(shifts as never);
  vi.mocked(queries.findStaffByIds).mockImplementation(((ids: number[]) =>
    Promise.resolve(ids.map((id) => ({ id, role: "STAFF", isActive: true })))) as never);
  vi.mocked(queries.replaceDayEntries).mockResolvedValue([] as never);
});

describe("saveDayEntriesFor", () => {
  it("một người làm cả hai ca trong ngày: hai dòng, ca chiều tính vào cùng ngày", async () => {
    const r = await saveDayEntriesFor("2026-11-05", [
      { userId: 3, off: false, morning: { hours: 8.5 }, afternoon: { hours: 10, note: "tăng ca" } },
    ]);
    expect(r).toEqual({ success: true, data: { saved: 1 } });
    expect(queries.replaceDayEntries).toHaveBeenCalledWith("2026-11-05", [3], [
      { userId: 3, shiftId: 1, hours: 8.5, isOff: false, note: null },
      { userId: 3, shiftId: 2, hours: 10, isOff: false, note: "tăng ca" },
    ]);
  });

  it("ngày Off: một dòng không có ca, giờ bằng 0", async () => {
    await saveDayEntriesFor("2026-11-05", [{ userId: 5, off: true }]);
    expect(queries.replaceDayEntries).toHaveBeenCalledWith("2026-11-05", [5], [
      { userId: 5, shiftId: null, hours: 0, isOff: true, note: null },
    ]);
  });

  it("người không tích gì: không có dòng mới nhưng vẫn xóa dòng cũ", async () => {
    await saveDayEntriesFor("2026-11-05", [{ userId: 6, off: false }]);
    expect(queries.replaceDayEntries).toHaveBeenCalledWith("2026-11-05", [6], []);
  });

  it("vừa Off vừa có ca trả ATT_002, không ghi DB", async () => {
    const r = await saveDayEntriesFor("2026-11-05", [{ userId: 3, off: true, morning: { hours: 8 } }]);
    expect(errorCode(r)).toBe("ATT_002");
    expect(queries.replaceDayEntries).not.toHaveBeenCalled();
  });

  it("nhân viên đã nghỉ việc trả ATT_003", async () => {
    vi.mocked(queries.findStaffByIds).mockResolvedValue([{ id: 3, role: "STAFF", isActive: false }] as never);
    const r = await saveDayEntriesFor("2026-11-05", [{ userId: 3, off: false, morning: { hours: 8 } }]);
    expect(errorCode(r)).toBe("ATT_003");
    expect(queries.replaceDayEntries).not.toHaveBeenCalled();
  });

  it("không có nhân viên hoặc là chủ quán trả STAFF_002", async () => {
    vi.mocked(queries.findStaffByIds).mockResolvedValue([{ id: 1, role: "OWNER", isActive: true }] as never);
    expect(errorCode(await saveDayEntriesFor("2026-11-05", [{ userId: 1, off: true }]))).toBe("STAFF_002");
    vi.mocked(queries.findStaffByIds).mockResolvedValue([]);
    expect(errorCode(await saveDayEntriesFor("2026-11-05", [{ userId: 9, off: true }]))).toBe("STAFF_002");
  });

  it("một người xuất hiện hai lần trả COMMON_001", async () => {
    const r = await saveDayEntriesFor("2026-11-05", [
      { userId: 3, off: true },
      { userId: 3, off: false, morning: { hours: 8 } },
    ]);
    expect(errorCode(r)).toBe("COMMON_001");
  });

  it("một người lỗi thì không ghi ai cả", async () => {
    vi.mocked(queries.findStaffByIds).mockResolvedValue([
      { id: 3, role: "STAFF", isActive: true },
      { id: 4, role: "STAFF", isActive: false },
    ] as never);
    await saveDayEntriesFor("2026-11-05", [
      { userId: 3, off: true },
      { userId: 4, off: true },
    ]);
    expect(queries.replaceDayEntries).not.toHaveBeenCalled();
  });
});

describe("getDayEntries", () => {
  it("ghép dòng chấm công vào từng nhân viên", async () => {
    vi.mocked(queries.findActiveStaff).mockResolvedValue([
      { id: 3, username: "hoang", fullName: "Hoàng" },
      { id: 4, username: "lan", fullName: "Lan" },
      { id: 5, username: "minh", fullName: "Minh" },
    ]);
    vi.mocked(queries.findEntriesByDate).mockResolvedValue([
      { userId: 3, isOff: false, hours: 5.5, note: "về sớm", shift: { code: "MORNING" } },
      { userId: 3, isOff: false, hours: 10, note: null, shift: { code: "AFTERNOON" } },
      { userId: 4, isOff: true, hours: 0, note: null, shift: null },
    ] as never);

    const view = await getDayEntries("2026-11-05");

    expect(view.defaultHours).toEqual({ morning: 8.5, afternoon: 10 });
    expect(view.rows[0]).toMatchObject({
      userId: 3,
      off: false,
      morning: { hours: 5.5, note: "về sớm" },
      afternoon: { hours: 10, note: null },
    });
    expect(view.rows[1]).toMatchObject({ userId: 4, off: true, morning: null, afternoon: null });
    expect(view.rows[2]).toMatchObject({ userId: 5, off: false, morning: null, afternoon: null });
  });
});
