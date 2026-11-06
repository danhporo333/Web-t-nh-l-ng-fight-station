import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { LogoutButton } from "@/features/auth";

export default async function MePage() {
  const user = await requireUser();

  return (
    <main className="mx-auto w-full max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Lương của tôi</h1>
      <p className="mt-2 text-zinc-600">
        Xin chào {user.fullName}. Chức năng sẽ làm ở bước 4.
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
