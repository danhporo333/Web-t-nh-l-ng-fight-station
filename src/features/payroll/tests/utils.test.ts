import { describe, expect, it } from "vitest";
import { calculatePay, calculateShiftPay } from "../utils";

const base = { morningHours: 0, afternoonHours: 0, morningHolidayHours: 0, afternoonHolidayHours: 0, morningRate: 26000, afternoonRate: 28000, bonus: 0, penalty: 0, meal: 0 };

describe("calculatePay", () => {
  it("chỉ ca sáng", () => {
    expect(calculatePay({ ...base, morningHours: 8.5 })).toEqual({ shiftPay: 221000, netPay: 221000 });
  });
  it("chỉ ca chiều", () => {
    expect(calculatePay({ ...base, afternoonHours: 10 })).toEqual({ shiftPay: 280000, netPay: 280000 });
  });
  it("cả hai ca, ví dụ tháng 11 trong SPEC.md: 865.000đ", () => {
    // 01/11: 8,5 giờ sáng; 02/11: 5,5 giờ sáng; 03/11: 8,5 giờ sáng + 10 giờ chiều; 04/11 Off
    const r = calculatePay({ ...base, morningHours: 8.5 + 5.5 + 8.5, afternoonHours: 10 });
    expect(r.shiftPay).toBe(865000);
  });
  it("ngày Off không có giờ thì không có tiền", () => {
    expect(calculatePay(base)).toEqual({ shiftPay: 0, netPay: 0 });
  });
  it("cộng thưởng", () => {
    expect(calculatePay({ ...base, morningHours: 8.5, bonus: 50000 }).netPay).toBe(271000);
  });
  it("trừ phạt", () => {
    expect(calculatePay({ ...base, morningHours: 8.5, penalty: 20000 }).netPay).toBe(201000);
  });
  it("thưởng và phạt cùng lúc, ví dụ API_SPEC: 644.000 + 50.000 − 20.000 = 674.000", () => {
    const r = calculatePay({ ...base, morningHours: 14, afternoonHours: 10, bonus: 50000, penalty: 20000 });
    expect(r).toEqual({ shiftPay: 644000, netPay: 674000 });
  });
  it("trừ tiền ăn uống", () => {
    expect(calculatePay({ ...base, morningHours: 8.5, meal: 35000 }).netPay).toBe(186000);
  });
  it("thưởng, phạt và ăn uống cùng lúc: 644.000 + 50.000 − 20.000 − 30.000 = 644.000", () => {
    const r = calculatePay({ ...base, morningHours: 14, afternoonHours: 10, bonus: 50000, penalty: 20000, meal: 30000 });
    expect(r).toEqual({ shiftPay: 644000, netPay: 644000 });
  });
  it("ăn uống nhiều hơn lương ca cho thực lãnh âm", () => {
    expect(calculatePay({ ...base, morningHours: 1, meal: 100000 }).netPay).toBe(-74000);
  });
  it("phạt lớn hơn lương ca cho thực lãnh âm, không bị chặn về 0", () => {
    expect(calculatePay({ ...base, morningHours: 1, penalty: 100000 }).netPay).toBe(-74000);
  });
  it("làm tròn một lần ở cuối với mức lẻ", () => {
    // 8,33 giờ × 24.050 = 200.336,5 → 200.337 (làm tròn lên một lần)
    expect(calculatePay({ ...base, morningHours: 8.33, morningRate: 24050 }).shiftPay).toBe(200337);
  });
  it("kết quả luôn là số nguyên", () => {
    const r = calculatePay({ ...base, morningHours: 7.77, afternoonHours: 3.33, morningRate: 24333, afternoonRate: 25777 });
    expect(Number.isInteger(r.shiftPay)).toBe(true);
    expect(Number.isInteger(r.netPay)).toBe(true);
  });
});

describe("calculateShiftPay", () => {
  it("tiền một ca", () => {
    expect(calculateShiftPay(5.5, 26000)).toBe(143000);
  });
});
