import Link from "next/link";
import { requireOwner } from "@/lib/auth";

export default async function AdminPage() {
  const user = await requireOwner();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-5 p-4 sm:p-6">
      <div>
        <h1 className="page-title">Xin chào, {user.fullName}</h1>
        <p className="mt-1 text-stone-600">Chọn mục bạn muốn quản lý.</p>
      </div>
      <Link href="/admin/staff" className="card block transition hover:border-red-300 hover:shadow-md">
        <h2 className="font-semibold text-stone-900">Nhân viên</h2>
        <p className="mt-1 text-sm text-stone-600">
          Thêm nhân viên, đặt lại mật khẩu, cho nghỉ việc.
        </p>
      </Link>
      <p className="text-sm text-stone-500">
        Mức lương, chấm công, thưởng phạt và bảng lương sẽ có ở các bước sau.
      </p>
    </main>
  );
}
