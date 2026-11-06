import { requireOwner } from "@/lib/auth";
import {
  AddAdjustmentPanel,
  AdjustmentList,
  AdjustmentSummary,
  CategoryDatalist,
  getCategoryOptions,
  getStaffOptions,
  listAdjustments,
} from "@/features/adjustments";
import { MonthPicker } from "@/shared/components/month-picker";
import { monthOfDate, todayVN } from "@/shared/utils/date";
import { currentMonth, isValidMonth } from "@/shared/utils/month";

export default async function AdminAdjustmentsPage({ searchParams }: PageProps<"/admin/adjustments">) {
  await requireOwner();
  const { month: monthParam, userId: userIdParam } = await searchParams;
  const month = isValidMonth(monthParam) ? monthParam : currentMonth();

  const [staff, categories] = await Promise.all([getStaffOptions(), getCategoryOptions()]);
  const userIdNumber = typeof userIdParam === "string" ? Number(userIdParam) : NaN;
  const userId = staff.some((s) => s.id === userIdNumber) ? userIdNumber : undefined;
  const items = await listAdjustments(month, userId);

  const today = todayVN();
  const defaultDate = monthOfDate(today) === month ? today : `${month}-01`;
  const query: Record<string, string> = userId ? { userId: String(userId) } : {};

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-5 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="page-title">Thưởng, phạt, ăn uống</h1>
        <MonthPicker basePath="/admin/adjustments" month={month} query={query} />
      </div>

      <form action="/admin/adjustments" method="get" className="flex gap-2">
        <input type="hidden" name="month" value={month} />
        <select name="userId" defaultValue={userId ?? ""} className="input">
          <option value="">Tất cả nhân viên</option>
          {staff.map((s) => (
            <option key={s.id} value={s.id}>
              {s.fullName}
            </option>
          ))}
        </select>
        <button type="submit" className="btn-secondary w-auto shrink-0">
          Lọc
        </button>
      </form>

      <CategoryDatalist categories={categories} />
      <AddAdjustmentPanel staff={staff} defaultUserId={userId} defaultDate={defaultDate} />
      <AdjustmentSummary items={items} />
      <AdjustmentList items={items} />
    </main>
  );
}
