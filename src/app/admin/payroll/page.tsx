import Link from "next/link";
import { requireOwner } from "@/lib/auth";
import { PayrollList, PayrollTotalsCard, getMonthlyPayroll } from "@/features/payroll";
import { autoEnsureMonthRates } from "@/features/rates";
import { MonthPicker } from "@/shared/components/month-picker";
import { currentMonth, formatMonthLabel, isValidMonth } from "@/shared/utils/month";

export default async function AdminPayrollPage({ searchParams }: PageProps<"/admin/payroll">) {
  await requireOwner();
  const { month: monthParam } = await searchParams;
  const month = isValidMonth(monthParam) ? monthParam : currentMonth();
  await autoEnsureMonthRates(month);
  const payroll = await getMonthlyPayroll(month);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-5 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="page-title">Bảng lương</h1>
        <MonthPicker basePath="/admin/payroll" month={month} />
      </div>

      {payroll.missingRateCount > 0 && (
        <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {payroll.missingRateCount} nhân viên có chấm công nhưng chưa có mức lương của {formatMonthLabel(month).toLowerCase()}.{" "}
          <Link href={`/admin/rates?month=${month}`} className="font-semibold underline">
            Tạo mức lương
          </Link>
        </div>
      )}

      <PayrollTotalsCard totals={payroll.totals} />
      <PayrollList month={month} rows={payroll.rows} />
    </main>
  );
}
