import { getPenaltyBreakdown } from "@/features/adjustments";
import { getMonthOffDays } from "@/features/attendance";
import { findStaffForStats } from "./queries";
import type { MonthStats } from "./types";
import { buildMonthStats } from "./utils";

// Không kiểm quyền ở đây: trang của chủ quán gọi requireOwner().
export async function getMonthStats(month: string): Promise<MonthStats> {
  const [offDays, penalties] = await Promise.all([getMonthOffDays(month), getPenaltyBreakdown(month)]);
  const withData = [...offDays.map((o) => o.userId), ...penalties.map((p) => p.userId)];
  const staff = await findStaffForStats(withData);
  return buildMonthStats(month, staff, offDays, penalties);
}
