import { formatVnd } from "@/shared/utils/money";
import type { AdjustmentItem } from "../types";
import { DeleteAdjustmentForm } from "./delete-adjustment-form";
import { EditAdjustmentForm } from "./edit-adjustment-form";

type AdjustmentCardProps = { item: AdjustmentItem };

export function AdjustmentCard({ item }: AdjustmentCardProps) {
  const isBonus = item.type === "BONUS";
  const [year, month, day] = item.date.split("-");

  return (
    <details className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      <summary className="flex min-h-16 cursor-pointer list-none items-center gap-3 px-4 py-3 hover:bg-stone-50">
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-semibold text-stone-900">{item.fullName}</span>
          <span className="truncate text-sm text-stone-500">
            {`${day}/${month}/${year}`}
            {item.category && ` · [${item.category}]`} · {item.reason}
          </span>
        </span>
        <span className={isBonus ? "shrink-0 font-semibold text-green-700" : "shrink-0 font-semibold text-red-700"}>
          {isBonus ? "+" : "−"}
          {formatVnd(item.amount)}
        </span>
        <span className="text-stone-400 transition group-open:rotate-180" aria-hidden>
          ▾
        </span>
      </summary>
      <div className="flex flex-col gap-5 border-t border-stone-200 bg-stone-50/50 p-4">
        <EditAdjustmentForm item={item} />
        <hr className="border-stone-200" />
        <DeleteAdjustmentForm id={item.id} />
      </div>
    </details>
  );
}
