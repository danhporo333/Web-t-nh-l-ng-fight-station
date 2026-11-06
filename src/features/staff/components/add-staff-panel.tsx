"use client";

import { useCallback, useState } from "react";
import { CreateStaffForm } from "./create-staff-form";

export function AddStaffPanel() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn-primary sm:w-auto">
        + Thêm nhân viên
      </button>
    );
  }

  return (
    <section className="card">
      <CreateStaffForm onDone={close} onCancel={close} />
    </section>
  );
}
