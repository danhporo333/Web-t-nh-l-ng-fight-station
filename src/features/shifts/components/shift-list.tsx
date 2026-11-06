import type { ShiftItem } from "../types";
import { ShiftForm } from "./shift-form";

type ShiftListProps = { shifts: ShiftItem[] };

export function ShiftList({ shifts }: ShiftListProps) {
  return (
    <div className="flex flex-col gap-4">
      {shifts.map((shift) => (
        <ShiftForm key={shift.id} shift={shift} />
      ))}
    </div>
  );
}
