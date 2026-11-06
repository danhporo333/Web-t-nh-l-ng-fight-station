import { formatVnd } from "@/shared/utils/money";
import { formatHours } from "@/shared/utils/number";
import type { PayrollTotals } from "../types";

type PayrollTotalsProps = { totals: PayrollTotals };

export function PayrollTotalsCard({ totals }: PayrollTotalsProps) {
  return (
    <div className="card flex flex-col gap-3">
      <div>
        <p className="text-sm text-stone-500">Tổng thực lãnh cả tháng</p>
        <p className="text-3xl font-bold tracking-tight text-stone-900">{formatVnd(totals.netPay)}</p>
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-stone-500">Giờ ca sáng</dt>
          <dd className="font-medium">{formatHours(totals.morningHours)}</dd>
        </div>
        <div>
          <dt className="text-stone-500">Giờ ca chiều</dt>
          <dd className="font-medium">{formatHours(totals.afternoonHours)}</dd>
        </div>
        <div>
          <dt className="text-stone-500">Thưởng</dt>
          <dd className="font-medium text-green-700">{formatVnd(totals.bonus)}</dd>
        </div>
        <div>
          <dt className="text-stone-500">Phạt</dt>
          <dd className="font-medium text-red-700">{formatVnd(totals.penalty)}</dd>
        </div>
      </dl>
    </div>
  );
}
