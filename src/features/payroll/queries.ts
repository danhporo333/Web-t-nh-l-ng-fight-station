import { prisma } from "@/lib/prisma";

const SELECT = { id: true, username: true, fullName: true, isActive: true } as const;

// Nhân viên đang làm, cộng thêm người đã nghỉ nhưng có dữ liệu trong tháng (extraIds).
export function findStaffForPayroll(extraIds: number[]) {
  return prisma.user.findMany({
    where: { role: "STAFF", OR: [{ isActive: true }, { id: { in: extraIds } }] },
    select: SELECT,
    orderBy: { fullName: "asc" },
  });
}

export function findStaffById(id: number) {
  return prisma.user.findFirst({ where: { id, role: "STAFF" }, select: SELECT });
}
