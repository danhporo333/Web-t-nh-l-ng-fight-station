"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth";
import { fail, type ActionResult } from "@/lib/result";
import {
  createStaffSchema,
  resetPasswordSchema,
  setStaffActiveSchema,
  updateStaffSchema,
} from "./schemas";
import {
  changeStaffActive,
  createStaffAccount,
  resetStaffPassword,
  updateStaffAccount,
} from "./service";

type Issue = { path: PropertyKey[]; message: string };

// Lỗi ở ô lương mặc định dùng RATE_001, các lỗi khác dùng COMMON_001.
function invalid(issues: Issue[], details: unknown): ActionResult<never> {
  const rateIssue = issues.find((i) => i.path[0] === "defaultRate");
  if (rateIssue) return fail("RATE_001", rateIssue.message, details);
  return fail("COMMON_001", issues[0]?.message ?? "Dữ liệu không hợp lệ", details);
}

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function done<T>(result: ActionResult<T>): ActionResult<T> {
  if (result.success) revalidatePath("/admin/staff");
  return result;
}

export async function createStaff(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  await requireOwner();
  const parsed = createStaffSchema.safeParse({
    username: field(formData, "username"),
    fullName: field(formData, "fullName"),
    password: field(formData, "password"),
    defaultRate: field(formData, "defaultRate"),
  });
  if (!parsed.success) return invalid(parsed.error.issues, parsed.error.flatten());
  return done(await createStaffAccount(parsed.data));
}

export async function updateStaff(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  await requireOwner();
  const parsed = updateStaffSchema.safeParse({
    id: field(formData, "id"),
    fullName: field(formData, "fullName"),
    defaultRate: field(formData, "defaultRate"),
  });
  if (!parsed.success) return invalid(parsed.error.issues, parsed.error.flatten());
  const { id, ...input } = parsed.data;
  return done(await updateStaffAccount(id, input));
}

export async function resetPassword(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  await requireOwner();
  const parsed = resetPasswordSchema.safeParse({
    id: field(formData, "id"),
    newPassword: field(formData, "newPassword"),
  });
  if (!parsed.success) return invalid(parsed.error.issues, parsed.error.flatten());
  return done(await resetStaffPassword(parsed.data.id, parsed.data.newPassword));
}

export async function setStaffActive(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  await requireOwner();
  const parsed = setStaffActiveSchema.safeParse({
    id: field(formData, "id"),
    isActive: field(formData, "isActive"),
  });
  if (!parsed.success) return invalid(parsed.error.issues, parsed.error.flatten());
  return done(await changeStaffActive(parsed.data.id, parsed.data.isActive));
}
