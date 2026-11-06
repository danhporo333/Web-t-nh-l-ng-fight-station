import { describe, expect, it } from "vitest";
import { summarizeAdjustments } from "../utils";

describe("summarizeAdjustments", () => {
  it("cộng thưởng, phạt, ăn uống riêng và tính chênh lệch", () => {
    const r = summarizeAdjustments([
      { type: "BONUS", amount: 50000 },
      { type: "BONUS", amount: 30000 },
      { type: "PENALTY", amount: 20000 },
      { type: "MEAL", amount: 35000 },
    ]);
    expect(r).toEqual({ bonus: 80000, penalty: 20000, meal: 35000, net: 25000 });
  });
  it("danh sách rỗng cho 0", () => {
    expect(summarizeAdjustments([])).toEqual({ bonus: 0, penalty: 0, meal: 0, net: 0 });
  });
});
