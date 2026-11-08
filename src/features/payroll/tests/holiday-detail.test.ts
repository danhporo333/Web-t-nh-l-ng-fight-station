import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/adjustments", () => ({ getAdjustmentTotals: vi.fn(), listAdjustments: vi.fn() }));
vi.mock("@/features/attendance", () => ({ getMonthHours: vi.fn(), getUserMonthDays: vi.fn() }));
vi.mock("@/features/rates", () => ({ getRatesForMonth: vi.fn() }));
vi.mock("../queries", () => ({ findStaffForPayroll: vi.fn(), findStaffById: vi.fn() }));

import { getAdjustmentTotals, listAdjustments } from "@/features/adjustments";
import { getMonthHours, getUserMonthDays } from "@/features/attendance";
import { getRatesForMonth } from "@/features/rates";
import { findStaffById } from "../queries";
import { getStaffMonthDetail } from "../service";

const hoang = { id: 3, username: "hoang", fullName: "Hoàng", isActive: true };

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getAdjustmentTotals).mockResolvedValue([]);
  vi.mocked(listAdjustments).mockResolvedValue([]);
});

describe("getStaffMonthDetail với ngày lễ", () => {
  it("ngày lễ có tên và lương ca nhân đôi, tổng tháng cộng đúng phần lễ", async () => {
    vi.mocked(findStaffById).mockResolvedValue(hoang);
    // 01/11 thường 8,5 giờ sáng; 02/11 là lễ, 8,5 giờ sáng
    vi.mocked(getMonthHours).mockResolvedValue([
      { userId: 3, morningHours: 17, afternoonHours: 0, morningHolidayHours: 8.5, afternoonHolidayHours: 0 },
    ]);
    vi.mocked(getRatesForMonth).mockResolvedValue([{ userId: 3, morningRate: 26000, afternoonRate: 28000 }]);
    vi.mocked(getUserMonthDays).mockResolvedValue([
      { date: "2026-11-01", off: false, shift: "MORNING", hours: 8.5, note: null, holiday: null },
      { date: "2026-11-02", off: false, shift: "MORNING", hours: 8.5, note: null, holiday: "Giỗ Tổ Hùng Vương" },
    ]);

    const d = await getStaffMonthDetail(3, "2026-11");

    expect(d?.summary).toMatchObject({ shiftPay: 663000, netPay: 663000 });
    expect(d?.days.map((x) => x.pay)).toEqual([221000, 442000]);
    expect(d?.days[0].holiday).toBeNull();
    expect(d?.days[1].holiday).toBe("Giỗ Tổ Hùng Vương");
  });
});
