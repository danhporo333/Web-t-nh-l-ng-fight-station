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
  findPenaltyCategories: vi.fn(),
  sumPenaltiesByUserAndCategory: vi.fn(),
}));

import * as queries from "../queries";
import { createAdjustmentSchema } from "../schemas";
import {
  createAdjustmentFor,
  getCategoryOptions,
  getPenaltyBreakdown,
  updateAdjustmentFor,
} from "../service";

const row = {
  id: 1,
  userId: 3,
  date: new Date("2026-11-10T00:00:00.000Z"),
  type: "PENALTY",
  amount: 20000,
  reason: "đi trễ",
  category: "đi trễ",
  user: { fullName: "Hoàng" },
};
const base = { userId: 3, date: "2026-11-10", amount: 20000, reason: "đi trễ" };

beforeEach(() => vi.clearAllMocks());

describe("schema: loại lỗi", () => {
  const form = { userId: "3", date: "2026-11-10", type: "PENALTY", amount: "20000", reason: "đi trễ" };

  it("cắt khoảng trắng, để trống thành null", () => {
    expect(createAdjustmentSchema.parse({ ...form, category: "  đi trễ " }).category).toBe("đi trễ");
    expect(createAdjustmentSchema.parse({ ...form, category: "   " }).category).toBeNull();
  });
  it("từ chối loại lỗi quá 50 ký tự", () => {
    expect(createAdjustmentSchema.safeParse({ ...form, category: "a".repeat(51) }).success).toBe(false);
  });
});

describe("loại lỗi chỉ dành cho khoản phạt", () => {
  beforeEach(() => {
    vi.mocked(queries.findUserRole).mockResolvedValue({ id: 3, role: "STAFF" });
    vi.mocked(queries.findAdjustmentId).mockResolvedValue({ id: 1 });
    vi.mocked(queries.insertAdjustment).mockResolvedValue(row as never);
    vi.mocked(queries.updateAdjustmentById).mockResolvedValue(row as never);
  });

  it("khoản phạt giữ loại lỗi", async () => {
    await createAdjustmentFor({ ...base, type: "PENALTY", category: "đi trễ" });
    expect(queries.insertAdjustment).toHaveBeenCalledWith(expect.objectContaining({ category: "đi trễ" }));
  });
  it("khoản thưởng bị bỏ loại lỗi", async () => {
    await createAdjustmentFor({ ...base, type: "BONUS", category: "đi trễ" });
    expect(queries.insertAdjustment).toHaveBeenCalledWith(expect.objectContaining({ category: null }));
  });
  it("sửa phạt thành thưởng thì xóa loại lỗi", async () => {
    const { date, amount, reason } = base;
    await updateAdjustmentFor(1, { date, amount, reason, type: "BONUS", category: "đi trễ" });
    expect(queries.updateAdjustmentById).toHaveBeenCalledWith(1, expect.objectContaining({ category: null }));
  });
});

describe("getCategoryOptions", () => {
  it("trả danh sách loại lỗi đã dùng, bỏ giá trị trống", async () => {
    vi.mocked(queries.findPenaltyCategories).mockResolvedValue([
      { category: "đi trễ" },
      { category: null },
      { category: "nghỉ không phép" },
    ] as never);
    expect(await getCategoryOptions()).toEqual(["đi trễ", "nghỉ không phép"]);
  });
});

describe("getPenaltyBreakdown", () => {
  it("đổi kết quả nhóm thành số lần và số tiền", async () => {
    vi.mocked(queries.sumPenaltiesByUserAndCategory).mockResolvedValue([
      { userId: 3, category: "đi trễ", _count: { _all: 2 }, _sum: { amount: 40000 } },
      { userId: 3, category: null, _count: { _all: 1 }, _sum: { amount: null } },
    ] as never);
    expect(await getPenaltyBreakdown("2026-11")).toEqual([
      { userId: 3, category: "đi trễ", count: 2, amount: 40000 },
      { userId: 3, category: null, count: 1, amount: 0 },
    ]);
  });
});
