import { requireOwner } from "@/lib/auth";
import { EnsureRatesForm, RatesForm, getMonthlyRates } from "@/features/rates";
import { MonthPicker } from "@/shared/components/month-picker";
import { currentMonth, formatMonthLabel, isValidMonth, previousMonth } from "@/shared/utils/month";

export default async function AdminRatesPage({ searchParams }: PageProps<"/admin/rates">) {
  await requireOwner();
  const { month: monthParam } = await searchParams;
  const month = isValidMonth(monthParam) ? monthParam : currentMonth();
  const rows = await getMonthlyRates(month);

  const missing = rows.filter((r) => r.morningRate === null).length;
  const noStaff = rows.length === 0;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-5 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="page-title">Mức lương</h1>
        <MonthPicker basePath="/admin/rates" month={month} />
      </div>

      {noStaff ? (
        <div className="card text-center text-sm text-stone-500">
          Chưa có nhân viên đang làm. Hãy thêm nhân viên ở mục Nhân viên.
        </div>
      ) : (
        <>
          {missing > 0 && (
            <EnsureRatesForm
              month={month}
              message={
                missing === rows.length
                  ? `${formatMonthLabel(month)} chưa có mức lương. Hệ thống sẽ chép từ ${formatMonthLabel(previousMonth(month)).toLowerCase()}, người chưa có thì dùng lương mặc định của nhân viên hoặc của ca.`
                  : `${missing} nhân viên chưa có mức lương của tháng này.`
              }
              buttonText={missing === rows.length ? "Tạo mức lương tháng này" : "Tạo mức còn thiếu"}
            />
          )}
          <RatesForm key={month} month={month} rows={rows} />
        </>
      )}
    </main>
  );
}
