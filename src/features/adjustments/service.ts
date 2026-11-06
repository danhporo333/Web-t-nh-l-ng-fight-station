import { fail, ok, type ActionResult } from "@/lib/result";
import {
  deleteAdjustmentById,
  findActiveStaff,
  findAdjustmentId,
  findAdjustmentsByMonth,
  findUserRole,
  findPenaltyCategories,
  insertAdjustment,
  sumPenaltiesByUserAndCategory,
  sumAdjustmentsByUserAndType,
  updateAdjustmentById,
} from "./queries";
import type { AdjustmentInput, AdjustmentItem, AdjustmentType, PenaltyBreakdown, StaffOption } from "./types";

type Row = Awaited<ReturnType<typeof findAdjustmentsByMonth>>[number];

function toItem(row: Row): AdjustmentItem {
  return {
    id: row.id,
    userId: row.userId,
    fullName: row.user.fullName,
    date: row.date.toISOString().slice(0, 10),
    type: row.type,
    amount: row.amount,
    reason: row.reason,
    category: row.category ?? null,
  };
}

// Loại lỗi chỉ có nghĩa với khoản phạt. Khoản thưởng luôn không có loại.
function withCategoryRule<T extends { type: AdjustmentType; category: string | null }>(input: T): T {
  return { ...input, category: input.type === "PENALTY" ? input.category : null };
}

const NOT_FOUND = () => fail("ADJ_003", "Không tìm thấy khoản thưởng phạt");

export async function listAdjustments(month: string, userId?: number): Promise<AdjustmentItem[]> {
  return (await findAdjustmentsByMonth(month, userId)).map(toItem);
}

export function getStaffOptions(): Promise<StaffOption[]> {
  return findActiveStaff();
}

export async function createAdjustmentFor(input: AdjustmentInput): Promise<ActionResult<AdjustmentItem>> {
  const user = await findUserRole(input.userId);
  if (!user || user.role !== "STAFF") return fail("STAFF_002", "Không tìm thấy nhân viên");
  return ok(toItem(await insertAdjustment(withCategoryRule(input))));
}

export async function updateAdjustmentFor(
  id: number,
  input: Omit<AdjustmentInput, "userId">,
): Promise<ActionResult<AdjustmentItem>> {
  if (!(await findAdjustmentId(id))) return NOT_FOUND();
  return ok(toItem(await updateAdjustmentById(id, withCategoryRule(input))));
}

export async function deleteAdjustmentFor(id: number): Promise<ActionResult<{ deleted: true }>> {
  if (!(await findAdjustmentId(id))) return NOT_FOUND();
  await deleteAdjustmentById(id);
  return ok({ deleted: true });
}

// Tổng thưởng, phạt và tiền ăn uống của từng nhân viên trong tháng (chỉ người có khoản). Dùng cho bảng lương.
export async function getAdjustmentTotals(
  month: string,
  userId?: number,
): Promise<{ userId: number; bonus: number; penalty: number; meal: number }[]> {
  const sums = await sumAdjustmentsByUserAndType(month, userId);
  const byUser = new Map<number, { userId: number; bonus: number; penalty: number; meal: number }>();
  for (const sum of sums) {
    const entry = byUser.get(sum.userId) ?? { userId: sum.userId, bonus: 0, penalty: 0, meal: 0 };
    const amount = sum._sum.amount ?? 0;
    if (sum.type === "BONUS") entry.bonus += amount;
    else if (sum.type === "PENALTY") entry.penalty += amount;
    else entry.meal += amount;
    byUser.set(sum.userId, entry);
  }
  return [...byUser.values()];
}

// Các loại lỗi đã dùng, để gợi ý khi nhập khoản phạt mới.
export async function getCategoryOptions(): Promise<string[]> {
  const rows = await findPenaltyCategories();
  return rows.flatMap((r) => (r.category ? [r.category] : []));
}

// Số lần và tiền phạt của từng nhân viên theo loại lỗi trong tháng. Dùng cho thống kê.
export async function getPenaltyBreakdown(month: string): Promise<PenaltyBreakdown[]> {
  const sums = await sumPenaltiesByUserAndCategory(month);
  return sums.map((s) => ({
    userId: s.userId,
    category: s.category,
    count: s._count._all,
    amount: s._sum.amount ?? 0,
  }));
}
