import Link from "next/link";
import { formatMonthLabel, nextMonth, previousMonth } from "@/shared/utils/month";

type MonthPickerProps = {
  basePath: string;
  month: string;
  // Tham số giữ nguyên khi đổi tháng, ví dụ { userId: "3" }
  query?: Record<string, string>;
};

function hrefFor(basePath: string, month: string, query: Record<string, string>) {
  return `${basePath}?${new URLSearchParams({ ...query, month }).toString()}`;
}

export function MonthPicker({ basePath, month, query = {} }: MonthPickerProps) {
  const linkClass =
    "flex size-11 items-center justify-center rounded-lg border border-stone-300 bg-white text-stone-700 hover:bg-stone-50";

  return (
    <div className="flex items-center gap-2">
      <Link href={hrefFor(basePath, previousMonth(month), query)} className={linkClass} aria-label="Tháng trước">
        ‹
      </Link>
      <span className="min-w-36 text-center font-semibold text-stone-900">{formatMonthLabel(month)}</span>
      <Link href={hrefFor(basePath, nextMonth(month), query)} className={linkClass} aria-label="Tháng sau">
        ›
      </Link>
    </div>
  );
}
