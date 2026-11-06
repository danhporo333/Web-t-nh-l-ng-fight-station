import { prisma } from "@/lib/prisma";
import { dateToDb } from "@/shared/utils/date";
import { monthRange } from "@/shared/utils/month";

export function findActiveStaff() {
  return prisma.user.findMany({
    where: { role: "STAFF", isActive: true },
    select: { id: true, username: true, fullName: true },
    orderBy: { fullName: "asc" },
  });
}

export function findStaffByIds(ids: number[]) {
  return prisma.user.findMany({
    where: { id: { in: ids } },
    select: { id: true, role: true, isActive: true },
  });
}

export function findShifts() {
  return prisma.shift.findMany({ select: { id: true, code: true, defaultHours: true } });
}

export function findEntriesByDate(date: string) {
  return prisma.workEntry.findMany({
    where: { workDate: dateToDb(date) },
    select: { userId: true, isOff: true, hours: true, note: true, shift: { select: { code: true } } },
  });
}

export type NewEntry = {
  userId: number;
  shiftId: number | null;
  hours: number;
  isOff: boolean;
  note: string | null;
};

// Ghi theo kiểu thay thế: xóa dòng cũ của các người này trong ngày rồi ghi mới, trong một giao dịch.
export function replaceDayEntries(date: string, userIds: number[], entries: NewEntry[]) {
  const workDate = dateToDb(date);
  return prisma.$transaction([
    prisma.workEntry.deleteMany({ where: { workDate, userId: { in: userIds } } }),
    prisma.workEntry.createMany({ data: entries.map((e) => ({ ...e, workDate })) }),
  ]);
}

export function sumHoursByUserAndShift(month: string, userId?: number) {
  const { start, end } = monthRange(month);
  return prisma.workEntry.groupBy({
    by: ["userId", "shiftId"],
    where: { isOff: false, workDate: { gte: start, lt: end }, ...(userId ? { userId } : {}) },
    _sum: { hours: true },
  });
}

export function findUserEntriesInMonth(userId: number, month: string) {
  const { start, end } = monthRange(month);
  return prisma.workEntry.findMany({
    where: { userId, workDate: { gte: start, lt: end } },
    select: { workDate: true, isOff: true, hours: true, note: true, shift: { select: { code: true } } },
    orderBy: [{ workDate: "asc" }, { id: "asc" }],
  });
}
