import { requireOwner } from "@/lib/auth";
import { CategoryTable, StaffStatCard, StatsTotals, getMonthStats } from "@/features/stats";
import { MonthPicker } from "@/shared/components/month-picker";
import { currentMonth, isValidMonth } from "@/shared/utils/month";

export default async function AdminStatsPage({ searchParams }: PageProps<"/admin/stats">) {
  await requireOwner();
  const { month: monthParam } = await searchParams;
  const month = isValidMonth(monthParam) ? monthParam : currentMonth();
  const stats = await getMonthStats(month);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-5 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title">Thống kê</h1>
          <p className="mt-1 text-sm text-stone-600">Ngày nghỉ, lỗi và tiền phạt theo tháng.</p>
        </div>
        <MonthPicker basePath="/admin/stats" month={month} />
      </div>

      <StatsTotals totals={stats.totals} />
      <CategoryTable title="Theo loại lỗi" categories={stats.categories} />

      <section className="flex flex-col gap-3">
        <h2 className="font-semibold text-stone-900">Theo nhân viên</h2>
        {stats.rows.length === 0 ? (
          <div className="card text-center text-sm text-stone-500">Chưa có nhân viên nào.</div>
        ) : (
          stats.rows.map((row) => <StaffStatCard key={row.userId} stat={row} month={month} />)
        )}
      </section>
    </main>
  );
}
