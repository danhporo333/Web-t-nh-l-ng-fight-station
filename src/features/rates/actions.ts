"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth";
import { fail, type ActionResult } from "@/lib/result";
import { monthSchema, saveRatesSchema } from "./schemas";
import { ensureMonthRatesFor, saveRatesFor } from "./service";

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function ensureMonthRates(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  await requireOwner();
  const month = monthSchema.safeParse(field(formData, "month"));
  if (!month.success) return fail("COMMON_002", "Tháng sai định dạng");
  const result = await ensureMonthRatesFor(month.data);
  if (result.success) revalidatePath("/admin/rates");
  return result;
}

export async function saveMonthlyRates(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  await requireOwner();
  const month = monthSchema.safeParse(field(formData, "month"));
  if (!month.success) return fail("COMMON_002", "Tháng sai định dạng");

  // Mỗi nhân viên gửi ba trường: userId, morning-<id>, afternoon-<id>.
  const userIds = formData.getAll("userId").filter((v): v is string => typeof v === "string");
  const entries = userIds.map((id) => ({
    userId: id,
    morningRate: field(formData, `morning-${id}`),
    afternoonRate: field(formData, `afternoon-${id}`),
  }));

  const parsed = saveRatesSchema.safeParse({ month: month.data, entries });
  if (!parsed.success) {
    const rateIssue = parsed.error.issues.find(
      (i) => i.path.includes("morningRate") || i.path.includes("afternoonRate"),
    );
    if (rateIssue) return fail("RATE_001", rateIssue.message, parsed.error.flatten());
    return fail("COMMON_001", parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ", parsed.error.flatten());
  }

  const result = await saveRatesFor(parsed.data.month, parsed.data.entries);
  if (result.success) revalidatePath("/admin/rates");
  return result;
}
