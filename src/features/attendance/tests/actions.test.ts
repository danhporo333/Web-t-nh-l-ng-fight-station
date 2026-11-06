import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth", () => ({ requireOwner: vi.fn() }));
vi.mock("../service", () => ({ saveDayEntriesFor: vi.fn() }));

import { requireOwner } from "@/lib/auth";
import { saveDayEntries } from "../actions";
import * as service from "../service";

function form(values: [string, string][]) {
  const f = new FormData();
  for (const [k, v] of values) f.append(k, v);
  return f;
}

beforeEach(() => vi.clearAllMocks());

describe("saveDayEntries", () => {
  it("người không phải chủ quán bị chặn, service không được gọi", async () => {
    vi.mocked(requireOwner).mockRejectedValue(new Error("NEXT_REDIRECT"));
    await expect(saveDayEntries(undefined, form([["date", "2026-11-05"]]))).rejects.toThrow("NEXT_REDIRECT");
    expect(service.saveDayEntriesFor).not.toHaveBeenCalled();
  });

  describe("với chủ quán", () => {
    beforeEach(() => vi.mocked(requireOwner).mockResolvedValue({} as never));

    it("ngày sai trả COMMON_002", async () => {
      const r = await saveDayEntries(undefined, form([["date", "2026-02-30"], ["userId", "3"]]));
      expect(r.success === false && r.error.code).toBe("COMMON_002");
    });

    it("số giờ sai trả ATT_001", async () => {
      const r = await saveDayEntries(
        undefined,
        form([["date", "2026-11-05"], ["userId", "3"], ["morning-3", "on"], ["morningHours-3", "25"], ["morningNote-3", ""]]),
      );
      expect(r.success === false && r.error.code).toBe("ATT_001");
      expect(service.saveDayEntriesFor).not.toHaveBeenCalled();
    });

    it("gom ca, Off của từng người từ form rồi gọi service", async () => {
      vi.mocked(service.saveDayEntriesFor).mockResolvedValue({ success: true, data: { saved: 3 } });
      await saveDayEntries(
        undefined,
        form([
          ["date", "2026-11-05"],
          ["userId", "3"], ["morning-3", "on"], ["morningHours-3", "8,5"], ["morningNote-3", ""],
          ["afternoon-3", "on"], ["afternoonHours-3", "10"], ["afternoonNote-3", ""],
          ["userId", "4"], ["off-4", "on"],
          ["userId", "5"],
        ]),
      );
      expect(service.saveDayEntriesFor).toHaveBeenCalledWith("2026-11-05", [
        { userId: 3, off: false, morning: { hours: 8.5, note: undefined }, afternoon: { hours: 10, note: undefined } },
        { userId: 4, off: true },
        { userId: 5, off: false },
      ]);
    });
  });
});
