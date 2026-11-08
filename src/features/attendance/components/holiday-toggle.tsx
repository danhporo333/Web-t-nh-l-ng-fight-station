"use client";

import { useState } from "react";

type HolidayToggleProps = {
  // Tên ngày lễ đã lưu của ngày này, null nếu chưa đánh dấu
  initialNote: string | null;
};

// Ô đánh dấu ngày lễ cho cả ngày. Tích thì lương ca của mọi người có ca hôm đó được nhân đôi.
export function HolidayToggle({ initialNote }: HolidayToggleProps) {
  const [on, setOn] = useState(initialNote !== null);

  return (
    <div className="card flex flex-col gap-3 border-amber-200 bg-amber-50/60">
      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          name="holiday"
          checked={on}
          onChange={(e) => setOn(e.target.checked)}
          className="size-5 accent-red-600"
        />
        <span className="font-semibold text-stone-900">Ngày lễ (lương ca nhân đôi)</span>
      </label>
      {on && (
        <label className="field-label">
          Tên ngày lễ
          <input
            name="holidayNote"
            maxLength={255}
            defaultValue={initialNote ?? ""}
            placeholder="Ví dụ: Giỗ Tổ Hùng Vương"
            className="input"
          />
        </label>
      )}
    </div>
  );
}
