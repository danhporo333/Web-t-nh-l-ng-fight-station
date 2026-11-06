"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth";
import { fail, type ActionResult } from "@/lib/result";
import { saveDayEntriesSchema } from "./schemas";
import { saveDayEntriesFor } from "./service";

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function shiftFrom(formData: FormData, key: "morning" | "afternoon", id: string) {
  if (formData.get(`${key}-${id}`) !== "on") return undefined;
  return { hours: text(formData, `${key}Hours-${id}`), note: text(formData, `${key}Note-${id}`) };
}

export async function saveDayEntries(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  await requireOwner();

  // Mỗi nhân viên gửi: userId, off-<id>, morning-<id>, morningHours-<id>, morningNote-<id>, và tương tự cho ca chiều.
  const userIds = formData.getAll("userId").filter((v): v is string => typeof v === "string");
  const entries = userIds.map((id) => ({
    userId: id,
    off: formData.get(`off-${id}`) === "on",
    morning: shiftFrom(formData, "morning", id),
    afternoon: shiftFrom(formData, "afternoon", id),
  }));

  const parsed = saveDayEntriesSchema.safeParse({ date: text(formData, "date"), entries });
  if (!parsed.success) {
    const issues = parsed.error.issues;
    if (issues.some((i) => i.path[0] === "date")) {
      return fail("COMMON_002", "Ngày sai định dạng", parsed.error.flatten());
    }
    const hoursIssue = issues.find((i) => i.path.includes("hours"));
    if (hoursIssue) return fail("ATT_001", hoursIssue.message, parsed.error.flatten());
    return fail("COMMON_001", issues[0]?.message ?? "Dữ liệu không hợp lệ", parsed.error.flatten());
  }

  const result = await saveDayEntriesFor(parsed.data.date, parsed.data.entries);
  if (result.success) {
    revalidatePath("/admin/attendance");
    revalidatePath("/admin/payroll");
    revalidatePath("/me");
  }
  return result;
}
