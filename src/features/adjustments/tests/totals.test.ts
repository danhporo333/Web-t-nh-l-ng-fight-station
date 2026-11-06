import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../queries", () => ({
  findAdjustmentsByMonth: vi.fn(),
  findAdjustmentId: vi.fn(),
  findUserRole: vi.fn(),
  findActiveStaff: vi.fn(),
  insertAdjustment: vi.fn(),
  updateAdjustmentById: vi.fn(),
  deleteAdjustmentById: vi.fn(),
  sumAdjustmentsByUserAndType: vi.fn(),
}));

import * as queries from "../queries";
import { getAdjustmentTotals } from "../service";

beforeEach(() => vi.clearAllMocks());

describe("getAdjustmentTotals", () => {
  it("gom thưởng và phạt của từng người", async () => {
    vi.mocked(queries.sumAdjustmentsByUserAndType).mockResolvedValue([
      { userId: 3, type: "BONUS", _sum: { amount: 50000 } },
      { userId: 3, type: "PENALTY", _sum: { amount: 20000 } },
      { userId: 4, type: "PENALTY", _sum: { amount: 10000 } },
    ] as never);

    expect(await getAdjustmentTotals("2026-11")).toEqual([
      { userId: 3, bonus: 50000, penalty: 20000 },
      { userId: 4, bonus: 0, penalty: 10000 },
    ]);
  });

  it("truyền userId xuống tầng dữ liệu", async () => {
    vi.mocked(queries.sumAdjustmentsByUserAndType).mockResolvedValue([]);
    await getAdjustmentTotals("2026-11", 3);
    expect(queries.sumAdjustmentsByUserAndType).toHaveBeenCalledWith("2026-11", 3);
  });
});
