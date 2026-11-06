import type { CategoryStat, MonthStats, StaffStat } from "./types";

type Staff = { id: number; username: string; fullName: string; isActive: boolean };
type OffDays = { userId: number; dates: string[] };
type PenaltyRow = { userId: number; category: string | null; count: number; amount: number };

// Gộp các dòng cùng loại lỗi (không phân biệt hoa thường, bỏ khoảng trắng thừa), nhiều tiền nhất lên đầu.
function mergeCategories(rows: PenaltyRow[]): CategoryStat[] {
  const byKey = new Map<string, CategoryStat>();
  for (const r of rows) {
    const label = r.category?.trim() || null;
    const key = label === null ? "" : label.toLocaleLowerCase("vi");
    const entry = byKey.get(key) ?? { category: label, count: 0, amount: 0 };
    entry.count += r.count;
    entry.amount += r.amount;
    byKey.set(key, entry);
  }
  return [...byKey.values()].sort(
    (a, b) => b.amount - a.amount || (a.category ?? "").localeCompare(b.category ?? "", "vi"),
  );
}

export function buildMonthStats(
  month: string,
  staff: Staff[],
  offDays: OffDays[],
  penalties: PenaltyRow[],
): MonthStats {
  const offById = new Map(offDays.map((o) => [o.userId, o.dates]));

  const rows: StaffStat[] = staff.map((s) => {
    const mine = penalties.filter((p) => p.userId === s.id);
    const byCategory = mergeCategories(mine);
    return {
      userId: s.id,
      fullName: s.fullName,
      username: s.username,
      isActive: s.isActive,
      offDates: offById.get(s.id) ?? [],
      penaltyCount: byCategory.reduce((n, c) => n + c.count, 0),
      penaltyAmount: byCategory.reduce((n, c) => n + c.amount, 0),
      byCategory,
    };
  });

  // Tổng và bảng theo loại lỗi chỉ tính các nhân viên trong bảng, cho khớp với số từng người.
  const shown = new Set(staff.map((s) => s.id));
  return {
    month,
    rows,
    totals: {
      offDays: rows.reduce((n, r) => n + r.offDates.length, 0),
      penaltyCount: rows.reduce((n, r) => n + r.penaltyCount, 0),
      penaltyAmount: rows.reduce((n, r) => n + r.penaltyAmount, 0),
    },
    categories: mergeCategories(penalties.filter((p) => shown.has(p.userId))),
  };
}
