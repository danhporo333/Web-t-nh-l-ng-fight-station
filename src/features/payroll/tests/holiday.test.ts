import { describe, expect, it } from "vitest";
import { calculatePay, calculateShiftPay } from "../utils";

const base = {
  morningHours: 0,
  afternoonHours: 0,
  morningHolidayHours: 0,
  afternoonHolidayHours: 0,
  morningRate: 26000,
  afternoonRate: 28000,
  bonus: 0,
  penalty: 0,
  meal: 0,
};

describe("calculatePay với ngày lễ nhân đôi lương ca", () => {
  it("ca sáng toàn bộ là ngày lễ: 8,5 giờ × 26.000 × 2 = 442.000", () => {
    expect(calculatePay({ ...base, morningHours: 8.5, morningHolidayHours: 8.5 })).toEqual({
      shiftPay: 442000,
      netPay: 442000,
    });
  });

  it("ca chiều ngày lễ: 10 giờ × 28.000 × 2 = 560.000", () => {
    expect(calculatePay({ ...base, afternoonHours: 10, afternoonHolidayHours: 10 }).shiftPay).toBe(560000);
  });

  it("tháng có cả ngày thường và ngày lễ: giờ lễ được cộng thêm một lần", () => {
    // Ngày thường 8,5 giờ sáng + ngày lễ 8,5 giờ sáng: morningHours = 17, phần lễ = 8,5
    // 17 × 26.000 + 8,5 × 26.000 = 442.000 + 221.000 = 663.000
    expect(calculatePay({ ...base, morningHours: 17, morningHolidayHours: 8.5 }).shiftPay).toBe(663000);
  });

  it("thưởng, phạt, ăn uống không nhân đôi", () => {
    const r = calculatePay({
      ...base,
      morningHours: 8.5,
      morningHolidayHours: 8.5,
      bonus: 50000,
      penalty: 20000,
      meal: 30000,
    });
    expect(r).toEqual({ shiftPay: 442000, netPay: 442000 + 50000 - 20000 - 30000 });
  });

  it("không có giờ lễ thì giống công thức cũ", () => {
    expect(calculatePay({ ...base, morningHours: 8.5, afternoonHours: 10 }).shiftPay).toBe(221000 + 280000);
  });
});

describe("calculateShiftPay", () => {
  it("ngày thường giữ nguyên", () => {
    expect(calculateShiftPay(8.5, 26000)).toBe(221000);
  });

  it("ngày lễ nhân đôi", () => {
    expect(calculateShiftPay(8.5, 26000, true)).toBe(442000);
  });
});
