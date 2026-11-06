import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth", () => ({ requireOwner: vi.fn() }));
vi.mock("../service", () => ({
  ensureMonthRatesFor: vi.fn(),
  saveRatesFor: vi.fn(),
}));

import { requireOwner } from "@/lib/auth";
import { ensureMonthRates, saveMonthlyRates } from "../actions";
import * as service from "../service";

function form(values: [string, string][]) {
  const f = new FormData();
  for (const [k, v] of values) f.append(k, v);
  return f;
}

beforeEach(() => vi.clearAllMocks());

describe("kiểm tra quyền", () => {
  it("người không phải chủ quán bị chặn, service không được gọi", async () => {
    vi.mocked(requireOwner).mockRejectedValue(new Error("NEXT_REDIRECT"));
    await expect(ensureMonthRates(undefined, form([["month", "2026-11"]]))).rejects.toThrow("NEXT_REDIRECT");
    await expect(saveMonthlyRates(undefined, form([["month", "2026-11"]]))).rejects.toThrow("NEXT_REDIRECT");
    expect(service.ensureMonthRatesFor).not.toHaveBeenCalled();
    expect(service.saveRatesFor).not.toHaveBeenCalled();
  });
});

describe("validate", () => {
  beforeEach(() => vi.mocked(requireOwner).mockResolvedValue({} as never));

  it("tháng sai định dạng trả COMMON_002", async () => {
    const r = await ensureMonthRates(undefined, form([["month", "2026-13"]]));
    expect(r.success === false && r.error.code).toBe("COMMON_002");
    expect(service.ensureMonthRatesFor).not.toHaveBeenCalled();
  });

  it("mức lương không phải số nguyên dương trả RATE_001", async () => {
    const r = await saveMonthlyRates(
      undefined,
      form([["month", "2026-11"], ["userId", "1"], ["morning-1", "-5"], ["afternoon-1", "26000"]]),
    );
    expect(r.success === false && r.error.code).toBe("RATE_001");
    expect(service.saveRatesFor).not.toHaveBeenCalled();
  });

  it("gom mức của nhiều nhân viên rồi gọi service", async () => {
    vi.mocked(service.saveRatesFor).mockResolvedValue({ success: true, data: { saved: 2 } });
    await saveMonthlyRates(
      undefined,
      form([
        ["month", "2026-11"],
        ["userId", "1"], ["morning-1", "25000"], ["afternoon-1", "27000"],
        ["userId", "2"], ["morning-2", "24000"], ["afternoon-2", "26000"],
      ]),
    );
    expect(service.saveRatesFor).toHaveBeenCalledWith("2026-11", [
      { userId: 1, morningRate: 25000, afternoonRate: 27000 },
      { userId: 2, morningRate: 24000, afternoonRate: 26000 },
    ]);
  });
});
