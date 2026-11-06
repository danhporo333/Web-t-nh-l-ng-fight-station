"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth";
import { fail, type ActionResult } from "@/lib/result";
import { createAdjustmentSchema, deleteAdjustmentSchema, updateAdjustmentSchema } from "./schemas";
import { createAdjustmentFor, deleteAdjustmentFor, updateAdjustmentFor } from "./service";

type Issue = { path: PropertyKey[]; message: string };

// Đổi lỗi zod thành mã lỗi trong API_SPEC.md.
function invalid(issues: Issue[], details: unknown): ActionResult<never> {
  const by = (field: string) => issues.find((i) => i.path[0] === field);
  const amount = by("amount");
  if (amount) return fail("ADJ_001", amount.message, details);
  const reason = by("reason");
  if (reason) return fail("ADJ_002", reason.message, details);
  const date = by("date");
  if (date) return fail("COMMON_002", date.message, details);
  return fail("COMMON_001", issues[0]?.message ?? "Dữ liệu không hợp lệ", details);
}

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function done<T>(result: ActionResult<T>): ActionResult<T> {
  if (result.success) {
    revalidatePath("/admin/adjustments");
    revalidatePath("/admin/payroll");
    revalidatePath("/me");
  }
  return result;
}

export async function createAdjustment(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  await requireOwner();
  const parsed = createAdjustmentSchema.safeParse({
    userId: field(formData, "userId"),
    date: field(formData, "date"),
    type: field(formData, "type"),
    amount: field(formData, "amount"),
    reason: field(formData, "reason"),
  });
  if (!parsed.success) return invalid(parsed.error.issues, parsed.error.flatten());
  return done(await createAdjustmentFor(parsed.data));
}

export async function updateAdjustment(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  await requireOwner();
  const parsed = updateAdjustmentSchema.safeParse({
    id: field(formData, "id"),
    date: field(formData, "date"),
    type: field(formData, "type"),
    amount: field(formData, "amount"),
    reason: field(formData, "reason"),
  });
  if (!parsed.success) return invalid(parsed.error.issues, parsed.error.flatten());
  const { id, ...input } = parsed.data;
  return done(await updateAdjustmentFor(id, input));
}

export async function deleteAdjustment(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  await requireOwner();
  const parsed = deleteAdjustmentSchema.safeParse({ id: field(formData, "id") });
  if (!parsed.success) return invalid(parsed.error.issues, parsed.error.flatten());
  return done(await deleteAdjustmentFor(parsed.data.id));
}
