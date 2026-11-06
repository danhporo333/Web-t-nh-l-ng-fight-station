import { prisma } from "@/lib/prisma";
import { dateToDb } from "@/shared/utils/date";
import { monthRange, nextMonth } from "@/shared/utils/month";
import type { AdjustmentInput } from "./types";

const SELECT = {
  id: true,
  userId: true,
  date: true,
  type: true,
  amount: true,
  reason: true,
  category: true,
  user: { select: { fullName: true } },
} as const;

// Lọc theo tháng bằng khoảng: >= đầu tháng và < đầu tháng sau.
export function findAdjustmentsByMonth(month: string, userId?: number) {
  return prisma.adjustment.findMany({
    where: {
      date: { gte: dateToDb(`${month}-01`), lt: dateToDb(`${nextMonth(month)}-01`) },
      ...(userId ? { userId } : {}),
    },
    select: SELECT,
    orderBy: [{ date: "desc" }, { id: "desc" }],
  });
}

export function findAdjustmentId(id: number) {
  return prisma.adjustment.findUnique({ where: { id }, select: { id: true } });
}

export function findUserRole(id: number) {
  return prisma.user.findUnique({ where: { id }, select: { id: true, role: true } });
}

export function findActiveStaff() {
  return prisma.user.findMany({
    where: { role: "STAFF", isActive: true },
    select: { id: true, fullName: true },
    orderBy: { fullName: "asc" },
  });
}

export function insertAdjustment(input: AdjustmentInput) {
  return prisma.adjustment.create({
    data: { ...input, date: dateToDb(input.date) },
    select: SELECT,
  });
}

export function updateAdjustmentById(id: number, input: Omit<AdjustmentInput, "userId">) {
  return prisma.adjustment.update({
    where: { id },
    data: { ...input, date: dateToDb(input.date) },
    select: SELECT,
  });
}

export function deleteAdjustmentById(id: number) {
  return prisma.adjustment.delete({ where: { id }, select: { id: true } });
}

export function sumAdjustmentsByUserAndType(month: string, userId?: number) {
  const { start, end } = monthRange(month);
  return prisma.adjustment.groupBy({
    by: ["userId", "type"],
    where: { date: { gte: start, lt: end }, ...(userId ? { userId } : {}) },
    _sum: { amount: true },
  });
}

export function findPenaltyCategories() {
  return prisma.adjustment.findMany({
    where: { type: "PENALTY", category: { not: null } },
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });
}

export function sumPenaltiesByUserAndCategory(month: string) {
  const { start, end } = monthRange(month);
  return prisma.adjustment.groupBy({
    by: ["userId", "category"],
    where: { type: "PENALTY", date: { gte: start, lt: end } },
    _count: { _all: true },
    _sum: { amount: true },
  });
}
