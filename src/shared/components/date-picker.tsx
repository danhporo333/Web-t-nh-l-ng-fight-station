import Link from "next/link";
import { formatDateLabel, shiftDate } from "@/shared/utils/date";

type DatePickerProps = {
  basePath: string;
  date: string;
};

export function DatePicker({ basePath, date }: DatePickerProps) {
  const linkClass =
    "flex size-11 shrink-0 items-center justify-center rounded-lg border border-stone-300 bg-white text-stone-700 hover:bg-stone-50";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Link href={`${basePath}?date=${shiftDate(date, -1)}`} className={linkClass} aria-label="Ngày trước">
          ‹
        </Link>
        <span className="flex-1 text-center font-semibold text-stone-900">{formatDateLabel(date)}</span>
        <Link href={`${basePath}?date=${shiftDate(date, 1)}`} className={linkClass} aria-label="Ngày sau">
          ›
        </Link>
      </div>
      <form action={basePath} method="get" className="flex gap-2">
        <input type="date" name="date" defaultValue={date} required className="input" />
        <button type="submit" className="btn-secondary w-auto shrink-0">
          Xem
        </button>
      </form>
    </div>
  );
}
