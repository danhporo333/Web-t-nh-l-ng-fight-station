import { prisma } from "@/lib/prisma";

export function findAllShifts() {
  return prisma.shift.findMany({ orderBy: { id: "asc" } });
}

export function findShiftById(id: number) {
  return prisma.shift.findUnique({ where: { id }, select: { id: true } });
}

export function updateShiftById(
  id: number,
  data: { startTime: string; endTime: string; defaultHours: number; defaultRate: number },
) {
  return prisma.shift.update({ where: { id }, data });
}
