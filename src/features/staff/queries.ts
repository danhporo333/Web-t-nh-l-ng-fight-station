import { prisma } from "@/lib/prisma";
import type { StaffFilter } from "./types";

// Không bao giờ select passwordHash ở các hàm trả dữ liệu ra ngoài.
const STAFF_SELECT = {
  id: true,
  username: true,
  fullName: true,
  isActive: true,
  defaultRate: true,
} as const;

export function findStaffList(filter: StaffFilter) {
  return prisma.user.findMany({
    where: {
      role: "STAFF",
      ...(filter === "active" ? { isActive: true } : {}),
      ...(filter === "inactive" ? { isActive: false } : {}),
    },
    select: STAFF_SELECT,
    orderBy: { fullName: "asc" },
  });
}

export function findUserRole(id: number) {
  return prisma.user.findUnique({ where: { id }, select: { id: true, role: true } });
}

export function insertStaff(data: {
  username: string;
  fullName: string;
  passwordHash: string;
  defaultRate: number | null;
}) {
  return prisma.user.create({
    data: { ...data, role: "STAFF" },
    select: STAFF_SELECT,
  });
}

export function updateStaffById(id: number, data: { fullName: string; defaultRate: number | null }) {
  return prisma.user.update({ where: { id }, data, select: STAFF_SELECT });
}

export function updateStaffPassword(id: number, passwordHash: string) {
  return prisma.user.update({ where: { id }, data: { passwordHash }, select: { id: true } });
}

export function updateStaffActive(id: number, isActive: boolean) {
  return prisma.user.update({ where: { id }, data: { isActive }, select: STAFF_SELECT });
}
