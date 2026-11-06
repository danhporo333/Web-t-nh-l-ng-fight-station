import { formatVnd } from "@/shared/utils/money";
import { formatHours } from "@/shared/utils/number";
import type { PayrollRow } from "../types";

type PayrollFiguresProps = { row: PayrollRow };

// Các con số của một nhân viên trong tháng, dùng ở bảng lương và trang chi tiết.
export function PayrollFigures({ row }: PayrollFiguresProps) {
  return (
    <div className="flex flex-col gap-3">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div>
          <dt className="text-stone-500">Ca sáng</dt>
          <dd className="font-medium">
            {formatHours(row.morningHours)} giờ
            {row.morningRate !== null && (
              <span className="font-normal text-stone-500"> × {formatVnd(row.morningRate)}</span>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-stone-500">Ca chiều</dt>
          <dd className="font-medium">
            {formatHours(row.afternoonHours)} giờ
            {row.afternoonRate !== null && (
              <span className="font-normal text-stone-500"> × {formatVnd(row.afternoonRate)}</span>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-stone-500">Lương ca</dt>
          <dd className="font-medium">{row.shiftPay === null ? "—" : formatVnd(row.shiftPay)}</dd>
        </div>
        <div>
          <dt className="text-stone-500">Thưởng / Phạt</dt>
          <dd className="font-medium">
            <span className="text-green-700">+{formatVnd(row.bonus)}</span>{" "}
            <span className="text-red-700">−{formatVnd(row.penalty)}</span>
          </dd>
        </div>
      </dl>
      <div className="flex items-baseline justify-between border-t border-stone-200 pt-3">
        <span className="text-sm font-medium text-stone-700">Thực lãnh</span>
        <span className="text-xl font-bold text-stone-900">
          {row.netPay === null ? "Chưa tính được" : formatVnd(row.netPay)}
        </span>
      </div>
    </div>
  );
}
