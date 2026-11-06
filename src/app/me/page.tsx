import { requireUser } from "@/lib/auth";

export default async function MePage() {
  const user = await requireUser();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-5 p-4 sm:p-6">
      <div>
        <h1 className="page-title">Lương của tôi</h1>
        <p className="mt-1 text-stone-600">Xin chào {user.fullName}.</p>
      </div>
      <div className="card text-sm text-stone-600">Bảng lương sẽ có ở bước sau.</div>
    </main>
  );
}
