import { Prisma } from "@prisma/client";
import { fail, ok, type ActionResult } from "@/lib/result";
import { currentMonth, previousMonth } from "@/shared/utils/month";
import {
  findActiveStaff,
  findRatesByMonth,
  findShiftDefaultRates,
  insertRates,
  updateRates,
} from "./queries";
import type { RatePair, RateRow } from "./types";
import { resolveInitialRates } from "./utils";

export async function getMonthlyRates(month: string): Promise<RateRow[]> {
  const [staff, rates] = await Promise.all([findActiveStaff(), findRatesByMonth(month)]);
  const byUser = new Map(rates.map((r) => [r.userId, r]));
  return staff.map((s) => {
    const rate = byUser.get(s.id);
    return {
      userId: s.id,
      fullName: s.fullName,
      username: s.username,
      morningRate: rate?.morningRate ?? null,
      afternoonRate: rate?.afternoonRate ?? null,
    };
  });
}

// Tạo dòng lương còn thiếu của tháng. Không ghi đè dòng đã có, chạy lại cho cùng kết quả.
export async function ensureMonthRatesFor(month: string): Promise<ActionResult<{ created: number }>> {
  const [staff, existing, previous, shiftRates] = await Promise.all([
    findActiveStaff(),
    findRatesByMonth(month),
    findRatesByMonth(previousMonth(month)),
    findShiftDefaultRates(),
  ]);
  if (shiftRates.morning === undefined || shiftRates.afternoon === undefined) {
    return fail("COMMON_003", "Thiếu cấu hình ca, hãy chạy seed");
  }
  const shiftDefaults: RatePair = { morningRate: shiftRates.morning, afternoonRate: shiftRates.afternoon };

  const hasRate = new Set(existing.map((r) => r.userId));
  const previousByUser = new Map(previous.map((r) => [r.userId, r]));

  const rows = staff
    .filter((s) => !hasRate.has(s.id))
    .map((s) => ({
      userId: s.id,
      month,
      ...resolveInitialRates({
        previous: previousByUser.get(s.id) ?? null,
        userDefaultRate: s.defaultRate,
        shiftDefaults,
      }),
    }));

  if (rows.length === 0) return ok({ created: 0 });
  const result = await insertRates(rows);
  return ok({ created: result.count });
}

export async function saveRatesFor(
  month: string,
  entries: { userId: number; morningRate: number; afternoonRate: number }[],
): Promise<ActionResult<{ saved: number }>> {
  const existing = await findRatesByMonth(month);
  const hasRate = new Set(existing.map((r) => r.userId));
  if (entries.some((e) => !hasRate.has(e.userId))) {
    return fail("RATE_002", "Chưa có mức lương của tháng này, cần tạo mức lương trước");
  }
  try {
    await updateRates(month, entries);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return fail("RATE_002", "Chưa có mức lương của tháng này, cần tạo mức lương trước");
    }
    throw e;
  }
  return ok({ saved: entries.length });
}

// Mức lương của mọi nhân viên có dòng trong tháng, kể cả người đã nghỉ việc. Dùng cho bảng lương.
export async function getRatesForMonth(month: string, userId?: number): Promise<(RatePair & { userId: number })[]> {
  const rows = await findRatesByMonth(month);
  return rows.filter((r) => userId === undefined || r.userId === userId);
}

// Tự tạo mức lương còn thiếu, chỉ cho tháng hiện tại (giờ Việt Nam). Các tháng khác (đã qua hoặc chưa tới)
// vẫn để chủ quán tự bấm tạo, tránh sinh mức lương lịch sử âm thầm. Lỗi cấu hình ca không làm hỏng trang.
export async function autoEnsureMonthRates(month: string, now: Date = new Date()): Promise<{ created: number }> {
  if (month !== currentMonth(now)) return { created: 0 };
  const result = await ensureMonthRatesFor(month);
  return { created: result.success ? result.data.created : 0 };
}
