import { prisma } from "@/lib/prisma";

export function findActiveStaff() {
  return prisma.user.findMany({
    where: { role: "STAFF", isActive: true },
    select: { id: true, username: true, fullName: true, defaultRate: true },
    orderBy: { fullName: "asc" },
  });
}

export function findRatesByMonth(month: string) {
  return prisma.monthlyRate.findMany({
    where: { month },
    select: { userId: true, morningRate: true, afternoonRate: true },
  });
}

export async function findShiftDefaultRates() {
  const shifts = await prisma.shift.findMany({ select: { code: true, defaultRate: true } });
  const rate = (code: "MORNING" | "AFTERNOON") => shifts.find((s) => s.code === code)?.defaultRate;
  return { morning: rate("MORNING"), afternoon: rate("AFTERNOON") };
}

// skipDuplicates: chạy lại hoặc chạy song song không ghi đè dòng đã có.
export function insertRates(
  rows: { userId: number; month: string; morningRate: number; afternoonRate: number }[],
) {
  return prisma.monthlyRate.createMany({ data: rows, skipDuplicates: true });
}

export function updateRates(
  month: string,
  rows: { userId: number; morningRate: number; afternoonRate: number }[],
) {
  return prisma.$transaction(
    rows.map((r) =>
      prisma.monthlyRate.update({
        where: { userId_month: { userId: r.userId, month } },
        data: { morningRate: r.morningRate, afternoonRate: r.afternoonRate },
      }),
    ),
  );
}
