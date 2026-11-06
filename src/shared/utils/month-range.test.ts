import { describe, expect, it } from "vitest";
import { monthRange } from "./month";

describe("monthRange", () => {
  it("từ đầu tháng đến đầu tháng sau, không gồm ngày cuối", () => {
    const { start, end } = monthRange("2026-11");
    expect(start.toISOString()).toBe("2026-11-01T00:00:00.000Z");
    expect(end.toISOString()).toBe("2026-12-01T00:00:00.000Z");
  });

  it("tháng 12 sang tháng 1 năm sau", () => {
    expect(monthRange("2026-12").end.toISOString()).toBe("2027-01-01T00:00:00.000Z");
  });

  it("ca chiều 31/10 thuộc tháng 10, ngày 01/11 thuộc tháng 11", () => {
    const oct = monthRange("2026-10");
    const lastShift = new Date("2026-10-31T00:00:00.000Z");
    const firstNov = new Date("2026-11-01T00:00:00.000Z");
    expect(lastShift >= oct.start && lastShift < oct.end).toBe(true);
    expect(firstNov >= oct.start && firstNov < oct.end).toBe(false);
  });
});
