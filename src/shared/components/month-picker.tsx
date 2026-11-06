import Link from "next/link";
import { formatMonthLabel, nextMonth, previousMonth } from "@/shared/utils/month";

type MonthPickerProps = {
  basePath: string;
  month: string;
};

export function MonthPicker({ basePath, month }: MonthPickerProps) {
  const linkClass =
    "flex size-11 items-center justify-center rounded-lg border border-stone-300 bg-white text-stone-700 hover:bg-stone-50";

  return (
    <div className="flex items-center gap-2">
      <Link href={`${basePath}?month=${previousMonth(month)}`} className={linkClass} aria-label="Tháng trước">
        ‹
      </Link>
      <span className="min-w-36 text-center font-semibold text-stone-900">{formatMonthLabel(month)}</span>
      <Link href={`${basePath}?month=${nextMonth(month)}`} className={linkClass} aria-label="Tháng sau">
        ›
      </Link>
    </div>
  );
}
