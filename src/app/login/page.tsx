import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "@/features/auth";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "OWNER" ? "/admin" : "/me");

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center p-6">
      <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 text-zinc-900 shadow-sm">
        <h1 className="text-2xl font-semibold">Đăng nhập</h1>
        <LoginForm />
      </div>
    </main>
  );
}
