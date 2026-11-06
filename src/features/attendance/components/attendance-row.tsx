"use client";

import { useState } from "react";
import type { DayEntryRow } from "../types";

type AttendanceRowProps = {
  row: DayEntryRow;
  defaultHours: { morning: number; afternoon: number };
};

type ShiftKey = "morning" | "afternoon";

const LABELS: Record<ShiftKey, string> = { morning: "Ca sáng", afternoon: "Ca chiều" };

function chipClass(selected: boolean, tone: "shift" | "off") {
  const on = tone === "off" ? "border-stone-700 bg-stone-700 text-white" : "border-red-600 bg-red-600 text-white";
  const off = "border-stone-300 bg-white text-stone-700 hover:bg-stone-50";
  return `flex h-11 flex-1 cursor-pointer items-center justify-center rounded-lg border text-sm font-semibold select-none ${selected ? on : off}`;
}

export function AttendanceRow({ row, defaultHours }: AttendanceRowProps) {
  const [off, setOff] = useState(row.off);
  const [on, setOn] = useState({ morning: row.morning !== null, afternoon: row.afternoon !== null });
  const [hours, setHours] = useState({
    morning: String(row.morning?.hours ?? defaultHours.morning),
    afternoon: String(row.afternoon?.hours ?? defaultHours.afternoon),
  });
  const id = row.userId;

  function toggleShift(key: ShiftKey, checked: boolean) {
    setOn((s) => ({ ...s, [key]: checked }));
    if (checked) {
      setOff(false);
      setHours((h) => (h[key].trim() === "" ? { ...h, [key]: String(defaultHours[key]) } : h));
    }
  }

  function toggleOff(checked: boolean) {
    setOff(checked);
    if (checked) setOn({ morning: false, afternoon: false });
  }

  return (
    <div className="card flex flex-col gap-3">
      <input type="hidden" name="userId" value={id} />
      <div>
        <p className="font-semibold text-stone-900">{row.fullName}</p>
        <p className="text-sm text-stone-500">{row.username}</p>
      </div>
      <div className="flex gap-2">
        {(["morning", "afternoon"] as const).map((key) => (
          <label key={key} className={chipClass(on[key], "shift")}>
            <input
              type="checkbox"
              name={`${key}-${id}`}
              checked={on[key]}
              onChange={(e) => toggleShift(key, e.target.checked)}
              className="sr-only"
            />
            {LABELS[key]}
          </label>
        ))}
        <label className={chipClass(off, "off")}>
          <input
            type="checkbox"
            name={`off-${id}`}
            checked={off}
            onChange={(e) => toggleOff(e.target.checked)}
            className="sr-only"
          />
          Off
        </label>
      </div>
      {(["morning", "afternoon"] as const).map(
        (key) =>
          on[key] && (
            <div key={key} className="grid grid-cols-[6rem_1fr] gap-3">
              <label className="field-label">
                {LABELS[key]} (giờ)
                <input
                  name={`${key}Hours-${id}`}
                  inputMode="decimal"
                  value={hours[key]}
                  onChange={(e) => setHours((h) => ({ ...h, [key]: e.target.value }))}
                  className="input"
                />
              </label>
              <label className="field-label">
                Ghi chú
                <input
                  name={`${key}Note-${id}`}
                  maxLength={255}
                  defaultValue={row[key]?.note ?? ""}
                  placeholder="Ví dụ: về sớm lúc 13h"
                  className="input"
                />
              </label>
            </div>
          ),
      )}
    </div>
  );
}
