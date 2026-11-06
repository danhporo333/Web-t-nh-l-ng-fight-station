import Link from "next/link";
import { formatDateLabel } from "@/shared/utils/date";
import { formatVnd } from "@/shared/utils/money";
import type { StaffStat } from "../types";
import { UNCATEGORIZED_LABEL } from "./category-table";

type StaffStatCardProps = { stat: StaffStat; month: string };

export function StaffStatCard({ stat, month }: StaffStatCardProps) {
  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-semibold text-stone-900">{stat.fullName}</p>
          <p className="truncate text-sm text-stone-500">{stat.username}</p>
        </div>
        {!stat.isActive && (
          <span className="shrink-0 rounded-full bg-stone-200 px-2.5 py-1 text-xs font-medium text-stone-700">
            Đã nghỉ việc
          </span>
        )}
      </div>

      <dl className="grid grid-cols-3 gap-3 text-sm">
        <div>
          <dt className="text-stone-500">Ngày nghỉ</dt>
          <dd className="font-semibold">{stat.offDates.length}</dd>
        </div>
        <div>
          <dt className="text-stone-500">Số lần phạt</dt>
          <dd className="font-semibold">{stat.penaltyCount}</dd>
        </div>
        <div>
          <dt className="text-stone-500">Tiền phạt</dt>
          <dd className="font-semibold text-red-700">{formatVnd(stat.penaltyAmount)}</dd>
        </div>
      </dl>

      {stat.offDates.length > 0 && (
        <div className="flex flex-col gap-1 border-t border-stone-100 pt-3 text-sm">
          <p className="text-stone-500">Các ngày nghỉ</p>
          <ul className="flex flex-col gap-0.5">
            {stat.offDates.map((date) => (
              <li key={date} className="text-stone-800">
                {formatDateLabel(date)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {stat.byCategory.length > 0 && (
        <ul className="flex flex-col gap-1 border-t border-stone-100 pt-3 text-sm">
          {stat.byCategory.map((c) => (
            <li key={c.category ?? ""} className="flex justify-between gap-3">
              <span className="min-w-0 truncate text-stone-700">
                {c.category ?? UNCATEGORIZED_LABEL} <span className="text-stone-400">× {c.count}</span>
              </span>
              <span className="shrink-0 text-red-700">{formatVnd(c.amount)}</span>
            </li>
          ))}
        </ul>
      )}

      {stat.penaltyCount > 0 && (
        <Link
          href={`/admin/adjustments?month=${month}&userId=${stat.userId}`}
          className="text-sm font-medium text-red-700 underline"
        >
          Xem các khoản phạt
        </Link>
      )}
    </div>
  );
}
