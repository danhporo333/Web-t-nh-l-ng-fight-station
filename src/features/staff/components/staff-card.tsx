import type { StaffItem } from "../types";
import { EditStaffForm } from "./edit-staff-form";
import { ResetPasswordForm } from "./reset-password-form";
import { SetActiveForm } from "./set-active-form";

type StaffCardProps = { staff: StaffItem };

export function StaffCard({ staff }: StaffCardProps) {
  return (
    <details className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      <summary className="flex min-h-16 cursor-pointer list-none items-center gap-3 px-4 py-3 hover:bg-stone-50">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-stone-100 font-semibold text-stone-700">
          {staff.fullName.charAt(0).toUpperCase()}
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-semibold text-stone-900">{staff.fullName}</span>
          <span className="truncate text-sm text-stone-500">
            {staff.username}
            {staff.defaultRate !== null && ` · ${staff.defaultRate.toLocaleString("vi-VN")}đ/giờ`}
          </span>
        </span>
        <span
          className={
            staff.isActive
              ? "shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800"
              : "shrink-0 rounded-full bg-stone-200 px-2.5 py-1 text-xs font-medium text-stone-700"
          }
        >
          {staff.isActive ? "Đang làm" : "Đã nghỉ"}
        </span>
        <span className="text-stone-400 transition group-open:rotate-180" aria-hidden>
          ▾
        </span>
      </summary>
      <div className="flex flex-col gap-6 border-t border-stone-200 bg-stone-50/50 p-4">
        <EditStaffForm staff={staff} />
        <hr className="border-stone-200" />
        <ResetPasswordForm staffId={staff.id} />
        <hr className="border-stone-200" />
        <SetActiveForm staffId={staff.id} isActive={staff.isActive} />
      </div>
    </details>
  );
}
