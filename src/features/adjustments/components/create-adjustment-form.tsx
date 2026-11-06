"use client";

import { useActionState, useEffect, useRef } from "react";
import { FormMessage } from "@/shared/components/form-message";
import { createAdjustment } from "../actions";
import type { StaffOption } from "../types";
import { AdjustmentFields } from "./adjustment-fields";

type CreateAdjustmentFormProps = {
  staff: StaffOption[];
  defaultUserId?: number;
  defaultDate: string;
  onDone: () => void;
  onCancel: () => void;
};

export function CreateAdjustmentForm({
  staff,
  defaultUserId,
  defaultDate,
  onDone,
  onCancel,
}: CreateAdjustmentFormProps) {
  const [state, action, pending] = useActionState(createAdjustment, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      onDone();
    }
  }, [state, onDone]);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-4">
      <h2 className="font-semibold text-stone-900">Thêm thưởng phạt</h2>
      <AdjustmentFields staff={staff} defaultUserId={defaultUserId} defaultDate={defaultDate} />
      <FormMessage state={state} successText="Đã thêm." />
      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Hủy
        </button>
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Đang lưu..." : "Thêm"}
        </button>
      </div>
    </form>
  );
}
