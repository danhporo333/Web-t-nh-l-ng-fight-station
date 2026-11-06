"use client";

import { useActionState } from "react";
import { FormMessage } from "@/shared/components/form-message";
import { deleteAdjustment } from "../actions";

type DeleteAdjustmentFormProps = { id: number };

export function DeleteAdjustmentForm({ id }: DeleteAdjustmentFormProps) {
  const [state, action, pending] = useActionState(deleteAdjustment, undefined);

  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm("Xóa khoản này?")) e.preventDefault();
      }}
      className="flex flex-col gap-2"
    >
      <input type="hidden" name="id" value={id} />
      {state && !state.success && <FormMessage state={state} successText="" />}
      <button type="submit" disabled={pending} className="btn-danger">
        {pending ? "Đang xóa..." : "Xóa khoản này"}
      </button>
    </form>
  );
}
