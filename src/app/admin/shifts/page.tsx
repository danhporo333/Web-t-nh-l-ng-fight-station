import { requireOwner } from "@/lib/auth";
import { ShiftList, getShifts } from "@/features/shifts";

export default async function AdminShiftsPage() {
  await requireOwner();
  const shifts = await getShifts();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-5 p-4 sm:p-6">
      <div>
        <h1 className="page-title">Cài đặt ca</h1>
        <p className="mt-1 text-sm text-stone-600">
          Mức mặc định chỉ dùng khi tạo mức lương cho nhân viên chưa có. Đổi ở đây không làm đổi các tháng đã có mức lương.
        </p>
      </div>
      <ShiftList shifts={shifts} />
    </main>
  );
}
