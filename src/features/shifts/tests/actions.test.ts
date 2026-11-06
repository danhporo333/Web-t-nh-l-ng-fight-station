import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth", () => ({ requireOwner: vi.fn() }));
vi.mock("../service", () => ({ updateShiftSettings: vi.fn() }));

import { requireOwner } from "@/lib/auth";
import { updateShift } from "../actions";
import * as service from "../service";

function form(values: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(values)) f.set(k, v);
  return f;
}

const valid = { id: "1", startTime: "07:30", endTime: "16:00", defaultHours: "8.5", defaultRate: "24000" };

beforeEach(() => vi.clearAllMocks());

describe("updateShift", () => {
  it("người không phải chủ quán bị chặn, service không được gọi", async () => {
    vi.mocked(requireOwner).mockRejectedValue(new Error("NEXT_REDIRECT"));
    await expect(updateShift(undefined, form(valid))).rejects.toThrow("NEXT_REDIRECT");
    expect(service.updateShiftSettings).not.toHaveBeenCalled();
  });

  it("dữ liệu sai trả SHIFT_001", async () => {
    vi.mocked(requireOwner).mockResolvedValue({} as never);
    const r = await updateShift(undefined, form({ ...valid, defaultHours: "30" }));
    expect(r.success === false && r.error.code).toBe("SHIFT_001");
    expect(service.updateShiftSettings).not.toHaveBeenCalled();
  });
});
