import { describe, expect, it } from "vitest";
import { dateToDb, formatDateLabel, isValidDate, monthOfDate, shiftDate, todayVN } from "./date";

describe("isValidDate", () => {
  it("chấp nhận ngày thật, kể cả 29/02 năm nhuận", () => {
    expect(isValidDate("2026-11-05")).toBe(true);
    expect(isValidDate("2028-02-29")).toBe(true);
  });
  it.each(["2026-02-30", "2027-02-29", "2026-13-01", "2026-11-5", "05/11/2026", "", undefined])(
    "từ chối %s",
    (v) => expect(isValidDate(v)).toBe(false),
  );
});

describe("todayVN", () => {
  it("tính theo giờ Việt Nam", () => {
    expect(todayVN(new Date("2026-10-31T20:00:00Z"))).toBe("2026-11-01");
    expect(todayVN(new Date("2026-10-31T10:00:00Z"))).toBe("2026-10-31");
  });
});

describe("shiftDate", () => {
  it("qua cuối tháng và cuối năm", () => {
    expect(shiftDate("2026-10-31", 1)).toBe("2026-11-01");
    expect(shiftDate("2026-01-01", -1)).toBe("2025-12-31");
  });
});

describe("dateToDb và monthOfDate", () => {
  it("giữ đúng ngày, không lệch múi giờ", () => {
    expect(dateToDb("2026-11-05").toISOString()).toBe("2026-11-05T00:00:00.000Z");
    expect(monthOfDate("2026-11-05")).toBe("2026-11");
  });
});

describe("formatDateLabel", () => {
  it("có thứ trong tuần", () => {
    expect(formatDateLabel("2026-11-05")).toBe("Thứ năm, 05/11/2026");
  });
});
