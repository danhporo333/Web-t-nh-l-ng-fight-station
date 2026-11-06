import Link from "next/link";
import { requireOwner } from "@/lib/auth";
import { LogoutButton } from "@/features/auth";

export default async function AdminPage() {
  const user = await requireOwner();

  return (
    <main className="mx-auto w-full max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Quản lý</h1>
      <p className="mt-2 text-zinc-600">
        Xin chào {user.fullName}. Các chức năng sẽ làm ở bước 3.
      </p>
      <div className="mt-4 flex items-center gap-4">
        <Link href="/change-password" className="text-sm underline">
          Đổi mật khẩu
        </Link>
        <LogoutButton />
      </div>
    </main>
  );
}
