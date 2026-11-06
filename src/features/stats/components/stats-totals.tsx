import { formatVnd } from "@/shared/utils/money";
import type { MonthStats } from "../types";

type StatsTotalsProps = { totals: MonthStats["totals"] };

export function StatsTotals({ totals }: StatsTotalsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="card p-4">
        <p className="text-sm text-stone-500">Ngày nghỉ</p>
        <p className="text-xl font-bold text-stone-900">{totals.offDays}</p>
      </div>
      <div className="card p-4">
        <p className="text-sm text-stone-500">Số lần phạt</p>
        <p className="text-xl font-bold text-stone-900">{totals.penaltyCount}</p>
      </div>
      <div className="card p-4">
        <p className="text-sm text-stone-500">Tiền phạt</p>
        <p className="text-xl font-bold text-red-700">{formatVnd(totals.penaltyAmount)}</p>
      </div>
    </div>
  );
}
