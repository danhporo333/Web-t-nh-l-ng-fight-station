import bcrypt from "bcryptjs";
import { fail, ok, type ActionResult } from "@/lib/result";
import type { Role } from "@/lib/session";
import { findPasswordHash, findUserForLogin, updatePasswordHash } from "./queries";

// Hash giả để thời gian phản hồi gần như nhau khi tên đăng nhập không tồn tại.
const DUMMY_HASH = bcrypt.hashSync("khong-ai-dung-mat-khau-nay", 10);

export async function verifyLogin(
  username: string,
  password: string,
): Promise<ActionResult<{ userId: number; role: Role }>> {
  const user = await findUserForLogin(username);
  const valid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !user.isActive || !valid) {
    return fail("AUTH_001", "Sai tên đăng nhập hoặc mật khẩu");
  }
  return ok({ userId: user.id, role: user.role });
}

export async function changeUserPassword(
  userId: number,
  oldPassword: string,
  newPassword: string,
): Promise<ActionResult<{ changed: true }>> {
  const user = await findPasswordHash(userId);
  if (!user || !(await bcrypt.compare(oldPassword, user.passwordHash))) {
    return fail("AUTH_004", "Mật khẩu cũ không đúng");
  }
  await updatePasswordHash(userId, await bcrypt.hash(newPassword, 10));
  return ok({ changed: true });
}
