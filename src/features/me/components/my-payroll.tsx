import { StaffMonthDetailView, type StaffMonthDetail } from "@/features/payroll";

type MyPayrollProps = { detail: StaffMonthDetail | null };

export function MyPayroll({ detail }: MyPayrollProps) {
  if (!detail) {
    return (
      <div className="card text-sm text-stone-600">
        Tài khoản này không có bảng lương. Bảng lương chỉ dành cho nhân viên.
      </div>
    );
  }
  return <StaffMonthDetailView detail={detail} />;
}
