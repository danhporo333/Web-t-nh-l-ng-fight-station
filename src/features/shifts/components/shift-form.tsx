"use client";

import { useActionState } from "react";
import { FormMessage } from "@/shared/components/form-message";
import { updateShift } from "../actions";
import type { ShiftItem } from "../types";

type ShiftFormProps = { shift: ShiftItem };

export function ShiftForm({ shift }: ShiftFormProps) {
  const [state, action, pending] = useActionState(updateShift, undefined);

  return (
    <form action={action} className="card flex flex-col gap-4">
      <input type="hidden" name="id" value={shift.id} />
      <h2 className="font-semibold text-stone-900">{shift.name}</h2>
      <div className="grid grid-cols-2 gap-4">
        <label className="field-label">
          Giờ bắt đầu
          <input name="startTime" required defaultValue={shift.startTime} placeholder="07:30" className="input" />
        </label>
        <label className="field-label">
          Giờ kết thúc
          <input name="endTime" required defaultValue={shift.endTime} placeholder="16:00" className="input" />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <label className="field-label">
          Số giờ mặc định
          <input
            name="defaultHours"
            required
            inputMode="decimal"
            defaultValue={String(shift.defaultHours)}
            className="input"
          />
        </label>
        <label className="field-label">
          Mức mặc định (đ/giờ)
          <input
            name="defaultRate"
            required
            inputMode="numeric"
            defaultValue={shift.defaultRate}
            className="input"
          />
        </label>
      </div>
      {shift.code === "AFTERNOON" && (
        <p className="text-xs text-stone-500">
          Ca chiều kết thúc lúc 02:00 ngày hôm sau vẫn tính vào ngày bắt đầu ca. Giờ kết thúc chỉ để hiển thị.
        </p>
      )}
      <FormMessage state={state} successText="Đã lưu." />
      <button type="submit" disabled={pending} className="btn-primary">
        {pending ? "Đang lưu..." : "Lưu"}
      </button>
    </form>
  );
}
