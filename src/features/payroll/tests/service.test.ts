import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/adjustments", () => ({ getAdjustmentTotals: vi.fn(), listAdjustments: vi.fn() }));
vi.mock("@/features/attendance", () => ({ getMonthHours: vi.fn(), getUserMonthDays: vi.fn() }));
vi.mock("@/features/rates", () => ({ getRatesForMonth: vi.fn() }));
vi.mock("../queries", () => ({ findStaffForPayroll: vi.fn(), findStaffById: vi.fn() }));

import { getAdjustmentTotals, listAdjustments } from "@/features/adjustments";
import { getMonthHours, getUserMonthDays } from "@/features/attendance";
import { getRatesForMonth } from "@/features/rates";
import { findStaffById, findStaffForPayroll } from "../queries";
import { getMonthlyPayroll, getStaffMonthDetail } from "../service";

const hoang = { id: 3, username: "hoang", fullName: "Hoàng", isActive: true };
const lan = { id: 4, username: "lan", fullName: "Lan", isActive: true };
const minh = { id: 5, username: "minh", fullName: "Minh", isActive: false };

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getMonthHours).mockResolvedValue([]);
  vi.mocked(getRatesForMonth).mockResolvedValue([]);
  vi.mocked(getAdjustmentTotals).mockResolvedValue([]);
  vi.mocked(getUserMonthDays).mockResolvedValue([]);
  vi.mocked(listAdjustments).mockResolvedValue([]);
});

describe("getMonthlyPayroll", () => {
  it("tính lương theo giờ, mức, thưởng và phạt của từng người", async () => {
    vi.mocked(getMonthHours).mockResolvedValue([{ userId: 3, morningHours: 14, afternoonHours: 10 }]);
    vi.mocked(getRatesForMonth).mockResolvedValue([{ userId: 3, morningRate: 26000, afternoonRate: 28000 }]);
    vi.mocked(getAdjustmentTotals).mockResolvedValue([{ userId: 3, bonus: 50000, penalty: 20000 }]);
    vi.mocked(findStaffForPayroll).mockResolvedValue([hoang]);

    const p = await getMonthlyPayroll("2026-11");

    expect(p.rows[0]).toMatchObject({ userId: 3, shiftPay: 644000, bonus: 50000, penalty: 20000, netPay: 674000, missingRate: false });
    expect(p.totals).toMatchObject({ morningHours: 14, afternoonHours: 10, shiftPay: 644000, netPay: 674000 });
  });

  it("nhân viên không có giờ làm cho 0đ dù chưa có mức lương", async () => {
    vi.mocked(findStaffForPayroll).mockResolvedValue([lan]);
    const p = await getMonthlyPayroll("2026-11");
    expect(p.rows[0]).toMatchObject({ shiftPay: 0, netPay: 0, missingRate: false });
    expect(p.missingRateCount).toBe(0);
  });

  it("có giờ làm nhưng chưa có mức lương: đánh dấu thiếu, không tính tiền, không cộng vào tổng", async () => {
    vi.mocked(getMonthHours).mockResolvedValue([
      { userId: 3, morningHours: 8.5, afternoonHours: 0 },
      { userId: 4, morningHours: 8.5, afternoonHours: 0 },
    ]);
    vi.mocked(getRatesForMonth).mockResolvedValue([{ userId: 3, morningRate: 26000, afternoonRate: 28000 }]);
    vi.mocked(findStaffForPayroll).mockResolvedValue([hoang, lan]);

    const p = await getMonthlyPayroll("2026-11");

    expect(p.rows[1]).toMatchObject({ userId: 4, missingRate: true, shiftPay: null, netPay: null });
    expect(p.missingRateCount).toBe(1);
    expect(p.totals.netPay).toBe(221000);
  });

  it("chỉ thưởng phạt, không có giờ làm: thực lãnh là thưởng trừ phạt", async () => {
    vi.mocked(getAdjustmentTotals).mockResolvedValue([{ userId: 4, bonus: 30000, penalty: 10000 }]);
    vi.mocked(findStaffForPayroll).mockResolvedValue([lan]);
    const p = await getMonthlyPayroll("2026-11");
    expect(p.rows[0]).toMatchObject({ shiftPay: 0, netPay: 20000 });
  });

  it("yêu cầu cả người đã nghỉ việc có dữ liệu trong tháng", async () => {
    vi.mocked(getMonthHours).mockResolvedValue([{ userId: 5, morningHours: 8, afternoonHours: 0 }]);
    vi.mocked(getAdjustmentTotals).mockResolvedValue([{ userId: 4, bonus: 1000, penalty: 0 }]);
    vi.mocked(getRatesForMonth).mockResolvedValue([{ userId: 5, morningRate: 24000, afternoonRate: 26000 }]);
    vi.mocked(findStaffForPayroll).mockResolvedValue([lan, minh]);

    const p = await getMonthlyPayroll("2026-11");

    expect(vi.mocked(findStaffForPayroll).mock.calls[0][0].sort()).toEqual([4, 5]);
    expect(p.rows.find((r) => r.userId === 5)).toMatchObject({ isActive: false, shiftPay: 192000 });
  });

  it("không có nhân viên nào thì bảng rỗng, tổng 0", async () => {
    vi.mocked(findStaffForPayroll).mockResolvedValue([]);
    const p = await getMonthlyPayroll("2026-11");
    expect(p.rows).toEqual([]);
    expect(p.totals.netPay).toBe(0);
  });
});

describe("getStaffMonthDetail", () => {
  it("không phải nhân viên thì trả null và không đọc dữ liệu", async () => {
    vi.mocked(findStaffById).mockResolvedValue(null);
    expect(await getStaffMonthDetail(1, "2026-11")).toBeNull();
    expect(getMonthHours).not.toHaveBeenCalled();
  });

  it("gom từng ngày: hai ca trong một ngày, ngày Off, tiền từng ngày", async () => {
    vi.mocked(findStaffById).mockResolvedValue(hoang);
    vi.mocked(getMonthHours).mockResolvedValue([{ userId: 3, morningHours: 22.5, afternoonHours: 10 }]);
    vi.mocked(getRatesForMonth).mockResolvedValue([{ userId: 3, morningRate: 26000, afternoonRate: 28000 }]);
    vi.mocked(getUserMonthDays).mockResolvedValue([
      { date: "2026-11-01", off: false, shift: "MORNING", hours: 8.5, note: null },
      { date: "2026-11-02", off: false, shift: "MORNING", hours: 5.5, note: "về sớm lúc 13h" },
      { date: "2026-11-03", off: false, shift: "MORNING", hours: 8.5, note: null },
      { date: "2026-11-03", off: false, shift: "AFTERNOON", hours: 10, note: null },
      { date: "2026-11-04", off: true, shift: null, hours: 0, note: null },
    ]);

    const d = await getStaffMonthDetail(3, "2026-11");

    expect(d?.summary).toMatchObject({ shiftPay: 865000, netPay: 865000 });
    expect(d?.days.map((x) => x.pay)).toEqual([221000, 143000, 501000, 0]);
    expect(d?.days[2].entries).toHaveLength(2);
    expect(d?.days[3]).toMatchObject({ off: true, entries: [] });
    expect(d?.days[1].entries[0].note).toBe("về sớm lúc 13h");
  });

  it("thiếu mức lương thì tiền từng ngày là null", async () => {
    vi.mocked(findStaffById).mockResolvedValue(lan);
    vi.mocked(getMonthHours).mockResolvedValue([{ userId: 4, morningHours: 8.5, afternoonHours: 0 }]);
    vi.mocked(getUserMonthDays).mockResolvedValue([{ date: "2026-11-01", off: false, shift: "MORNING", hours: 8.5, note: null }]);

    const d = await getStaffMonthDetail(4, "2026-11");

    expect(d?.summary.missingRate).toBe(true);
    expect(d?.days[0].pay).toBeNull();
  });

  it("chỉ đọc dữ liệu của đúng nhân viên được hỏi", async () => {
    vi.mocked(findStaffById).mockResolvedValue(hoang);
    await getStaffMonthDetail(3, "2026-11");
    expect(getMonthHours).toHaveBeenCalledWith("2026-11", 3);
    expect(getRatesForMonth).toHaveBeenCalledWith("2026-11", 3);
    expect(getAdjustmentTotals).toHaveBeenCalledWith("2026-11", 3);
    expect(getUserMonthDays).toHaveBeenCalledWith(3, "2026-11");
    expect(listAdjustments).toHaveBeenCalledWith("2026-11", 3);
  });
});
