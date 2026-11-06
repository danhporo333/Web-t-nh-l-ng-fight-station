import { prisma } from "@/lib/prisma";

// Nhân viên đang làm, cộng thêm người đã nghỉ việc nhưng có dữ liệu trong tháng (extraIds).
export function findStaffForStats(extraIds: number[]) {
  return prisma.user.findMany({
    where: { role: "STAFF", OR: [{ isActive: true }, { id: { in: extraIds } }] },
    select: { id: true, username: true, fullName: true, isActive: true },
    orderBy: { fullName: "asc" },
  });
}
