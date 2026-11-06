import type { StaffItem } from "../types";
import { StaffCard } from "./staff-card";

type StaffListProps = { staff: StaffItem[] };

export function StaffList({ staff }: StaffListProps) {
  if (staff.length === 0) {
    return <div className="card text-center text-sm text-stone-500">Chưa có nhân viên nào.</div>;
  }
  return (
    <ul className="flex flex-col gap-3">
      {staff.map((s) => (
        <li key={s.id}>
          <StaffCard staff={s} />
        </li>
      ))}
    </ul>
  );
}
