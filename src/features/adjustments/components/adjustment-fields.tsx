"use client";

import { useState } from "react";
import type { AdjustmentItem, AdjustmentType, StaffOption } from "../types";
import { CATEGORY_LIST_ID } from "./category-datalist";

type AdjustmentFieldsProps = {
  // Có staff thì hiện ô chọn nhân viên (form thêm), không có thì là form sửa
  staff?: StaffOption[];
  defaultUserId?: number;
  defaultDate: string;
  initial?: Pick<AdjustmentItem, "type" | "amount" | "reason" | "category">;
};

const TYPES: { value: AdjustmentType; label: string }[] = [
  { value: "BONUS", label: "Thưởng" },
  { value: "PENALTY", label: "Phạt" },
];

export function AdjustmentFields({ staff, defaultUserId, defaultDate, initial }: AdjustmentFieldsProps) {
  const [type, setType] = useState<AdjustmentType>(initial?.type ?? "PENALTY");

  return (
    <>
      {staff && (
        <label className="field-label">
          Nhân viên
          <select name="userId" required defaultValue={defaultUserId ?? ""} className="input">
            <option value="" disabled>
              Chọn nhân viên
            </option>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.fullName}
              </option>
            ))}
          </select>
        </label>
      )}
      <fieldset className="flex gap-2">
        <legend className="field-label mb-1.5">Loại</legend>
        {TYPES.map((t) => (
          <label
            key={t.value}
            className="flex h-11 flex-1 cursor-pointer items-center justify-center rounded-lg border border-stone-300 bg-white text-sm font-semibold text-stone-700 has-checked:border-red-600 has-checked:bg-red-600 has-checked:text-white"
          >
            <input
              type="radio"
              name="type"
              value={t.value}
              required
              checked={type === t.value}
              onChange={() => setType(t.value)}
              className="sr-only"
            />
            {t.label}
          </label>
        ))}
      </fieldset>
      {type === "PENALTY" && (
        <label className="field-label">
          Loại lỗi (tùy chọn, tự đặt)
          <input
            name="category"
            list={CATEGORY_LIST_ID}
            maxLength={50}
            defaultValue={initial?.category ?? ""}
            placeholder="Ví dụ: đi trễ, nghỉ không phép"
            className="input"
          />
        </label>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="field-label">
          Ngày
          <input type="date" name="date" required defaultValue={defaultDate} className="input" />
        </label>
        <label className="field-label">
          Số tiền (đ)
          <input
            name="amount"
            required
            inputMode="numeric"
            defaultValue={initial?.amount}
            placeholder="Ví dụ 20000"
            className="input"
          />
        </label>
      </div>
      <label className="field-label">
        Lý do
        <input
          name="reason"
          required
          maxLength={255}
          defaultValue={initial?.reason}
          placeholder="Ví dụ: đi trễ 30 phút"
          className="input"
        />
      </label>
    </>
  );
}
