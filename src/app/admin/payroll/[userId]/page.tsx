import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/auth";
import { StaffMonthDetailView, getStaffMonthDetail } from "@/features/payroll";
import { autoEnsureMonthRates } from "@/features/rates";
import { MonthPicker } from "@/shared/components/month-picker";
import { currentMonth, isValidMonth } from "@/shared/utils/month";

export default async function AdminPayrollDetailPage({
  params,
  searchParams,
}: PageProps<"/admin/payroll/[userId]">) {
  await requireOwner();
  const { userId: userIdParam } = await params;
  const { month: monthParam } = await searchParams;

  const userId = Number(userIdParam);
  if (!Number.isInteger(userId) || userId <= 0) notFound();
  const month = isValidMonth(monthParam) ? monthParam : currentMonth();

  await autoEnsureMonthRates(month);
  const detail = await getStaffMonthDetail(userId, month);
  if (!detail) notFound();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-5 p-4 sm:p-6">
      <Link href={`/admin/payroll?month=${month}`} className="text-sm text-stone-600 underline">
        ← Bảng lương
      </Link>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title">{detail.summary.fullName}</h1>
          <p className="text-sm text-stone-500">{detail.summary.username}</p>
        </div>
        <MonthPicker basePath={`/admin/payroll/${userId}`} month={month} />
      </div>
      <StaffMonthDetailView detail={detail} />
    </main>
  );
}
