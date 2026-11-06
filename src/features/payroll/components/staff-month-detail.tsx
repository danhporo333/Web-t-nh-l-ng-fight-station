import { formatDateLabel } from "@/shared/utils/date";
import { formatVnd } from "@/shared/utils/money";
import { formatHours } from "@/shared/utils/number";
import type { StaffMonthDetail } from "../types";
import { PayrollFigures } from "./payroll-figures";

type StaffMonthDetailProps = { detail: StaffMonthDetail };

const SHIFT_LABEL = { MORNING: "Ca sáng", AFTERNOON: "Ca chiều" } as const;

export function StaffMonthDetailView({ detail }: StaffMonthDetailProps) {
  const { summary, days, adjustments } = detail;

  return (
    <div className="flex flex-col gap-5">
      {summary.missingRate && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Có chấm công nhưng chưa có mức lương của tháng này, nên chưa tính được tiền.
        </p>
      )}
      <section className="card">
        <PayrollFigures row={summary} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-semibold text-stone-900">Từng ngày</h2>
        {days.length === 0 ? (
          <div className="card text-sm text-stone-500">Chưa có chấm công trong tháng này.</div>
        ) : (
          <ul className="card divide-y divide-stone-100 p-0">
            {days.map((day) => (
              <li key={day.date} className="flex items-start justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-stone-900">{formatDateLabel(day.date)}</p>
                  {day.off && <p className="text-sm text-stone-500">Off</p>}
                  {day.entries.map((e) => (
                    <p key={e.shift} className="text-sm text-stone-600">
                      {SHIFT_LABEL[e.shift]}: {formatHours(e.hours)} giờ
                      {e.note && <span className="text-stone-400"> · {e.note}</span>}
                    </p>
                  ))}
                </div>
                <p className="shrink-0 text-sm font-semibold text-stone-900">
                  {day.off ? "0đ" : day.pay === null ? "—" : formatVnd(day.pay)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-semibold text-stone-900">Thưởng phạt</h2>
        {adjustments.length === 0 ? (
          <div className="card text-sm text-stone-500">Không có khoản thưởng phạt nào.</div>
        ) : (
          <ul className="card divide-y divide-stone-100 p-0">
            {adjustments.map((a) => (
              <li key={a.id} className="flex items-start justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-stone-900">{formatDateLabel(a.date)}</p>
                  <p className="text-sm text-stone-600">{a.reason}</p>
                </div>
                <p
                  className={
                    a.type === "BONUS"
                      ? "shrink-0 text-sm font-semibold text-green-700"
                      : "shrink-0 text-sm font-semibold text-red-700"
                  }
                >
                  {a.type === "BONUS" ? "+" : "−"}
                  {formatVnd(a.amount)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
