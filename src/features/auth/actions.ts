"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { fail, type ActionResult } from "@/lib/result";
import { createSession, deleteSession } from "@/lib/session";
import { changePasswordSchema, loginSchema } from "./schemas";
import { changeUserPassword, verifyLogin } from "./service";

export async function login(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return fail("AUTH_001", "Sai tên đăng nhập hoặc mật khẩu");
  }

  const result = await verifyLogin(parsed.data.username, parsed.data.password);
  if (!result.success) {
    console.error("AUTH_001 đăng nhập thất bại", { username: parsed.data.username });
    return result;
  }

  await createSession(result.data);
  redirect(result.data.role === "OWNER" ? "/admin" : "/me");
}

export async function logout(): Promise<void> {
  await requireUser();
  await deleteSession();
  redirect("/login");
}

export async function changePassword(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = changePasswordSchema.safeParse({
    oldPassword: formData.get("oldPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ";
    return fail("AUTH_004", first, parsed.error.flatten());
  }

  const result = await changeUserPassword(user.id, parsed.data.oldPassword, parsed.data.newPassword);
  if (!result.success) {
    console.error(`${result.error.code} đổi mật khẩu thất bại`, { userId: user.id });
  }
  return result;
}
