import { describe, expect, it } from "vitest";
import { updateShiftSchema } from "../schemas";

const base = { id: "1", startTime: "07:30", endTime: "16:00", defaultHours: "8,5", defaultRate: "24000" };

describe("updateShiftSchema", () => {
  it("chấp nhận dữ liệu hợp lệ, đổi dấu phẩy thành số", () => {
    expect(updateShiftSchema.parse(base)).toEqual({
      id: 1,
      startTime: "07:30",
      endTime: "16:00",
      defaultHours: 8.5,
      defaultRate: 24000,
    });
  });
  it("chấp nhận ca chiều kết thúc 02:00", () => {
    expect(updateShiftSchema.safeParse({ ...base, startTime: "16:00", endTime: "02:00", defaultHours: "10" }).success).toBe(true);
  });
  it.each(["0", "-1", "24.5", "abc", "8.555", ""])("từ chối số giờ %s", (v) => {
    expect(updateShiftSchema.safeParse({ ...base, defaultHours: v }).success).toBe(false);
  });
  it("chấp nhận đúng 24 giờ", () => {
    expect(updateShiftSchema.safeParse({ ...base, defaultHours: "24" }).success).toBe(true);
  });
  it.each(["7:30", "25:00", "07:60", "abc", ""])("từ chối giờ %s", (v) => {
    expect(updateShiftSchema.safeParse({ ...base, startTime: v }).success).toBe(false);
  });
  it.each(["0", "-1", "24000.5", "abc"])("từ chối mức mặc định %s", (v) => {
    expect(updateShiftSchema.safeParse({ ...base, defaultRate: v }).success).toBe(false);
  });
});
