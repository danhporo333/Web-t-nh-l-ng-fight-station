import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../queries", () => ({
  findAdjustmentsByMonth: vi.fn(),
  findAdjustmentId: vi.fn(),
  findUserRole: vi.fn(),
  findActiveStaff: vi.fn(),
  insertAdjustment: vi.fn(),
  updateAdjustmentById: vi.fn(),
  deleteAdjustmentById: vi.fn(),
}));

import * as queries from "../queries";
import {
  createAdjustmentFor,
  deleteAdjustmentFor,
  listAdjustments,
  updateAdjustmentFor,
} from "../service";

const row = {
  id: 1,
  userId: 3,
  date: new Date("2026-11-10T00:00:00.000Z"),
  type: "PENALTY",
  amount: 20000,
  reason: "đi trễ",
  category: null,
  user: { fullName: "Hoàng" },
};
const updateInput = { date: "2026-11-10", type: "PENALTY" as const, amount: 20000, reason: "đi trễ", category: null };
const input = { userId: 3, ...updateInput };

function errorCode(r: { success: boolean; error?: { code: string } }) {
  return r.success ? null : r.error?.code;
}

beforeEach(() => vi.clearAllMocks());

describe("listAdjustments", () => {
  it("đổi ngày về YYYY-MM-DD và lấy tên nhân viên", async () => {
    vi.mocked(queries.findAdjustmentsByMonth).mockResolvedValue([row] as never);
    const items = await listAdjustments("2026-11");
    expect(items).toEqual([
      { id: 1, userId: 3, fullName: "Hoàng", date: "2026-11-10", type: "PENALTY", amount: 20000, reason: "đi trễ", category: null },
    ]);
  });
  it("truyền bộ lọc nhân viên xuống tầng dữ liệu", async () => {
    vi.mocked(queries.findAdjustmentsByMonth).mockResolvedValue([]);
    await listAdjustments("2026-11", 3);
    expect(queries.findAdjustmentsByMonth).toHaveBeenCalledWith("2026-11", 3);
  });
});

describe("createAdjustmentFor", () => {
  it("thêm cho nhân viên", async () => {
    vi.mocked(queries.findUserRole).mockResolvedValue({ id: 3, role: "STAFF" });
    vi.mocked(queries.insertAdjustment).mockResolvedValue(row as never);
    expect((await createAdjustmentFor(input)).success).toBe(true);
    expect(queries.insertAdjustment).toHaveBeenCalledWith(input);
  });
  it("không có nhân viên hoặc là chủ quán trả STAFF_002", async () => {
    vi.mocked(queries.findUserRole).mockResolvedValue(null);
    expect(errorCode(await createAdjustmentFor(input))).toBe("STAFF_002");
    vi.mocked(queries.findUserRole).mockResolvedValue({ id: 1, role: "OWNER" });
    expect(errorCode(await createAdjustmentFor(input))).toBe("STAFF_002");
    expect(queries.insertAdjustment).not.toHaveBeenCalled();
  });
});

describe("updateAdjustmentFor và deleteAdjustmentFor", () => {
  it("không tìm thấy khoản trả ADJ_003, không ghi DB", async () => {
    vi.mocked(queries.findAdjustmentId).mockResolvedValue(null);
    expect(errorCode(await updateAdjustmentFor(9, updateInput))).toBe("ADJ_003");
    expect(errorCode(await deleteAdjustmentFor(9))).toBe("ADJ_003");
    expect(queries.updateAdjustmentById).not.toHaveBeenCalled();
    expect(queries.deleteAdjustmentById).not.toHaveBeenCalled();
  });
  it("sửa và xóa khi có khoản", async () => {
    vi.mocked(queries.findAdjustmentId).mockResolvedValue({ id: 1 });
    vi.mocked(queries.updateAdjustmentById).mockResolvedValue(row as never);
    vi.mocked(queries.deleteAdjustmentById).mockResolvedValue({ id: 1 } as never);
    expect((await updateAdjustmentFor(1, updateInput)).success).toBe(true);
    expect(await deleteAdjustmentFor(1)).toEqual({ success: true, data: { deleted: true } });
  });
});
