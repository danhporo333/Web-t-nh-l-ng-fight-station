import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { ChangePasswordForm } from "@/features/auth";

export default async function ChangePasswordPage() {
  const user = await requireUser();
  const backHref = user.role === "OWNER" ? "/admin" : "/me";

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-4 p-4">
      <h1 className="page-title">Đổi mật khẩu</h1>
      <div className="card p-6">
        <ChangePasswordForm />
      </div>
      <Link href={backHref} className="text-center text-sm text-stone-600 underline">
        Quay lại
      </Link>
    </main>
  );
}
