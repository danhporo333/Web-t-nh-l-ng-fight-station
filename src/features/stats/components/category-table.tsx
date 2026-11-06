import { formatVnd } from "@/shared/utils/money";
import type { CategoryStat } from "../types";

type CategoryTableProps = {
  categories: CategoryStat[];
  title: string;
};

export const UNCATEGORIZED_LABEL = "Chưa phân loại";

export function CategoryTable({ categories, title }: CategoryTableProps) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-semibold text-stone-900">{title}</h2>
      {categories.length === 0 ? (
        <div className="card text-sm text-stone-500">Không có khoản phạt nào.</div>
      ) : (
        <ul className="card divide-y divide-stone-100 p-0">
          {categories.map((c) => (
            <li key={c.category ?? ""} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-stone-900">{c.category ?? UNCATEGORIZED_LABEL}</p>
                <p className="text-sm text-stone-500">{c.count} lần</p>
              </div>
              <p className="shrink-0 text-sm font-semibold text-red-700">{formatVnd(c.amount)}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
