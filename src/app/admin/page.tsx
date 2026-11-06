import Link from "next/link";
import { requireOwner } from "@/lib/auth";

const SECTIONS = [
  { href: "/admin/staff", title: "Nhân viên", text: "Thêm nhân viên, đặt lại mật khẩu, cho nghỉ việc." },
  { href: "/admin/attendance", title: "Chấm công", text: "Chọn ngày, tích ca sáng, ca chiều hoặc Off cho từng người." },
  { href: "/admin/rates", title: "Mức lương", text: "Xem và sửa mức lương ca sáng, ca chiều của từng người theo tháng." },
  { href: "/admin/shifts", title: "Cài đặt ca", text: "Sửa giờ, số giờ và mức mặc định của hai ca." },
];

export default async function AdminPage() {
  const user = await requireOwner();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-5 p-4 sm:p-6">
      <div>
        <h1 className="page-title">Xin chào, {user.fullName}</h1>
        <p className="mt-1 text-stone-600">Chọn mục bạn muốn quản lý.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {SECTIONS.map((s) => (
          <Link key={s.href} href={s.href} className="card block transition hover:border-red-300 hover:shadow-md">
            <h2 className="font-semibold text-stone-900">{s.title}</h2>
            <p className="mt-1 text-sm text-stone-600">{s.text}</p>
          </Link>
        ))}
      </div>
      <p className="text-sm text-stone-500">Thưởng phạt và bảng lương sẽ có ở các bước sau.</p>
    </main>
  );
}
