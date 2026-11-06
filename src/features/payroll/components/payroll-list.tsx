import Link from "next/link";
import type { PayrollRow } from "../types";
import { PayrollFigures } from "./payroll-figures";

type PayrollListProps = { month: string; rows: PayrollRow[] };

export function PayrollList({ month, rows }: PayrollListProps) {
  if (rows.length === 0) {
    return <div className="card text-center text-sm text-stone-500">Chưa có nhân viên nào.</div>;
  }
  return (
    <ul className="flex flex-col gap-3">
      {rows.map((row) => (
        <li key={row.userId}>
          <Link
            href={`/admin/payroll/${row.userId}?month=${month}`}
            className="card block transition hover:border-red-300 hover:shadow-md"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-semibold text-stone-900">{row.fullName}</p>
                <p className="truncate text-sm text-stone-500">{row.username}</p>
              </div>
              {!row.isActive && (
                <span className="shrink-0 rounded-full bg-stone-200 px-2.5 py-1 text-xs font-medium text-stone-700">
                  Đã nghỉ
                </span>
              )}
            </div>
            {row.missingRate && (
              <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                Có chấm công nhưng chưa có mức lương của tháng này.
              </p>
            )}
            <PayrollFigures row={row} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
