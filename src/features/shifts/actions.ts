"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth";
import { fail, type ActionResult } from "@/lib/result";
import { updateShiftSchema } from "./schemas";
import { updateShiftSettings } from "./service";

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function updateShift(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  await requireOwner();
  const parsed = updateShiftSchema.safeParse({
    id: field(formData, "id"),
    startTime: field(formData, "startTime"),
    endTime: field(formData, "endTime"),
    defaultHours: field(formData, "defaultHours"),
    defaultRate: field(formData, "defaultRate"),
  });
  if (!parsed.success) {
    return fail("SHIFT_001", parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ", parsed.error.flatten());
  }
  const { id, ...input } = parsed.data;
  const result = await updateShiftSettings(id, input);
  if (result.success) revalidatePath("/admin/shifts");
  return result;
}
