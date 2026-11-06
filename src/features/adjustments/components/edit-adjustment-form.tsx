"use client";

import { useActionState } from "react";
import { FormMessage } from "@/shared/components/form-message";
import { updateAdjustment } from "../actions";
import type { AdjustmentItem } from "../types";
import { AdjustmentFields } from "./adjustment-fields";

type EditAdjustmentFormProps = { item: AdjustmentItem };

export function EditAdjustmentForm({ item }: EditAdjustmentFormProps) {
  const [state, action, pending] = useActionState(updateAdjustment, undefined);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={item.id} />
      <AdjustmentFields defaultDate={item.date} initial={item} />
      <FormMessage state={state} successText="Đã lưu." />
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Đang lưu..." : "Lưu thay đổi"}
      </button>
    </form>
  );
}
