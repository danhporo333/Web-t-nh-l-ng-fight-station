"use client";

import { useActionState } from "react";
import { ActionToast } from "@/shared/components/action-toast";
import { saveDayEntries } from "../actions";
import type { DayView } from "../types";
import { AttendanceRow } from "./attendance-row";
import { HolidayToggle } from "./holiday-toggle";

type DayEntriesFormProps = { view: DayView };

export function DayEntriesForm({ view }: DayEntriesFormProps) {
  const [state, action, pending] = useActionState(saveDayEntries, undefined);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="date" value={view.date} />
      <HolidayToggle initialNote={view.holiday} />
      {view.rows.map((row) => (
        <AttendanceRow key={row.userId} row={row} defaultHours={view.defaultHours} />
      ))}
      <ActionToast state={state} successText="Đã lưu chấm công" />
      <button type="submit" disabled={pending} className="btn-primary sticky bottom-4 shadow-lg">
        {pending ? "Đang lưu..." : "Lưu chấm công"}
      </button>
    </form>
  );
}
