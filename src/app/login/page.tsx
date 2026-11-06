import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "@/features/auth";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "OWNER" ? "/admin" : "/me");

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 p-4">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-red-600 text-xl font-bold text-white shadow-sm">
          FS
        </span>
        <div>
          <h1 className="page-title">Fight Station</h1>
          <p className="mt-1 text-sm text-stone-600">Đăng nhập để xem và quản lý lương</p>
        </div>
      </div>
      <div className="card p-6">
        <LoginForm />
      </div>
    </main>
  );
}
