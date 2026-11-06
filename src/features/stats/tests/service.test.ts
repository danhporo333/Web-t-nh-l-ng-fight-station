import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/adjustments", () => ({ getPenaltyBreakdown: vi.fn() }));
vi.mock("@/features/attendance", () => ({ getMonthOffDays: vi.fn() }));
vi.mock("../queries", () => ({ findStaffForStats: vi.fn() }));

import { getPenaltyBreakdown } from "@/features/adjustments";
import { getMonthOffDays } from "@/features/attendance";
import { findStaffForStats } from "../queries";
import { getMonthStats } from "../service";

beforeEach(() => vi.clearAllMocks());

describe("getMonthStats", () => {
  it("lấy cả người đã nghỉ việc có ngày nghỉ hoặc khoản phạt trong tháng", async () => {
    vi.mocked(getMonthOffDays).mockResolvedValue([{ userId: 5, dates: ["2026-11-01"] }]);
    vi.mocked(getPenaltyBreakdown).mockResolvedValue([{ userId: 4, category: "đi trễ", count: 1, amount: 10000 }]);
    vi.mocked(findStaffForStats).mockResolvedValue([
      { id: 4, username: "lan", fullName: "Lan", isActive: true },
      { id: 5, username: "minh", fullName: "Minh", isActive: false },
    ]);

    const stats = await getMonthStats("2026-11");

    expect(vi.mocked(findStaffForStats).mock.calls[0][0].sort()).toEqual([4, 5]);
    expect(stats.totals).toEqual({ offDays: 1, penaltyCount: 1, penaltyAmount: 10000 });
    expect(getMonthOffDays).toHaveBeenCalledWith("2026-11");
    expect(getPenaltyBreakdown).toHaveBeenCalledWith("2026-11");
  });
});
