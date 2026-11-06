import { fail, ok, type ActionResult } from "@/lib/result";
import { findAllShifts, findShiftById, updateShiftById } from "./queries";
import type { ShiftItem } from "./types";

type ShiftRow = Awaited<ReturnType<typeof findAllShifts>>[number];

function toShiftItem(row: ShiftRow): ShiftItem {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    startTime: row.startTime,
    endTime: row.endTime,
    defaultHours: Number(row.defaultHours),
    defaultRate: row.defaultRate,
  };
}

export async function getShifts(): Promise<ShiftItem[]> {
  return (await findAllShifts()).map(toShiftItem);
}

export async function updateShiftSettings(
  id: number,
  input: { startTime: string; endTime: string; defaultHours: number; defaultRate: number },
): Promise<ActionResult<ShiftItem>> {
  if (!(await findShiftById(id))) return fail("COMMON_001", "Không tìm thấy ca");
  return ok(toShiftItem(await updateShiftById(id, input)));
}
