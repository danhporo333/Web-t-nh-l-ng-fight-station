import { describe, expect, it } from "vitest";
import { createAdjustmentSchema, updateAdjustmentSchema } from "../schemas";

const base = { userId: "3", date: "2026-11-10", type: "PENALTY", amount: "20000", reason: " đi trễ 30 phút " };

describe("createAdjustmentSchema", () => {
  it("chấp nhận dữ liệu hợp lệ, cắt khoảng trắng lý do", () => {
    expect(createAdjustmentSchema.parse(base)).toEqual({
      userId: 3,
      date: "2026-11-10",
      type: "PENALTY",
      amount: 20000,
      reason: "đi trễ 30 phút",
      category: null,
    });
  });
  it.each(["0", "-5", "abc", "12.5", "", "1000000000"])("từ chối số tiền %s", (v) => {
    const r = createAdjustmentSchema.safeParse({ ...base, amount: v });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].path[0]).toBe("amount");
  });
  it("từ chối lý do trống hoặc chỉ có khoảng trắng", () => {
    for (const reason of ["", "   "]) {
      const r = createAdjustmentSchema.safeParse({ ...base, reason });
      expect(r.success).toBe(false);
      if (!r.success) expect(r.error.issues[0].path[0]).toBe("reason");
    }
  });
  it("từ chối lý do quá 255 ký tự", () => {
    expect(createAdjustmentSchema.safeParse({ ...base, reason: "a".repeat(256) }).success).toBe(false);
  });
  it("từ chối loại ngoài BONUS và PENALTY", () => {
    expect(createAdjustmentSchema.safeParse({ ...base, type: "OTHER" }).success).toBe(false);
  });
  it("từ chối ngày không có thật", () => {
    expect(createAdjustmentSchema.safeParse({ ...base, date: "2026-02-30" }).success).toBe(false);
  });
});

describe("updateAdjustmentSchema", () => {
  it("từ chối id không hợp lệ", () => {
    const { date, type, amount, reason } = base;
    expect(updateAdjustmentSchema.safeParse({ id: "abc", date, type, amount, reason }).success).toBe(false);
  });
  it("chấp nhận dữ liệu hợp lệ", () => {
    const { date, type, amount, reason } = base;
    expect(updateAdjustmentSchema.safeParse({ id: "4", date, type, amount, reason }).success).toBe(true);
  });
});
