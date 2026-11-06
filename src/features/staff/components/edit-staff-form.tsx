"use client";

import { useActionState } from "react";
import { updateStaff } from "../actions";
import type { StaffItem } from "../types";
import { FormMessage } from "./form-message";

type EditStaffFormProps = { staff: StaffItem };

export function EditStaffForm({ staff }: EditStaffFormProps) {
  const [state, action, pending] = useActionState(updateStaff, undefined);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="id" value={staff.id} />
      <label className="field-label">
        Họ tên
        <input name="fullName" required maxLength={100} defaultValue={staff.fullName} className="input" />
      </label>
      <label className="field-label">
        Lương mặc định mọi ca (đ/giờ)
        <input
          name="defaultRate"
          inputMode="numeric"
          defaultValue={staff.defaultRate ?? ""}
          className="input"
        />
      </label>
      <p className="text-xs text-stone-500">
        Đổi lương mặc định không làm đổi các tháng đã có mức lương.
      </p>
      <FormMessage state={state} successText="Đã lưu." />
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Đang lưu..." : "Lưu thay đổi"}
      </button>
    </form>
  );
}
