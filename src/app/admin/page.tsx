import { requireOwner } from "@/lib/auth";

export default async function AdminPage() {
  const user = await requireOwner();

  return (
    <main className="mx-auto w-full max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Quản lý</h1>
      <p className="mt-2 text-zinc-600">
        Xin chào {user.fullName}. Các chức năng sẽ làm ở bước 3.
      </p>
    </main>
  );
}
