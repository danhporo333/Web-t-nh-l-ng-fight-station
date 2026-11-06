import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { ChangePasswordForm } from "@/features/auth";

export default async function ChangePasswordPage() {
  const user = await requireUser();
  const backHref = user.role === "OWNER" ? "/admin" : "/me";

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold">Đổi mật khẩu</h1>
      <ChangePasswordForm />
      <Link href={backHref} className="text-sm text-zinc-600 underline">
        Quay lại
      </Link>
    </main>
  );
}
