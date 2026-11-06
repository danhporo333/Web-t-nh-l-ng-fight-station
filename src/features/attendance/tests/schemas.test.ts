import { describe, expect, it } from "vitest";
import { saveDayEntriesSchema } from "../schemas";

const entry = (over: object = {}) => ({ userId: "3", off: false, morning: { hours: "8,5", note: " về sớm " }, ...over });

describe("saveDayEntriesSchema", () => {
  it("đọc giờ có dấu phẩy, cắt ghi chú, ghi chú trống thành undefined", () => {
    const r = saveDayEntriesSchema.parse({
      date: "2026-11-05",
      entries: [entry({ afternoon: { hours: "10", note: "" } })],
    });
    expect(r.entries[0].morning).toEqual({ hours: 8.5, note: "về sớm" });
    expect(r.entries[0].afternoon).toEqual({ hours: 10, note: undefined });
    expect(r.entries[0].userId).toBe(3);
  });
  it.each(["0", "-1", "24.5", "abc", "", "8.555"])("từ chối số giờ %s", (v) => {
    const r = saveDayEntriesSchema.safeParse({ date: "2026-11-05", entries: [entry({ morning: { hours: v, note: "" } })] });
    expect(r.success).toBe(false);
  });
  it("chấp nhận đúng 24 giờ", () => {
    expect(saveDayEntriesSchema.safeParse({ date: "2026-11-05", entries: [entry({ morning: { hours: "24", note: "" } })] }).success).toBe(true);
  });
  it("từ chối ngày không có thật", () => {
    expect(saveDayEntriesSchema.safeParse({ date: "2026-02-30", entries: [entry()] }).success).toBe(false);
  });
  it("từ chối danh sách rỗng", () => {
    expect(saveDayEntriesSchema.safeParse({ date: "2026-11-05", entries: [] }).success).toBe(false);
  });
});
