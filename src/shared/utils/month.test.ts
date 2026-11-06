import { describe, expect, it } from "vitest";
import { currentMonth, isValidMonth, nextMonth, previousMonth } from "./month";

describe("isValidMonth", () => {
  it.each(["2026-11", "2026-01", "2026-12"])("chấp nhận %s", (v) => {
    expect(isValidMonth(v)).toBe(true);
  });
  it.each(["2026-13", "2026-00", "2026-1", "26-11", "2026/11", "", undefined, 5])("từ chối %s", (v) => {
    expect(isValidMonth(v)).toBe(false);
  });
});

describe("previousMonth và nextMonth", () => {
  it("qua đầu năm", () => {
    expect(previousMonth("2026-01")).toBe("2025-12");
    expect(nextMonth("2025-12")).toBe("2026-01");
  });
  it("trong năm", () => {
    expect(previousMonth("2026-11")).toBe("2026-10");
    expect(nextMonth("2026-11")).toBe("2026-12");
  });
});

describe("currentMonth", () => {
  it("tính theo giờ Việt Nam, không theo UTC", () => {
    // 31/10 20:00 UTC = 01/11 03:00 giờ Việt Nam
    expect(currentMonth(new Date("2026-10-31T20:00:00Z"))).toBe("2026-11");
    expect(currentMonth(new Date("2026-10-31T10:00:00Z"))).toBe("2026-10");
  });
});
