"use client";

import { useActionState } from "react";
import { setStaffActive } from "../actions";
import { FormMessage } from "@/shared/components/form-message";

type SetActiveFormProps = { staffId: number; isActive: boolean };

export function SetActiveForm({ staffId, isActive }: SetActiveFormProps) {
  const [state, action, pending] = useActionState(setStaffActive, undefined);

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="id" value={staffId} />
      <input type="hidden" name="isActive" value={isActive ? "false" : "true"} />
      {state && !state.success && <FormMessage state={state} successText="" />}
      <button type="submit" disabled={pending} className={isActive ? "btn-danger" : "btn-success"}>
        {pending ? "Đang lưu..." : isActive ? "Cho nghỉ việc" : "Kích hoạt lại"}
      </button>
    </form>
  );
}
