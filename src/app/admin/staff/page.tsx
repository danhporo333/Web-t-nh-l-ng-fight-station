import { requireOwner } from "@/lib/auth";
import { AddStaffPanel, StaffList, listStaff } from "@/features/staff";

export default async function AdminStaffPage() {
  await requireOwner();
  const staff = await listStaff("all");

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-5 p-4 sm:p-6">
      <h1 className="page-title">Nhân viên ({staff.length})</h1>
      <AddStaffPanel />
      <StaffList staff={staff} />
    </main>
  );
}
