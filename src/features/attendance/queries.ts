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

export function findHolidayByDate(date: string) {
  return prisma.holidayDay.findUnique({ where: { workDate: dateToDb(date) }, select: { note: true } });
}

export function findHolidaysInMonth(month: string) {
  const { start, end } = monthRange(month);
  return prisma.holidayDay.findMany({
    where: { workDate: { gte: start, lt: end } },
    select: { workDate: true, note: true },
  });
}

// Ghi theo kiểu thay thế: xóa dòng cũ của các người này trong ngày rồi ghi mới, trong một giao dịch.
export function replaceDayEntries(date: string, userIds: number[], entries: NewEntry[]) {
  const workDate = dateToDb(date);
  return prisma.$transaction([
    prisma.workEntry.deleteMany({ where: { workDate, userId: { in: userIds } } }),
    prisma.workEntry.createMany({ data: entries.map((e) => ({ ...e, workDate })) }),
  ]);
}

// Ngày lễ: { note } thì tạo hoặc cập nhật dòng, null thì xóa dòng (ngày không còn là lễ).
export type HolidayInput = { note: string } | null;

export function replaceHolidayDay(date: string, holiday: HolidayInput) {
  const workDate = dateToDb(date);
  if (!holiday) return prisma.holidayDay.deleteMany({ where: { workDate } });
  return prisma.holidayDay.upsert({
    where: { workDate },
    create: { workDate, note: holiday.note },
    update: { note: holiday.note },
  });
}

// Tổng giờ theo ca của những ngày cho trước (dùng cho ngày lễ).
export function sumHoursByUserAndShiftOnDates(dates: Date[], userId?: number) {
  if (dates.length === 0) return Promise.resolve([]);
  return prisma.workEntry.groupBy({
    by: ["userId", "shiftId"],
    where: { isOff: false, workDate: { in: dates }, ...(userId ? { userId } : {}) },
    _sum: { hours: true },
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

export function findOffEntriesInMonth(month: string) {
  const { start, end } = monthRange(month);
  return prisma.workEntry.findMany({
    where: { isOff: true, workDate: { gte: start, lt: end } },
    select: { userId: true, workDate: true },
    orderBy: { workDate: "asc" },
  });
}
