"use client";

import { useCallback, useState } from "react";
import type { StaffOption } from "../types";
import { CreateAdjustmentForm } from "./create-adjustment-form";

type AddAdjustmentPanelProps = {
  staff: StaffOption[];
  defaultUserId?: number;
  defaultDate: string;
};

export function AddAdjustmentPanel({ staff, defaultUserId, defaultDate }: AddAdjustmentPanelProps) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn-primary sm:w-auto">
        + Thêm thưởng phạt
      </button>
    );
  }

  return (
    <section className="card">
      <CreateAdjustmentForm
        staff={staff}
        defaultUserId={defaultUserId}
        defaultDate={defaultDate}
        onDone={close}
        onCancel={close}
      />
    </section>
  );
}
