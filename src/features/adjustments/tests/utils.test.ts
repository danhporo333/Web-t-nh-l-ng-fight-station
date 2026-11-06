import { describe, expect, it } from "vitest";
import { summarizeAdjustments } from "../utils";

describe("summarizeAdjustments", () => {
  it("cộng thưởng, phạt riêng và tính chênh lệch", () => {
    const r = summarizeAdjustments([
      { type: "BONUS", amount: 50000 },
      { type: "BONUS", amount: 30000 },
      { type: "PENALTY", amount: 20000 },
    ]);
    expect(r).toEqual({ bonus: 80000, penalty: 20000, net: 60000 });
  });
  it("danh sách rỗng cho 0", () => {
    expect(summarizeAdjustments([])).toEqual({ bonus: 0, penalty: 0, net: 0 });
  });
});
