import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { fail, ok, type ActionResult } from "@/lib/result";
import {
  findStaffList,
  findUserRole,
  insertStaff,
  updateStaffActive,
  updateStaffById,
  updateStaffPassword,
} from "./queries";
import type { StaffFilter, StaffItem } from "./types";

const NOT_FOUND = () => fail("STAFF_002", "Không tìm thấy nhân viên");

export function listStaff(filter: StaffFilter = "all"): Promise<StaffItem[]> {
  return findStaffList(filter);
}

// Chỉ thao tác trên tài khoản nhân viên. Tài khoản chủ quán coi như không tồn tại.
async function findStaffId(id: number): Promise<boolean> {
  const user = await findUserRole(id);
  return user !== null && user.role === "STAFF";
}

export async function createStaffAccount(input: {
  username: string;
  fullName: string;
  password: string;
  defaultRate: number | null;
}): Promise<ActionResult<StaffItem>> {
  try {
    const created = await insertStaff({
      username: input.username,
      fullName: input.fullName,
      defaultRate: input.defaultRate,
      passwordHash: await bcrypt.hash(input.password, 10),
    });
    return ok(created);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return fail("STAFF_001", "Tên đăng nhập đã tồn tại");
    }
    throw e;
  }
}

export async function updateStaffAccount(
  id: number,
  input: { fullName: string; defaultRate: number | null },
): Promise<ActionResult<StaffItem>> {
  if (!(await findStaffId(id))) return NOT_FOUND();
  return ok(await updateStaffById(id, input));
}

export async function resetStaffPassword(
  id: number,
  newPassword: string,
): Promise<ActionResult<{ reset: true }>> {
  if (!(await findStaffId(id))) return NOT_FOUND();
  await updateStaffPassword(id, await bcrypt.hash(newPassword, 10));
  return ok({ reset: true });
}

export async function changeStaffActive(
  id: number,
  isActive: boolean,
): Promise<ActionResult<StaffItem>> {
  const user = await findUserRole(id);
  if (!user) return NOT_FOUND();
  if (user.role === "OWNER") return fail("STAFF_003", "Không thể khóa tài khoản chủ quán");
  return ok(await updateStaffActive(id, isActive));
}
