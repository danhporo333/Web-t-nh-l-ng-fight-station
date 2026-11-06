import { describe, expect, it } from "vitest";
import { buildMonthStats } from "../utils";

const hoang = { id: 3, username: "hoang", fullName: "Hoàng", isActive: true };
const lan = { id: 4, username: "lan", fullName: "Lan", isActive: true };
const minh = { id: 5, username: "minh", fullName: "Minh", isActive: false };

describe("buildMonthStats", () => {
  it("đếm ngày nghỉ, số lần và tiền phạt của từng người", () => {
    const s = buildMonthStats(
      "2026-11",
      [hoang, lan],
      [{ userId: 3, dates: ["2026-11-04", "2026-11-12"] }],
      [
        { userId: 3, category: "đi trễ", count: 2, amount: 40000 },
        { userId: 3, category: null, count: 1, amount: 10000 },
      ],
    );
    expect(s.rows[0]).toMatchObject({
      userId: 3,
      offDates: ["2026-11-04", "2026-11-12"],
      penaltyCount: 3,
      penaltyAmount: 50000,
    });
    expect(s.rows[1]).toMatchObject({ userId: 4, offDates: [], penaltyCount: 0, penaltyAmount: 0, byCategory: [] });
    expect(s.totals).toEqual({ offDays: 2, penaltyCount: 3, penaltyAmount: 50000 });
  });

  it("gộp loại lỗi khác hoa thường và khoảng trắng, xếp nhiều tiền nhất lên đầu", () => {
    const s = buildMonthStats(
      "2026-11",
      [hoang, lan],
      [],
      [
        { userId: 3, category: "Đi trễ", count: 1, amount: 20000 },
        { userId: 4, category: " đi trễ ", count: 2, amount: 30000 },
        { userId: 4, category: "nghỉ không phép", count: 1, amount: 100000 },
      ],
    );
    expect(s.categories).toEqual([
      { category: "nghỉ không phép", count: 1, amount: 100000 },
      { category: "Đi trễ", count: 3, amount: 50000 },
    ]);
  });

  it("khoản phạt không có loại gom vào category null", () => {
    const s = buildMonthStats("2026-11", [hoang], [], [{ userId: 3, category: null, count: 2, amount: 20000 }]);
    expect(s.categories).toEqual([{ category: null, count: 2, amount: 20000 }]);
    expect(s.rows[0].byCategory).toEqual([{ category: null, count: 2, amount: 20000 }]);
  });

  it("người đã nghỉ việc có dữ liệu vẫn được tính", () => {
    const s = buildMonthStats(
      "2026-11",
      [minh],
      [{ userId: 5, dates: ["2026-11-01"] }],
      [{ userId: 5, category: "đi trễ", count: 1, amount: 15000 }],
    );
    expect(s.rows[0]).toMatchObject({ isActive: false, penaltyAmount: 15000 });
    expect(s.totals.offDays).toBe(1);
  });

  it("bỏ qua dữ liệu của người không có trong danh sách khi tính tổng theo loại lỗi", () => {
    const s = buildMonthStats("2026-11", [hoang], [], [
      { userId: 3, category: "đi trễ", count: 1, amount: 10000 },
      { userId: 99, category: "đi trễ", count: 5, amount: 500000 },
    ]);
    expect(s.categories).toEqual([{ category: "đi trễ", count: 1, amount: 10000 }]);
    expect(s.totals.penaltyAmount).toBe(10000);
  });

  it("không có dữ liệu thì mọi số là 0", () => {
    const s = buildMonthStats("2026-11", [], [], []);
    expect(s.rows).toEqual([]);
    expect(s.totals).toEqual({ offDays: 0, penaltyCount: 0, penaltyAmount: 0 });
    expect(s.categories).toEqual([]);
  });
});
