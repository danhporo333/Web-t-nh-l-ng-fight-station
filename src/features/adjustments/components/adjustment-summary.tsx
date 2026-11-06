import { formatVnd } from "@/shared/utils/money";
import { summarizeAdjustments } from "../utils";
import type { AdjustmentItem } from "../types";

type AdjustmentSummaryProps = { items: AdjustmentItem[] };

export function AdjustmentSummary({ items }: AdjustmentSummaryProps) {
  const { bonus, penalty, meal } = summarizeAdjustments(items);

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="card p-4">
        <p className="text-sm text-stone-500">Tổng thưởng</p>
        <p className="text-lg font-bold text-green-700">{formatVnd(bonus)}</p>
      </div>
      <div className="card p-4">
        <p className="text-sm text-stone-500">Tổng phạt</p>
        <p className="text-lg font-bold text-red-700">{formatVnd(penalty)}</p>
      </div>
      <div className="card p-4">
        <p className="text-sm text-stone-500">Tổng ăn uống</p>
        <p className="text-lg font-bold text-amber-700">{formatVnd(meal)}</p>
      </div>
    </div>
  );
}
