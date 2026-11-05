import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "OWNER" ? "/admin" : "/me");

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold">Đăng nhập</h1>
      <p className="text-zinc-600">Form đăng nhập sẽ làm ở bước sau (feature auth).</p>
    </main>
  );
}
