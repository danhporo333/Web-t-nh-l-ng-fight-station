"use client";

import { useActionState } from "react";
import { FormMessage } from "@/shared/components/form-message";
import { saveMonthlyRates } from "../actions";
import type { RateRow } from "../types";

type RatesFormProps = {
  month: string;
  rows: RateRow[];
};

export function RatesForm({ month, rows }: RatesFormProps) {
  const [state, action, pending] = useActionState(saveMonthlyRates, undefined);
  const editable = rows.filter((r) => r.morningRate !== null && r.afternoonRate !== null);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="month" value={month} />
      {rows.map((row) => (
        <div key={row.userId} className="card flex flex-col gap-3">
          <div>
            <p className="font-semibold text-stone-900">{row.fullName}</p>
            <p className="text-sm text-stone-500">{row.username}</p>
          </div>
          {row.morningRate === null || row.afternoonRate === null ? (
            <p className="text-sm text-amber-700">Chưa có mức lương của tháng này.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <input type="hidden" name="userId" value={row.userId} />
              <label className="field-label">
                Ca sáng (đ/giờ)
                <input
                  name={`morning-${row.userId}`}
                  required
                  inputMode="numeric"
                  defaultValue={row.morningRate}
                  className="input"
                />
              </label>
              <label className="field-label">
                Ca chiều (đ/giờ)
                <input
                  name={`afternoon-${row.userId}`}
                  required
                  inputMode="numeric"
                  defaultValue={row.afternoonRate}
                  className="input"
                />
              </label>
            </div>
          )}
        </div>
      ))}
      <FormMessage state={state} successText="Đã lưu mức lương." />
      {editable.length > 0 && (
        <button type="submit" disabled={pending} className="btn-primary sticky bottom-4 shadow-lg">
          {pending ? "Đang lưu..." : "Lưu mức lương"}
        </button>
      )}
    </form>
  );
}
