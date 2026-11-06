import { requireUser } from "@/lib/auth";
import { MyPayroll, getMyPayroll } from "@/features/me";
import { MonthPicker } from "@/shared/components/month-picker";
import { currentMonth, isValidMonth } from "@/shared/utils/month";

export default async function MePage({ searchParams }: PageProps<"/me">) {
  // userId lấy từ phiên. Tham số trên URL chỉ có tháng, không có người dùng.
  const user = await requireUser();
  const { month: monthParam } = await searchParams;
  const month = isValidMonth(monthParam) ? monthParam : currentMonth();
  const detail = await getMyPayroll(user.id, month);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-5 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-title">Lương của tôi</h1>
          <p className="mt-1 text-stone-600">Xin chào {user.fullName}.</p>
        </div>
        <MonthPicker basePath="/me" month={month} />
      </div>
      <MyPayroll detail={detail} />
    </main>
  );
}
