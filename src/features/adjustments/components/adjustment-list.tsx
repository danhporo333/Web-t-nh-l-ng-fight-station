import type { AdjustmentItem } from "../types";
import { AdjustmentCard } from "./adjustment-card";

type AdjustmentListProps = { items: AdjustmentItem[] };

export function AdjustmentList({ items }: AdjustmentListProps) {
  if (items.length === 0) {
    return <div className="card text-center text-sm text-stone-500">Chưa có khoản thưởng phạt nào trong tháng này.</div>;
  }
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.id}>
          <AdjustmentCard item={item} />
        </li>
      ))}
    </ul>
  );
}
