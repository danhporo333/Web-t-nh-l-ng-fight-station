import { requireOwner } from "@/lib/auth";
import { DayEntriesForm, getDayEntries } from "@/features/attendance";
import { autoEnsureMonthRates } from "@/features/rates";
import { DatePicker } from "@/shared/components/date-picker";
import { isValidDate, monthOfDate, todayVN } from "@/shared/utils/date";

export default async function AdminAttendancePage({ searchParams }: PageProps<"/admin/attendance">) {
  await requireOwner();
  const { date: dateParam } = await searchParams;
  const date = isValidDate(dateParam) ? dateParam : todayVN();
  await autoEnsureMonthRates(monthOfDate(date));
  const view = await getDayEntries(date);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-5 p-4 sm:p-6">
      <h1 className="page-title">Chấm công</h1>
      <DatePicker basePath="/admin/attendance" date={date} />
      {view.rows.length === 0 ? (
        <div className="card text-center text-sm text-stone-500">
          Chưa có nhân viên đang làm. Hãy thêm nhân viên ở mục Nhân viên.
        </div>
      ) : (
        <DayEntriesForm key={date} view={view} />
      )}
    </main>
  );
}
