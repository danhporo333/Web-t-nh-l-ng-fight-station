import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth", () => ({ requireOwner: vi.fn() }));
vi.mock("../service", () => ({
  createAdjustmentFor: vi.fn(),
  updateAdjustmentFor: vi.fn(),
  deleteAdjustmentFor: vi.fn(),
}));

import { requireOwner } from "@/lib/auth";
import { createAdjustment, deleteAdjustment, updateAdjustment } from "../actions";
import * as service from "../service";

function form(values: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(values)) f.set(k, v);
  return f;
}

const valid = { userId: "3", date: "2026-11-10", type: "BONUS", amount: "50000", reason: "làm tốt dịp lễ" };

beforeEach(() => vi.clearAllMocks());

describe("kiểm tra quyền", () => {
  it("người không phải chủ quán bị chặn, service không được gọi", async () => {
    vi.mocked(requireOwner).mockRejectedValue(new Error("NEXT_REDIRECT"));
    await expect(createAdjustment(undefined, form(valid))).rejects.toThrow("NEXT_REDIRECT");
    await expect(updateAdjustment(undefined, form({ ...valid, id: "1" }))).rejects.toThrow("NEXT_REDIRECT");
    await expect(deleteAdjustment(undefined, form({ id: "1" }))).rejects.toThrow("NEXT_REDIRECT");
    expect(service.createAdjustmentFor).not.toHaveBeenCalled();
    expect(service.updateAdjustmentFor).not.toHaveBeenCalled();
    expect(service.deleteAdjustmentFor).not.toHaveBeenCalled();
  });
});

describe("validate", () => {
  beforeEach(() => vi.mocked(requireOwner).mockResolvedValue({} as never));

  it("số tiền sai trả ADJ_001", async () => {
    const r = await createAdjustment(undefined, form({ ...valid, amount: "-1" }));
    expect(r.success === false && r.error.code).toBe("ADJ_001");
  });
  it("thiếu lý do trả ADJ_002", async () => {
    const r = await createAdjustment(undefined, form({ ...valid, reason: "  " }));
    expect(r.success === false && r.error.code).toBe("ADJ_002");
  });
  it("ngày sai trả COMMON_002", async () => {
    const r = await createAdjustment(undefined, form({ ...valid, date: "2026-02-30" }));
    expect(r.success === false && r.error.code).toBe("COMMON_002");
    expect(service.createAdjustmentFor).not.toHaveBeenCalled();
  });
  it("dữ liệu đúng thì gọi service", async () => {
    vi.mocked(service.createAdjustmentFor).mockResolvedValue({ success: true, data: {} as never });
    await createAdjustment(undefined, form(valid));
    expect(service.createAdjustmentFor).toHaveBeenCalledWith({
      userId: 3,
      date: "2026-11-10",
      type: "BONUS",
      amount: 50000,
      reason: "làm tốt dịp lễ",
    });
  });
});
